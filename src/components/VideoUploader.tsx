import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

const VideoUploader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file || !user || !title.trim()) {
      toast.error("Заполните название и выберите файл");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split(".").pop();
      const storagePath = `${user.id}/${Date.now()}.${ext}`;

      // Upload with XMLHttpRequest for progress tracking
      const formData = new FormData();
      formData.append("", file);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/storage/v1/object/videos/${storagePath}`;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed"));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("x-upsert", "true");
        xhr.send(file);
      });

      // Save to DB
      const { error: dbError } = await supabase.from("videos").insert({
        user_id: user.id,
        title: title.trim(),
        filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type || "video/mp4",
      });

      if (dbError) throw dbError;

      toast.success("Видео загружено!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите название видео"
          disabled={uploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video">Видеофайл</Label>
        <label
          htmlFor="video"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          {file ? (
            <>
              <Film className="h-10 w-10 text-primary" />
              <span className="text-sm text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Перетащите или выберите MP4 / WebM (до 2 ГБ)
              </span>
            </>
          )}
          <input
            id="video"
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              if (selected && selected.size > MAX_FILE_SIZE) {
                toast.error("Файл слишком большой. Максимум 2 ГБ");
                return;
              }
              setFile(selected);
            }}
          />
        </label>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">{progress}%</p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={uploading || !file || !title.trim()}
        className="w-full gradient-brand border-0"
        size="lg"
      >
        {uploading ? "Загрузка..." : "Загрузить видео"}
      </Button>
    </div>
  );
};

export default VideoUploader;
