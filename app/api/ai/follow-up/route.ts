import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // 60 seconds timeout for AWS Lambda

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { noteContent } = body;

    if (!noteContent) {
      return NextResponse.json({ message: "Missing noteContent. Please provide a clinical note." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a professional clinical assistant.
Your objective is to review a clinical note and generate a follow-up plan.
The response must be strictly in bullet points. Do not include introductory text or conclusions.
Provide specific, actionable steps for the clinician to take in the next session or for the patient to work on.`;

    const userPrompt = `Based on the following clinical note, how should I follow up with the patient? What should the next follow up session be?

--- CLINICAL NOTE ---
${noteContent}
--- END OF NOTE ---

Return strictly a bulleted list.`;

    const client = new GoogleGenAI({ apiKey });

    const interaction = await client.interactions.create({
      model: "gemini-3.5-flash",
      system_instruction: systemPrompt,
      input: userPrompt,
      generation_config: {
        temperature: 0.3,
      },
    });

    const generatedFollowUp = interaction.output_text || "";

    return NextResponse.json({ followUp: generatedFollowUp }, { status: 200 });
  } catch (error) {
    console.error("POST /api/ai/follow-up error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred during follow-up generation" },
      { status: 500 }
    );
  }
}
