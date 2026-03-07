const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SOURCES = [
  {
    name: 'НАП',
    url: 'https://nra.bg/wps/portal/nra/nachalo',
    category: 'news',
  },
  {
    name: 'lex.bg',
    url: 'https://lex.bg/bg/news',
    category: 'news',
  },
  {
    name: 'Капитал - Данъци',
    url: 'https://www.capital.bg/biznes/finansi/',
    category: 'news',
  },
];

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

    // Use Lovable AI to generate blog content based on current Bulgarian accounting news
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
            content: `Ти си експерт по българско счетоводство, данъци и финансово законодателство. Генерирай 3 актуални статии на български език за днес (${today}). Статиите трябва да са базирани на реални теми от НАП, промени в законодателството, данъчни съвети или счетоводни ръководства. Отговори САМО с валиден JSON масив без markdown форматиране.`,
          },
          {
            role: 'user',
            content: `Генерирай 3 статии за днес ${today}. Включи микс от: новини от НАП, данъчни съвети, счетоводни ръководства. Формат JSON масив:
[
  {
    "title": "Заглавие на статията",
    "excerpt": "Кратко описание до 200 символа",
    "content": "Пълен текст на статията (минимум 500 символа, с параграфи)",
    "category": "news" или "tips" или "guides",
    "source_name": "НАП" или "lex.bg" или "Счетоводен съвет"
  }
]
Върни САМО JSON масива, без допълнителен текст.`,
          },
        ],
        temperature: 0.7,
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

    // Parse the JSON from AI response (handle potential markdown wrapping)
    let articles;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      articles = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      throw new Error('AI returned empty or invalid articles array');
    }

    // Insert articles into blog_articles table
    const toInsert = articles.map((a: any) => ({
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category || 'news',
      source_name: a.source_name || 'AI',
      published_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('blog_articles')
      .insert(toInsert);

    if (insertError) {
      throw new Error(`DB insert error: ${insertError.message}`);
    }

    console.log(`Successfully inserted ${toInsert.length} blog articles`);

    return new Response(
      JSON.stringify({ success: true, count: toInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating blog:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
