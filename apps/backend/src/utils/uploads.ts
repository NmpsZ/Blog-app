import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 7
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }

    callback(null, true);
  }
});

export async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-]/g, "-");
  const filename = `${Date.now()}-${base}${ext}`;

  const { data, error } = await supabase.storage
    .from("blog-images")
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
