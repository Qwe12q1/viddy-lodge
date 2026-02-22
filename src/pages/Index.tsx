import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import VideoCard from "@/components/VideoCard";
import { Film } from "lucide-react";

const Index = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gradient">Видео</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-lg bg-card" />
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              storagePath={video.storage_path}
              createdAt={video.created_at}
              fileSize={video.file_size}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Film className="mb-4 h-16 w-16" />
          <p className="text-lg">Пока нет видео</p>
          <p className="text-sm">Загрузите первое видео, чтобы начать</p>
        </div>
      )}
    </div>
  );
};

export default Index;
