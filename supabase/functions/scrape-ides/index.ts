const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASE_URL = 'https://www.ides.bg/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%8A%D1%80-%D0%B4%D0%B5%D1%81/%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%B0%D0%BD%D0%B8-%D0%BE%D0%B4%D0%B8%D1%82%D0%BE%D1%80%D0%B8/';

function extractText(html: string, after: string): string {
  const idx = html.indexOf(after);
  if (idx === -1) return '';
  const rest = html.substring(idx + after.length);
  const tdStart = rest.indexOf('<td>');
  if (tdStart === -1) return '';
  const tdEnd = rest.indexOf('</td>', tdStart);
  if (tdEnd === -1) return '';
  let val = rest.substring(tdStart + 4, tdEnd);
  // Strip HTML tags
  val = val.replace(/<[^>]*>/g, '').trim();
  return val === '-' ? '' : val;
}

function extractEmail(html: string): string {
  const match = html.match(/mailto:([^"]+)/);
  return match ? match[1] : '';
}

function extractPhone(html: string): string {
  const after = 'Телефон:';
  const idx = html.indexOf(after);
  if (idx === -1) return '';
  const section = html.substring(idx, idx + 300);
  const spanMatch = section.match(/<span>([^<]+)<\/span>/);
  return spanMatch ? spanMatch[1].trim() : '';
}

async function scrapeProfilePage(url: string): Promise<{
  city: string;
  ides_number: string;
  phone: string;
  email: string;
  qualification: string;
}> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    const idesNumber = extractText(html, 'Диплома / Регистрация №:');
    const status = extractText(html, 'Статус:');
    const cityRaw = extractText(html, 'Град:');
    // Remove postal code from city
    const city = cityRaw.replace(/\s*\d{4,}$/, '').trim();
    const phone = extractPhone(html);
    const email = extractEmail(html);
    
    return { city, ides_number: idesNumber, phone, email, qualification: status || 'Дипломиран експерт-счетоводител' };
  } catch (e) {
    console.error('Error scraping profile:', url, e);
    return { city: '', ides_number: '', phone: '', email: '', qualification: 'Дипломиран експерт-счетоводител' };
  }
}

async function scrapeListPage(page: number): Promise<{ name: string; url: string }[]> {
  const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
  const res = await fetch(url);
  const html = await res.text();
  
  const results: { name: string; url: string }[] = [];
  // Match all profile links
  const regex = /itemprop="name">([^<]+)<\/a>/g;
  const hrefRegex = /href="(https:\/\/www\.ides\.bg\/[^"]*\/)"[^>]*role="link"[^>]*itemprop="name">([^<]+)<\/a>/g;
  
  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    results.push({ url: match[1], name: match[2].trim() });
  }
  
  return results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page = 1, totalPages = 39 } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Process a single page at a time
    const pageNum = Math.min(Math.max(1, page), totalPages);
    console.log(`Scraping list page ${pageNum}...`);
    
    const entries = await scrapeListPage(pageNum);
    console.log(`Found ${entries.length} entries on page ${pageNum}`);
    
    const results = [];
    // Scrape detail pages in parallel batches of 5
    for (let i = 0; i < entries.length; i += 5) {
      const batch = entries.slice(i, i + 5);
      const details = await Promise.all(batch.map(async (entry) => {
        const detail = await scrapeProfilePage(entry.url);
        return {
          full_name: entry.name.replace(/\s+/g, ' ').trim(),
          source_url: entry.url,
          city: detail.city || null,
          ides_number: detail.ides_number || null,
          phone: detail.phone || null,
          email: detail.email || null,
          qualification: detail.qualification,
          specialization: ['Одит'],
        };
      }));
      results.push(...details);
    }
    
    // Upsert into database (use ides_number as unique key)
    if (results.length > 0) {
      const { error } = await supabase
        .from('auditor_directory')
        .upsert(results, { onConflict: 'ides_number', ignoreDuplicates: false });
      
      if (error) {
        console.error('DB error:', error);
        // Try inserting one by one if bulk fails
        let inserted = 0;
        for (const r of results) {
          const { error: singleErr } = await supabase
            .from('auditor_directory')
            .upsert(r, { onConflict: 'ides_number', ignoreDuplicates: true });
          if (!singleErr) inserted++;
        }
        return new Response(JSON.stringify({ 
          success: true, page: pageNum, total: results.length, inserted,
          message: `Partial insert: ${inserted}/${results.length}`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, page: pageNum, total: results.length,
      hasMore: pageNum < totalPages,
      nextPage: pageNum < totalPages ? pageNum + 1 : null
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
