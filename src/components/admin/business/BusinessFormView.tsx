import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
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
import { BusinessCategorySelect } from "./BusinessFormSelects";
import { CountryCodeSelect } from "./CountryCodeSelect";
import { ImageUploadField } from "./ImageUploadField";

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
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState(fallbackLogoUrl);
  const [businessPhone, setBusinessPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+62");
  const [colorTone, setColorTone] = useState("");

  useEffect(() => {
    if (!business) return;

    setName(business.name || "");
    setCategory(business.category || "");
    setDescription(business.description || "");
    setWebsiteUrl(business.websiteUrl || "");
    setLogoUrl(business.logoUrl || fallbackLogoUrl);
    setBusinessPhone(business.businessPhone || "");
    setCountryCode(normalizeCountryCode(business.countryCode));
    setColorTone(normalizeColorTone(business.colorTone));
  }, [business]);

  const logoPreviewUrl = logoUrl.trim() || fallbackLogoUrl;
  const colorPreview = colorInputValue(colorTone);
  const isSubmitDisabled = isSaving || isLoadingInitialData;
  const isBusinessDisabled = isSaving || isLoadingInitialData;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!business) return;
    if (
      !name.trim() ||
      !category.trim() ||
      !description.trim() ||
      !businessPhone.trim() ||
      !countryCode.trim() ||
      !/^[0-9A-F]{6}$/i.test(colorTone)
    ) {
      toast.error("Lengkapi semua kolom wajib dengan data yang valid.");
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
          <div className="flex flex-col items-start gap-3">
            <ImageUploadField
              label="Logo Brand"
              value={logoPreviewUrl}
              onChange={setLogoUrl}
              disabled={isBusinessDisabled}
            />
            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomLogo}
              disabled={isBusinessDisabled}
            >
              <Sparkles className="h-4 w-4" />
              Acak Logo
            </Button> */}
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

          <Field label="Kategori Bisnis" required>
            <BusinessCategorySelect
              value={category}
              onChange={setCategory}
              disabled={isBusinessDisabled}
            />
          </Field>
        </div>
      </div>

      {/* <Field label="Logo URL">
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={logoUrl}
            onChange={(event) => setLogoUrl(event.target.value)}
            placeholder="https://example.com/logo.png"
            disabled={isBusinessDisabled}
            className="pl-9"
          />
        </div>
      </Field> */}

      <Field label="Deskripsi" required>
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

      <Field label="Nomor Telepon" required>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={countryCode}
            onValueChange={setCountryCode}
            disabled={isBusinessDisabled}
          />
          <Input
            value={businessPhone}
            onChange={(event) => setBusinessPhone(event.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric"
            placeholder="81234567890"
            disabled={isBusinessDisabled}
          />
        </div>
      </Field>

      <Field label="Color Tone" required>
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
