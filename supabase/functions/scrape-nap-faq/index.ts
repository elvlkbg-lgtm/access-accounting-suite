const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch the NAP FAQ page
    let pageContent = '';
    try {
      const pageRes = await fetch('https://portal.nra.bg/details/questions-and-answers', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      pageContent = await pageRes.text();
      // Strip HTML tags for a rough text extraction
      pageContent = pageContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000);
    } catch (fetchErr) {
      console.error('Failed to fetch NAP page:', fetchErr);
      pageContent = 'Не може да се зареди страницата на НАП.';
    }

    const today = new Date().toISOString().split('T')[0];

    const aiResponse = await fetch('https://ai-gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Ти си експерт по българско счетоводство и данъци. Генерирай 10-15 често задавани въпроси и отговори на базата на съдържанието от НАП и актуални счетоводни теми. Всички цени ТРЯБВА да бъдат в евро (EUR/€). При конвертиране от лева използвай курс 1 EUR = 1.9558 лв. Отговори САМО с валиден JSON масив без markdown.`,
          },
          {
            role: 'user',
            content: `Днешна дата: ${today}. Ето съдържание от сайта на НАП (portal.nra.bg/details/questions-and-answers):

${pageContent}

Генерирай 10-15 ЧЗВ (често задавани въпроси) с отговори на български. Включи въпроси за:
- ДДС регистрация и прагове (в евро)
- Данъчни декларации и срокове
- Осигуровки (суми в евро)
- Счетоводно обслужване (цени в евро)
- Касови апарати
- Глоби и санкции (в евро)

Формат JSON масив:
[
  { "question": "Въпрос?", "answer": "Отговор с цени в евро (€)." }
]
Върни САМО JSON масива.`,
          },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content from AI');
    }

    let faqs;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      faqs = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(faqs) || faqs.length === 0) {
      throw new Error('AI returned empty or invalid FAQ array');
    }

    // Clear old FAQs and insert new ones
    await supabase.from('faq_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const toInsert = faqs.map((f: any) => ({
      question: f.question,
      answer: f.answer,
      source_url: 'https://portal.nra.bg/details/questions-and-answers',
      updated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase.from('faq_items').insert(toInsert);

    if (insertError) {
      throw new Error(`DB insert error: ${insertError.message}`);
    }

    console.log(`Successfully inserted ${toInsert.length} FAQ items`);

    return new Response(
      JSON.stringify({ success: true, count: toInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping NAP FAQ:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
