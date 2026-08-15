// Edge Function: ai-coach
// Recibe un resumen de trading del usuario y le pide a Claude un análisis
// breve y accionable. La llave de Anthropic vive SOLO aquí, nunca en el
// navegador — se configura como secret en Supabase (ANTHROPIC_API_KEY).

// Solo el dominio de producción y los previews de Vercel de ESTE proyecto
// (ej. meridian-git-feature-x-tuusuario.vercel.app) pueden llamar esta función.
// Si conectas un dominio propio más adelante, agrégalo aquí también.
const PRODUCTION_ORIGIN = "https://meridian-gray-nine.vercel.app";
const ALLOWED_ORIGIN_PATTERN = /^https:\/\/meridian(-[a-z0-9-]+)?\.vercel\.app$/;

function corsHeadersFor(origin: string | null) {
  const allowOrigin =
    origin && ALLOWED_ORIGIN_PATTERN.test(origin) ? origin : PRODUCTION_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req.headers.get("origin"));

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
        model: "claude-sonnet-5",
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
