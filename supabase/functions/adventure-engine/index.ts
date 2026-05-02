import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.11.4";

const API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const genAI = new GoogleGenerativeAI(API_KEY);

Deno.serve(async (req) => {
  const { action, payload } = await req.json();

  if (action === "generateStory") {
    const { prompt, systemInstruction } = payload;
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return new Response(text, { headers: { "Content-Type": "application/json" } });
  }

  if (action === "generateImage") {
    // Note: Imagen is often accessed via Vertex AI or Google Cloud,
    // for this example we'll assume a simplified proxy or a placeholder
    // since the original code used a generic GoogleGenAI client which might be a mock or wrapper.
    // In a real scenario, you'd use Vertex AI SDK here.
    return new Response(JSON.stringify({ error: "Image generation via Edge Function requires Vertex AI setup." }), { status: 501 });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
});
