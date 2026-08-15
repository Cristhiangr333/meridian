// Edge Function: ai-coach
// Recibe un resumen de trading del usuario y le pide a Claude un análisis
// breve y accionable. La llave de Anthropic vive SOLO aquí, nunca en el
// navegador — se configura como secret en Supabase (ANTHROPIC_API_KEY).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Falta configurar el secret ANTHROPIC_API_KEY en Supabase (Edge Functions → Secrets).",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system:
          "Eres el AI Coach de Meridian, un trading journal de nivel institucional. Hablas como un mentor de trading experto: directo, específico, basado en datos, sin relleno motivacional vacío. Respondes siempre en español, en 2-4 oraciones máximo. Señalas patrones concretos (setups, dirección, disciplina) y das UNA recomendación accionable. Nunca inventes cifras que no te dieron en el resumen.",
        messages: [
          {
            role: "user",
            content: `Aquí está el resumen de trading del usuario:\n\n${summary}\n\nDame tu análisis como AI Coach.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data?.error?.message ?? "Error llamando a la API de Claude.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const text =
      data.content?.[0]?.text ?? "No se pudo generar un análisis en este momento.";

    return new Response(JSON.stringify({ insight: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
