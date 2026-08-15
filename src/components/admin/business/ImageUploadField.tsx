import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadCustomerServiceAttachment } from "@/lib/customer-service-api";
import { getErrorMessage } from "./mappers";

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const attachment = await uploadCustomerServiceAttachment(file);
      onChange(attachment.url);
      toast.success("Gambar berhasil diunggah.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengunggah gambar."));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        title={`Upload ${label.toLowerCase()}`}
        className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-50 sm:h-40 sm:w-40"
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin" />
            Mengunggah...
          </div>
        ) : value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Upload className="h-5 w-5 text-white" />
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-7 w-7" />
            Upload gambar
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={disabled || isUploading}
      />
    </div>
  );
}
