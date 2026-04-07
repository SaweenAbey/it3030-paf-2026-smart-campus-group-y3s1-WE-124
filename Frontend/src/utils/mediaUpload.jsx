import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function mediaUpload(file) {
    if (!file) {
        throw new Error("No file selected");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are missing");
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const newFileName = `${Date.now()}-${safeName}`;

    try {
        const { error } = await supabase.storage
            .from("images")
            .upload(newFileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            throw new Error(error.message || "Storage upload failed");
        }

        const { data } = supabase.storage.from("images").getPublicUrl(newFileName);
        if (!data?.publicUrl) {
            throw new Error("Could not create public URL for uploaded image");
        }

        return data.publicUrl;
    } catch (error) {
        if (error?.message?.includes("Failed to fetch") || error?.message?.includes("ERR_NAME_NOT_RESOLVED")) {
            throw new Error("Cannot reach Supabase storage. Check internet and VITE_SUPABASE_URL");
        }
        throw new Error(`File Upload Failed: ${error?.message || "Unknown error"}`);
    }
}