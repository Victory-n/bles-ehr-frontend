import { getSupabase } from "./supabase";

const PATIENT_FOLDERS_BUCKET = "Patient-folders";
const STAFF_FOLDERS_BUCKET = "Staff-folders";

const BUCKET_CONFIG = {
  public: false,
  fileSizeLimit: "50MB",
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "text/plain",
    "text/plain;charset=UTF-8",
    "audio/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/x-m4a",
  ],
};

export const storageService = {
  async ensureBucketsExist() {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase not configured - skipping bucket creation");
      return;
    }

    const { data: buckets } = await supabase.storage.listBuckets();
    const existingBuckets = new Set(buckets?.map((b) => b.name) || []);

    if (!existingBuckets.has(PATIENT_FOLDERS_BUCKET)) {
      await supabase.storage.createBucket(PATIENT_FOLDERS_BUCKET, BUCKET_CONFIG);
    } else {
      await supabase.storage.updateBucket(PATIENT_FOLDERS_BUCKET, BUCKET_CONFIG);
    }

    if (!existingBuckets.has(STAFF_FOLDERS_BUCKET)) {
      await supabase.storage.createBucket(STAFF_FOLDERS_BUCKET, BUCKET_CONFIG);
    } else {
      await supabase.storage.updateBucket(STAFF_FOLDERS_BUCKET, BUCKET_CONFIG);
    }
  },

  async createFolder(bucketName: string, folderPath: string) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase not configured - skipping folder creation");
      return;
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(`${folderPath}/.keep`, Buffer.from(""), {
        contentType: "text/plain",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(`Error creating folder ${folderPath} in ${bucketName}:`, error);
      throw error;
    }
  },

  async createPatientFolders(patientId: string) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase not configured - skipping storage folders");
      return;
    }

    await this.ensureBucketsExist();

    const basePath = `patients/${patientId}`;
    const folders = [
      basePath,
      `${basePath}/general`,
      `${basePath}/billing`,
      `${basePath}/compliance`,
      `${basePath}/clinic-notes`,
      `${basePath}/session-recordings`,
    ];

    for (const folder of folders) {
      await this.createFolder(PATIENT_FOLDERS_BUCKET, folder);
    }
  },

  async createStaffFolders(staffId: string) {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn("Supabase not configured - skipping storage folders");
      return;
    }

    await this.ensureBucketsExist();

    const basePath = `staff/${staffId}`;
    const folders = [
      basePath,
      `${basePath}/documents`,
      `${basePath}/personal`,
    ];

    for (const folder of folders) {
      await this.createFolder(STAFF_FOLDERS_BUCKET, folder);
    }
  },

  getPatientStoragePath(patientId: string, folderType: string, fileName: string) {
    const folderMap: Record<string, string> = {
      GENERAL: "general",
      BILLING: "billing",
      COMPLIANCE: "compliance",
      CLINIC_NOTES: "clinic-notes",
      SESSION_RECORDINGS: "session-recordings",
    };

    return {
      bucket: PATIENT_FOLDERS_BUCKET,
      path: `patients/${patientId}/${folderMap[folderType] || "general"}/${fileName}`,
    };
  },

  getStaffStoragePath(staffId: string, folderType: string, fileName: string) {
    const folderMap: Record<string, string> = {
      DOCUMENTS: "documents",
      PERSONAL: "personal",
    };

    return {
      bucket: STAFF_FOLDERS_BUCKET,
      path: `staff/${staffId}/${folderMap[folderType] || "documents"}/${fileName}`,
    };
  },

  PATIENT_FOLDERS_BUCKET,
  STAFF_FOLDERS_BUCKET,
};
