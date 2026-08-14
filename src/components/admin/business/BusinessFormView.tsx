import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { BusinessAccount, BusinessFormValues } from "./types";

interface BusinessFormViewProps {
  business: BusinessAccount | null;
  onSave: (data: BusinessFormValues, id?: string) => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  isLoadingInitialData?: boolean;
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const categories = [
  "Information Technology",
  "Food & Beverage",
  "Logistics & Supply Chain",
  "Healthcare",
  "Manufacturing",
  "Finance & Banking",
  "Retail & E-commerce",
  "Education",
];

const countryCodes = ["+62", "+1", "+44", "+60", "+65", "+61", "+81", "+82"];

const fallbackLogoUrl = "https://api.dicebear.com/7.x/initials/svg?seed=Biz&backgroundColor=4f46e5";

function Field({ label, required = false, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function normalizeCountryCode(value?: string) {
  if (!value?.trim()) return "+62";
  const trimmed = value.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

function normalizeColorTone(value?: string) {
  return value?.replace(/^#/, "").trim().toUpperCase() || "";
}

function colorInputValue(value: string) {
  return /^[0-9A-F]{6}$/i.test(value) ? `#${value}` : "#3B82F6";
}

export function BusinessFormView({
  business,
  onSave,
  onCancel,
  isSaving = false,
  isLoadingInitialData = false,
}: BusinessFormViewProps) {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Information Technology");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState(fallbackLogoUrl);
  const [businessPhone, setBusinessPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+62");
  const [colorTone, setColorTone] = useState("");

  useEffect(() => {
    if (!business) return;

    setName(business.name || "");
    setCategory(business.category || "Information Technology");
    setDescription(business.description || "");
    setWebsiteUrl(business.websiteUrl || "");
    setLogoUrl(business.logoUrl || fallbackLogoUrl);
    setBusinessPhone(business.businessPhone || "");
    setCountryCode(normalizeCountryCode(business.countryCode));
    setColorTone(normalizeColorTone(business.colorTone));
  }, [business]);

  const logoPreviewUrl = logoUrl.trim() || fallbackLogoUrl;
  const isUploadedLogo = logoUrl.startsWith("data:");
  const colorPreview = colorInputValue(colorTone);
  const isSubmitDisabled = isSaving || isLoadingInitialData;
  const isBusinessDisabled = isSaving || isLoadingInitialData;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLogoUrl(reader.result);
      } else {
        toast.error("Gagal membaca gambar.");
      }
    };
    reader.onerror = () => toast.error("Gagal membaca gambar.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRandomLogo = () => {
    const seed = encodeURIComponent(name.trim() || Math.random().toString(36).slice(2, 8));
    setLogoUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=4f46e5`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!business) return;
    if (!name.trim() || !category.trim()) {
      toast.error("Harap isi semua kolom wajib!");
      return;
    }

    onSave(
      {
        name: name.trim(),
        owner: business.owner || "Belum tersedia",
        category: category.trim(),
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        businessPhone: businessPhone.trim() || undefined,
        countryCode: countryCode.trim() || "+62",
        colorTone: colorTone.trim() || undefined,
        status: business.status || "Free",
        balance: business.balance || 0,
        logoUrl: logoUrl.trim() || fallbackLogoUrl,
        joinedAt: business.joinedAt || new Date().toISOString().split("T")[0],
      },
      business.id,
    );
  };

  const businessForm = (
    <div className="space-y-6">
      <div className="flex w-full flex-col items-start gap-6 md:flex-row">
        <div className="w-full space-y-3 md:w-44">
          <label className="text-sm font-medium text-foreground">Logo Brand</label>
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={isBusinessDisabled}
              title="Upload logo"
              className="group relative h-32 w-32 overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground transition-colors hover:border-primary disabled:pointer-events-none disabled:opacity-50"
            >
              <img
                src={logoPreviewUrl}
                alt="Business logo preview"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isBusinessDisabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomLogo}
              disabled={isBusinessDisabled}
            >
              <Sparkles className="h-4 w-4" />
              Acak Logo
            </Button>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Field label="Nama Brand" required>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Masukkan nama brand"
              disabled={isBusinessDisabled}
            />
          </Field>

          <Field label="Kategori" required>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isBusinessDisabled}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="Logo URL">
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={isUploadedLogo ? "" : logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder={
              isUploadedLogo ? "Gambar upload siap disimpan" : "https://example.com/logo.png"
            }
            disabled={isBusinessDisabled}
            className="pl-9"
          />
        </div>
      </Field>

      <Field label="Deskripsi">
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Deskripsi singkat bisnis"
          rows={3}
          disabled={isBusinessDisabled}
          className="resize-none"
        />
      </Field>

      <Field label="Website">
        <Input
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          placeholder="https://example.com"
          disabled={isBusinessDisabled}
        />
      </Field>

      <Field label="Phone">
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            disabled={isBusinessDisabled}
            className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {countryCodes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Input
            value={businessPhone}
            onChange={(event) => setBusinessPhone(event.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="81234567890"
            disabled={isBusinessDisabled}
          />
        </div>
      </Field>

      <Field label="Color Tone">
        <div className="flex gap-2">
          <Input
            type="color"
            value={colorPreview}
            onChange={(event) => setColorTone(normalizeColorTone(event.target.value))}
            disabled={isBusinessDisabled}
            className="h-9 w-14 cursor-pointer p-1"
          />
          <Input
            value={colorTone}
            onChange={(event) => setColorTone(normalizeColorTone(event.target.value))}
            placeholder="3B82F6"
            disabled={isBusinessDisabled}
          />
        </div>
      </Field>
    </div>
  );

  return (
    <Dialog
      open={Boolean(business)}
      onOpenChange={(open) => {
        if (!open && !isSaving) onCancel();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-lg">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Perbarui data knowledge business untuk {business?.name || "business ini"}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-6 pt-2">
            {isLoadingInitialData ? (
              <div className="flex min-h-80 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat data business...
              </div>
            ) : (
              businessForm
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
