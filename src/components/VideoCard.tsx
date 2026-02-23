import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface VideoCardProps {
  id: string;
  title: string;
  storagePath: string;
  createdAt: string;
  fileSize?: number | null;
}

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
};

const VideoCard = ({ id, title, storagePath, createdAt, fileSize }: VideoCardProps) => {
  const videoUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/videos/${storagePath}`;

  return (
    <Link
      to={`/watch/${id}`}
      className="group block animate-fade-in rounded-lg overflow-hidden bg-card border border-border transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <video
          src={videoUrl}
          className="h-full w-full object-cover"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-primary/90 p-3">
            <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-foreground line-clamp-2 text-sm">{title}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru })}
          </span>
          {fileSize && <span>{formatFileSize(fileSize)}</span>}
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
