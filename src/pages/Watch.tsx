import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Watch = () => {
  const { id } = useParams<{ id: string }>();

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

  const videoUrl = `https://csfibixptjtulhrmjfpm.supabase.co/storage/v1/object/public/videos/${video.storage_path}`;

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
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </Link>

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

        <h1 className="mt-4 text-xl font-semibold text-foreground">{video.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </>
  );
};

export default Watch;
