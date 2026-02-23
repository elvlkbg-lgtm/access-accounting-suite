const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASE_LIST_URL = 'https://www.ides.bg/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%8A%D1%80-%D0%B4%D0%B5%D1%81/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%B0%D0%BD%D0%B8-%D0%BE%D0%B4%D0%B8%D1%82%D0%BE%D1%80%D0%B8/';
const SITE_BASE = 'https://www.ides.bg';

async function scrapeListPage(page: number): Promise<{ name: string; url: string; idesNumber: string }[]> {
  const url = page === 1 ? BASE_LIST_URL : `${BASE_LIST_URL}?page=${page}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const html = await res.text();
  
  const results: { name: string; url: string; idesNumber: string }[] = [];
  const hrefRegex = /href="([^"]+)"[^>]*itemprop="name">([^<]+)<\/a>/g;
  
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const profileUrl = match[1].startsWith('http') ? match[1] : `${SITE_BASE}${match[1]}`;
    const name = match[2].replace(/\s+/g, ' ').trim();
    // Extract IDES number from URL (last 4 digits before /)
    const idesMatch = match[1].match(/(\d{4})\/?$/);
    const idesNumber = idesMatch ? idesMatch[1] : '';
    results.push({ url: profileUrl, name, idesNumber });
  }
  
  return results;
}

async function scrapeProfileDetail(url: string): Promise<{ city: string; phone: string; email: string; qualification: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    
    // Extract city
    const cityMatch = html.match(/Град:<\/td>\s*<td>([^<]+)/);
    let city = cityMatch ? cityMatch[1].replace(/\s*\d{4,}$/, '').trim() : '';
    
    // Extract status/qualification
    const statusMatch = html.match(/Статус:<\/td>\s*<td>([^<]+)/);
    const qualification = statusMatch ? statusMatch[1].trim() : 'Дипломиран експерт-счетоводител';
    
    // Extract email
    const emailMatch = html.match(/mailto:([^"]+)/);
    const email = emailMatch ? emailMatch[1] : '';
    
    // Extract phone
    const phoneSection = html.match(/Телефон:<\/td>\s*<td>\s*(?:<span>)?([^<]+)/);
    const phone = phoneSection ? phoneSection[1].trim() : '';
    
    return { city, phone, email, qualification };
  } catch (e) {
    console.error('Error scraping:', url, e);
    return { city: '', phone: '', email: '', qualification: 'Дипломиран експерт-счетоводител' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { page = 1, totalPages = 39, mode = 'list' } = body;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (mode === 'list') {
      // Phase 1: Scrape list pages and insert basic entries
      const pageNum = Math.min(Math.max(1, page), totalPages);
      console.log(`Scraping list page ${pageNum}...`);
      
      const entries = await scrapeListPage(pageNum);
      console.log(`Found ${entries.length} entries on page ${pageNum}`);
      
      const records = entries.map(e => ({
        full_name: e.name,
        ides_number: e.idesNumber || null,
        source_url: e.url,
        qualification: 'Дипломиран експерт-счетоводител',
        specialization: ['Одит'],
      }));
      
      let inserted = 0;
      for (const r of records) {
        // Check if exists by full_name
        const { data: existing } = await supabase
          .from('auditor_directory')
          .select('id')
          .eq('full_name', r.full_name)
          .maybeSingle();
        
        if (existing) {
          // Update
          await supabase.from('auditor_directory').update(r).eq('id', existing.id);
          inserted++;
        } else {
          const { error } = await supabase.from('auditor_directory').insert(r);
          if (!error) inserted++;
          else console.error('Insert error:', r.full_name, error.message);
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, page: pageNum, found: entries.length, inserted,
        hasMore: pageNum < totalPages, nextPage: pageNum < totalPages ? pageNum + 1 : null
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    if (mode === 'details') {
      // Phase 2: Enrich existing entries with city, phone, email from detail pages
      const limit = body.limit || 10;
      const offset = body.offset || 0;
      
      const { data: entries } = await supabase
        .from('auditor_directory')
        .select('id, source_url, city')
        .is('city', null)
        .not('source_url', 'is', null)
        .range(offset, offset + limit - 1);
      
      if (!entries || entries.length === 0) {
        return new Response(JSON.stringify({ success: true, enriched: 0, done: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      let enriched = 0;
      // Process in parallel batches of 5
      for (let i = 0; i < entries.length; i += 5) {
        const batch = entries.slice(i, i + 5);
        const results = await Promise.all(batch.map(async (entry) => {
          const detail = await scrapeProfileDetail(entry.source_url!);
          return { id: entry.id, detail };
        }));
        
        for (const r of results) {
          const update: any = {};
          if (r.detail.city) update.city = r.detail.city;
          if (r.detail.phone) update.phone = r.detail.phone;
          if (r.detail.email) update.email = r.detail.email;
          if (r.detail.qualification) update.qualification = r.detail.qualification;
          
          if (Object.keys(update).length > 0) {
            await supabase.from('auditor_directory').update(update).eq('id', r.id);
            enriched++;
          }
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, enriched, processed: entries.length,
        hasMore: entries.length === limit
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid mode' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
