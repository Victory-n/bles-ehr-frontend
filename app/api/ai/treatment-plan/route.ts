import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; // 60 seconds timeout for AWS Lambda

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { sessionIds, instructions } = body;

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json({ message: "Missing required parameter: sessionIds array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
    }

    // Fetch notes from the specified sessions
    const documents = await prisma.document.findMany({
      where: {
        sessionId: { in: sessionIds },
        documentType: "CLINIC_NOTES",
        deletedAt: null
      },
      include: {
        session: true,
        clinicNote: {
          include: {
            versions: {
              orderBy: { version: "desc" },
              take: 1
            }
          }
        }
      }
    });

    const noteTexts = documents
      .map((doc) => {
        const latestVersion = doc.clinicNote?.versions[0];
        if (!latestVersion) return "";
        return `### Session: ${doc.session?.sessionId || "N/A"} (${doc.session?.name || "N/A"})
Date: ${doc.session?.startDate ? new Date(doc.session.startDate).toLocaleDateString() : "N/A"}
Clinical Log:
${latestVersion.content}`;
      })
      .filter(Boolean)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an expert clinical psychologist and professional documentation assistant.
Your task is to analyze the provided clinical logs and notes from therapy sessions and write a comprehensive, professional clinical Treatment Plan.

You must output a single JSON object containing the following keys:
- "title": A concise, clear name for the treatment plan (e.g., "Cognitive Behavioral Therapy for Anxiety Reduction").
- "diagnosis": A clinical impression or targeted diagnosis/problems mapped from the session logs.
- "goals": A structured, bulleted list of short-term and long-term goals with measurable objectives.
- "interventions": A structured, bulleted list of therapeutic interventions and modalities.
- "frequency": Recommended session frequency (e.g., "Once weekly", "Bi-weekly").
- "duration": Recommended treatment duration (e.g., "12 weeks", "6 months").
- "notes": A comprehensive narrative summarizing the client's clinical presentation, progress, and rationale for this treatment plan.

Ensure the output is strictly valid JSON conforming to this schema. Do not include markdown code block formatting (like \`\`\`json) outside the JSON structure.`;

    const userPrompt = `Based on the following session notes and instructions, generate a treatment plan:

--- SESSION NOTES LOGS ---
${noteTexts || "No specific session notes available. Base the plan on general therapeutic standards."}
--- END OF SESSION NOTES ---

Clinician's Special Focus / Custom Instructions:
${instructions || "None"}

Generate the JSON structure now.`;

    const client = new GoogleGenAI({ apiKey });

    const interaction = await client.interactions.create({
      model: "gemini-3.5-flash",
      system_instruction: systemPrompt,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
      },
      generation_config: {
        temperature: 0.3,
      },
    });

    const outputText = interaction.output_text || "{}";
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(outputText);
    } catch (e) {
      console.warn("Failed to parse Gemini output as JSON, returning raw text inside notes:", e);
      parsedPlan = {
        title: "Treatment Plan",
        diagnosis: "Deferred",
        goals: "- Define therapy goals",
        interventions: "- Regular session logs review",
        frequency: "Once weekly",
        duration: "12 weeks",
        notes: outputText
      };
    }

    return NextResponse.json({ plan: parsedPlan }, { status: 200 });
  } catch (error) {
    console.error("POST /api/ai/treatment-plan error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred during treatment plan generation" },
      { status: 500 }
    );
  }
}
