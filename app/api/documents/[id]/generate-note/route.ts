import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // 60 seconds timeout for AWS Lambda

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ message: "Missing templateId" }, { status: 400 });
    }

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        OR: [{ id }, { documentId: id }],
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    if (!document.transcript) {
      return NextResponse.json(
        { message: "This document has not been transcribed yet. Transcribe it first." },
        { status: 400 }
      );
    }

    // Find the template
    const template = await prisma.clinicalTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ message: "Clinical template not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
    }

    // Construct AI Prompt
    const systemPrompt = `You are a professional, HIPAA-compliant clinical assistant for a state-of-the-art Electronic Health Record (EHR) platform. 
Your objective is to generate structured, professional clinical notes based strictly on the raw transcript of a clinician-patient session.
Follow these guidelines carefully:
1. Formatting: Output the note in markdown formatting exactly following the template structure.
2. Clinical Integrity: Do not invent or hallucinate any symptoms, actions, diagnoses, or follow-up plans that are not supported or implied by the transcript.
3. Tone: Maintain a objective, formal, and clinical tone. Use professional medical/behavioral terminology.
4. Privacy: Do not expose raw identifiers or unneeded PHI.`;

    const userPrompt = `Generate a clinical note using the template and transcript details below:

--- TEMPLATE INFO ---
Name: ${template.name}
Description: ${template.description || "None"}
Structure Layout:
${template.structure}

Instructions:
${template.prompt || "Format the session transcript using the structure layout."}

--- RAW SESSION TRANSCRIPT ---
${document.transcript}

--- END OF TRANSCRIPT ---
Generate only the note contents matching the template layout. Do not add intro greetings like "Here is your note:" or outro comments.`;

    const client = new GoogleGenAI({ apiKey });

    const interaction = await client.interactions.create({
      model: "gemini-3.5-flash",
      system_instruction: systemPrompt,
      input: userPrompt,
      generation_config: {
        temperature: 0.3,
      },
    });

    const generatedNote = interaction.output_text || "";

    return NextResponse.json({ note: generatedNote }, { status: 200 });
  } catch (error) {
    console.error("POST /api/documents/[id]/generate-note error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred during note generation" },
      { status: 500 }
    );
  }
}
