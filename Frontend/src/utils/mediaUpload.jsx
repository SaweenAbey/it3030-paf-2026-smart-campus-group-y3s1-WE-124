import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function mediaUpload(file) {
    const promise = new Promise((resolve, reject) => {
        if (file == null) {
            reject("No file selected");
            return;
        }
        
        const timeStamp = new Date().getTime();
        const newFileName = timeStamp + file.name;

        supabase.storage
            .from("images")
            .upload(newFileName, file, {
                cacheControl: "3600",
                upsert: false,
            })
            .then((result) => {
                if (result.error) {
                    console.error("Upload error:", result.error);
                    reject("File Upload Failed: " + result.error.message);
                    return;
                }
                
                const url = supabase.storage
                    .from("images")
                    .getPublicUrl(newFileName).data.publicUrl;
                resolve(url);
            })
            .catch((error) => {
                console.error("Upload error:", error);
                reject("File Upload Failed: " + error.message);
            });
    });

    return promise;
}