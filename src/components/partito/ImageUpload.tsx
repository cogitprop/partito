import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onRemove, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // FIX: Track interval ID to clean up on unmount
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // FIX: Clean up interval on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Clear any existing interval before creating a new one
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 100);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxSize = 2048;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to webp to strip EXIF data
        const dataUrl = canvas.toDataURL("image/webp", 0.85);

        // FIX: Clear interval using ref
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setUploadProgress(100);

        setTimeout(() => {
          onChange(dataUrl);
          setIsUploading(false);
          setUploadProgress(0);
        }, 200);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  if (value) {
    return (
      <div className={cn("relative", className)}>
        <img src={value} alt="Event cover" className="w-full aspect-video object-cover rounded-lg" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-warm-gray-900 text-white flex items-center justify-center hover:bg-warm-gray-700 transition-colors"
            aria-label="Remove image"
          >
            <Icon name="x" size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-150 min-h-[180px]",
        isDragging ? "border-coral bg-coral/5" : "border-warm-gray-300 bg-transparent",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {isUploading ? (
        <>
          <div className="w-full max-w-[200px] h-2 bg-warm-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-coral transition-[width] duration-100" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="text-sm text-warm-gray-500">Uploading... {uploadProgress}%</span>
        </>
      ) : (
        <>
          <Icon name="image" size={48} className="text-warm-gray-400" />
          <span className="text-base text-warm-gray-700">Drag an image here or click to browse</span>
          <span className="text-sm text-warm-gray-500">JPG, PNG, WebP, or GIF up to 10MB</span>
          <span className="text-xs text-warm-gray-500 flex items-center gap-1">
            <Icon name="lock" size={12} /> Location data will be automatically removed
          </span>
        </>
      )}
    </div>
  );
};
