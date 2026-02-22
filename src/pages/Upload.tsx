import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import VideoUploader from "@/components/VideoUploader";
import { Upload as UploadIcon } from "lucide-react";

const Upload = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <UploadIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gradient">Загрузка видео</h1>
      </div>
      <VideoUploader />
    </div>
  );
};

export default Upload;
