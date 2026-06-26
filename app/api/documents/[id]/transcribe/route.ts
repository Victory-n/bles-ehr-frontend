import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getSupabase } from "@/lib/supabase";
import { storageService } from "@/lib/storage";
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

    // Find the document in the database
    const document = await prisma.document.findFirst({
      where: {
        OR: [{ id }, { documentId: id }],
        deletedAt: null,
      },
    });

    if (!document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    if (document.fileType !== "AUDIO") {
      return NextResponse.json({ message: "Document is not an audio file" }, { status: 400 });
    }

    // If transcript already exists, just return it to save API cost
    if (document.transcript) {
      return NextResponse.json({ transcript: document.transcript }, { status: 200 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase not configured" }, { status: 500 });
    }

    // Download file from Supabase storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from(storageService.PATIENT_FOLDERS_BUCKET)
      .download(document.storagePath);

    if (storageError || !fileData) {
      console.error("Supabase storage download error:", storageError);
      return NextResponse.json(
        { message: "Failed to download audio document from storage" },
        { status: 500 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Gemini API key not configured" }, { status: 500 });
    }

    const client = new GoogleGenAI({ apiKey });

    // Convert fileData to base64 for inline audio in Interactions API
    const arrayBuffer = await fileData.arrayBuffer();
    const rawMimeType = document.mimeType || "audio/webm";
    // Gemini Interactions API does not support audio/webm directly, but supports audio/opus (the codec WebM audio records with)
    const targetMimeType = rawMimeType.includes("webm") ? "audio/opus" : rawMimeType;
    
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // Run interaction to get transcription
    const interaction = await client.interactions.create({
      model: "gemini-3.5-flash",
      input: [
        {
          type: "text",
          text: "Generate a verbatim transcript of the speech. Return only the transcription. Do not include any introductory or concluding remarks, explanations, markdown formatting, or code blocks.",
        },
        {
          type: "audio",
          data: base64Audio,
          mime_type: targetMimeType as any,
        },
      ],
    });

    const transcriptText = interaction.output_text || "";

    // Update document with transcript
    await prisma.document.update({
      where: { id: document.id },
      data: { transcript: transcriptText },
    });

    return NextResponse.json({ transcript: transcriptText }, { status: 200 });
  } catch (error) {
    console.error("POST /api/documents/[id]/transcribe error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred during transcription" },
      { status: 500 }
    );
  }
}
