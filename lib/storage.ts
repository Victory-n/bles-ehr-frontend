// lib/storage.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role — server only
);

const BUCKET = "bles-ehr-storage";

export async function uploadPatientDocument(
  patientId: string,
  folder: "documents" | "clinic-notes" | "compliance",
  file: Buffer,
  fileName: string,
  mimeType: string
) {
  const path = `patients/${patientId}/${folder}/${Date.now()}-${fileName}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: mimeType, upsert: false });

  if (error) throw error;
  return { path: data.path };
}

export async function getSignedUrl(storagePath: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(storagePath: string) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (error) throw error;
}
