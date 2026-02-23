import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Видео не найдено</p>
        <Link to="/">
          <Button variant="ghost">На главную</Button>
        </Link>
      </div>
    );
  }

  const videoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/videos/${video.storage_path}`;

  return (
    <>
      <Helmet>
        <title>{video.title} — VidHost</title>
        <meta property="og:title" content={video.title} />
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:type" content={video.mime_type || "video/mp4"} />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </Link>

          {user?.id === video.user_id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? "Удаление..." : "Удалить"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить видео?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены? Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        await supabase.storage.from("videos").remove([video.storage_path]);
                        const { error } = await supabase.from("videos").delete().eq("id", video.id);
                        if (error) throw error;
                        toast.success("Видео удалено");
                        navigate("/");
                      } catch (err: any) {
                        toast.error(err.message || "Ошибка удаления");
                        setDeleting(false);
                      }
                    }}
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="overflow-hidden rounded-lg bg-black">
          <video
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            className="w-full"
            style={{ maxHeight: "75vh" }}
          >
            Ваш браузер не поддерживает видео.
          </video>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{video.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(video.created_at).toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              navigator.clipboard.writeText(videoUrl);
              setCopied(true);
              toast.success("Прямая ссылка скопирована");
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Скопировано" : "Ссылка для Rave"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Watch;
