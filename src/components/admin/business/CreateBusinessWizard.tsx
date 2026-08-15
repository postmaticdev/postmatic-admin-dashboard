import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createManagedBusiness, type CreateManagedBusinessPayload } from "@/lib/business-api";
import { cn } from "@/lib/utils";

import { ImageUploadField } from "./ImageUploadField";
import { getErrorMessage } from "./mappers";

const BUSINESS_QUERY_KEY = ["workspace", "businesses"] as const;

const steps = [
  {
    title: "Business Knowledge",
    description: "Lengkapi identitas dan informasi utama business.",
    imageUrl: "/businessknowledge.PNG",
  },
  {
    title: "Product Knowledge",
    description: "Tambahkan produk utama yang ditawarkan business.",
    imageUrl: "/productknowledge.PNG",
  },
  {
    title: "Role Knowledge",
    description: "Atur karakter komunikasi dan tentukan owner business.",
    imageUrl: "/roleknowledge.PNG",
  },
] as const;

const businessCategories = [
  "Technology",
  "Information Technology",
  "Food & Beverage",
  "Retail & E-commerce",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Other",
];

const currencies = ["IDR", "USD", "SGD", "MYR"];

const countryCodes = [
  { label: "+62", value: "62" },
  { label: "+1", value: "1" },
  { label: "+44", value: "44" },
  { label: "+60", value: "60" },
  { label: "+65", value: "65" },
  { label: "+61", value: "61" },
  { label: "+81", value: "81" },
  { label: "+82", value: "82" },
];

type FormErrors = Record<string, string>;

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, error, required = true, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function normalizeColor(value: string) {
  return value
    .replace(/^#/, "")
    .replace(/[^0-9a-f]/gi, "")
    .slice(0, 6)
    .toUpperCase();
}

function colorInputValue(value: string) {
  return /^[0-9A-F]{6}$/.test(value) ? `#${value}` : "#3B82F6";
}

function normalizeHashtag(value: string) {
  return value.trim().replace(/^#+/, "").replace(/\s+/g, "");
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CreateBusinessWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [knowledge, setKnowledge] = useState({
    name: "",
    category: "Technology",
    primaryLogoUrl: "",
    description: "",
    websiteUrl: "",
    colorTone: "FFFFFF",
    businessPhone: "",
    countryCode: "62",
  });
  const [product, setProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    currency: "IDR",
    imageUrl: "",
  });
  const [role, setRole] = useState({
    targetAudience: "",
    tone: "",
    hashtags: [] as string[],
  });
  const [hashtagInput, setHashtagInput] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const createMutation = useMutation({
    mutationFn: createManagedBusiness,
    onSuccess: async (business) => {
      await queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY });
      toast.success("Business baru berhasil dibuat.");
      void navigate({
        to: "/workspace/business/$businessId/knowledge-base",
        params: { businessId: String(business.id) },
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal membuat business baru."));
    },
  });

  const clearError = (key: string) => {
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateKnowledge = (key: keyof typeof knowledge, value: string) => {
    setKnowledge((current) => ({ ...current, [key]: value }));
    clearError(key);
  };

  const updateProduct = (key: keyof typeof product, value: string) => {
    setProduct((current) => ({ ...current, [key]: value }));
    clearError(`product.${key}`);
  };

  const updateRole = (key: "targetAudience" | "tone", value: string) => {
    setRole((current) => ({ ...current, [key]: value }));
    clearError(`role.${key}`);
  };

  const addHashtags = (rawValues: string[]) => {
    const values = rawValues.map(normalizeHashtag).filter(Boolean);
    if (values.length === 0) return role.hashtags;

    const next = Array.from(new Set([...role.hashtags, ...values]));
    setRole((current) => ({ ...current, hashtags: next }));
    setHashtagInput("");
    clearError("role.hashtags");
    return next;
  };

  const commitHashtagInput = () => addHashtags(hashtagInput.split(/[\s,]+/));

  const removeHashtag = (hashtag: string) => {
    setRole((current) => ({
      ...current,
      hashtags: current.hashtags.filter((item) => item !== hashtag),
    }));
  };

  const validateStep = (step: number, submittedHashtags = role.hashtags) => {
    const nextErrors: FormErrors = {};

    if (step === 0) {
      if (!knowledge.primaryLogoUrl.trim())
        nextErrors.primaryLogoUrl = "Logo brand wajib diunggah.";
      if (!knowledge.name.trim()) nextErrors.name = "Nama brand wajib diisi.";
      if (!knowledge.category.trim()) nextErrors.category = "Kategori business wajib dipilih.";
      if (!knowledge.description.trim()) nextErrors.description = "Deskripsi business wajib diisi.";
      if (!knowledge.websiteUrl.trim()) {
        nextErrors.websiteUrl = "Website wajib diisi.";
      } else if (!isValidUrl(knowledge.websiteUrl.trim())) {
        nextErrors.websiteUrl = "Gunakan URL website yang valid.";
      }
      if (!knowledge.businessPhone.trim()) nextErrors.businessPhone = "Nomor telepon wajib diisi.";
      if (!knowledge.countryCode.trim()) nextErrors.countryCode = "Kode negara wajib dipilih.";
      if (!/^[0-9A-F]{6}$/.test(knowledge.colorTone)) {
        nextErrors.colorTone = "Color tone harus berisi 6 digit kode hex.";
      }
    }

    if (step === 1) {
      if (!product.imageUrl.trim()) nextErrors["product.imageUrl"] = "Foto produk wajib diunggah.";
      if (!product.name.trim()) nextErrors["product.name"] = "Nama produk wajib diisi.";
      if (!product.category.trim()) nextErrors["product.category"] = "Kategori produk wajib diisi.";
      if (!product.description.trim()) {
        nextErrors["product.description"] = "Deskripsi produk wajib diisi.";
      }
      if (!product.currency.trim()) nextErrors["product.currency"] = "Mata uang wajib dipilih.";
      if (!product.price || Number(product.price) <= 0) {
        nextErrors["product.price"] = "Harga produk harus lebih dari 0.";
      }
    }

    if (step === 2) {
      if (!role.targetAudience.trim()) {
        nextErrors["role.targetAudience"] = "Target audience wajib diisi.";
      }
      if (!role.tone.trim()) nextErrors["role.tone"] = "Tone komunikasi wajib diisi.";
      if (submittedHashtags.length === 0) {
        nextErrors["role.hashtags"] = "Tambahkan minimal satu hashtag.";
      }
      if (!ownerEmail.trim()) {
        nextErrors.ownerEmail = "Email owner wajib diisi.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
        nextErrors.ownerEmail = "Format email owner belum valid.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitBusiness = (submittedHashtags: string[]) => {
    const payload: CreateManagedBusinessPayload = {
      ownerEmail: ownerEmail.trim(),
      knowledge: {
        category: knowledge.category.trim(),
        description: knowledge.description.trim(),
        name: knowledge.name.trim(),
        primaryLogoUrl: knowledge.primaryLogoUrl.trim(),
        websiteUrl: knowledge.websiteUrl.trim(),
        colorTone: knowledge.colorTone,
        businessPhone: knowledge.businessPhone.trim(),
        countryCode: knowledge.countryCode,
      },
      role: {
        hashtags: submittedHashtags,
        targetAudience: role.targetAudience.trim(),
        tone: role.tone.trim(),
      },
      products: [
        {
          name: product.name.trim(),
          category: product.category.trim(),
          description: product.description.trim(),
          price: Number(product.price),
          currency: product.currency,
          imageUrls: [product.imageUrl.trim()],
        },
      ],
    };

    createMutation.mutate(payload);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep(currentStep)) {
        toast.error("Lengkapi semua kolom wajib sebelum melanjutkan.");
        return;
      }
      setCurrentStep((step) => step + 1);
      return;
    }

    const submittedHashtags = hashtagInput.trim()
      ? Array.from(
          new Set([
            ...role.hashtags,
            ...hashtagInput
              .split(/[\s,]+/)
              .map(normalizeHashtag)
              .filter(Boolean),
          ]),
        )
      : role.hashtags;

    if (submittedHashtags.length !== role.hashtags.length) {
      setRole((current) => ({ ...current, hashtags: submittedHashtags }));
      setHashtagInput("");
    }

    if (!validateStep(currentStep, submittedHashtags)) {
      toast.error("Lengkapi semua kolom wajib sebelum membuat business.");
      return;
    }

    submitBusiness(submittedHashtags);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleNext();
  };

  const handleHashtagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ",", " "].includes(event.key)) {
      event.preventDefault();
      commitHashtagInput();
    }
  };

  const handleCancel = () => {
    void navigate({ to: "/workspace/business" });
  };

  const step = steps[currentStep];
  const isSubmitting = createMutation.isPending;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <section className="flex min-w-0 flex-1 flex-col bg-card md:w-2/3 md:flex-none lg:w-2/5">
        <header className="flex min-h-20 items-center gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted"
            title="Kembali ke Business Management"
          >
            <img src="/logoblue.png" alt="Postmatic" className="h-10 w-10 object-contain" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Langkah {currentStep + 1} dari {steps.length}
              </span>
              <span aria-hidden="true">/</span>
              <span className="truncate">Create New Business</span>
            </div>
            <h1 className="mt-0.5 truncate text-xl font-bold text-foreground">{step.title}</h1>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <form id="create-business-form" onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
            <div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
                  <div>
                    <ImageUploadField
                      label="Logo Brand"
                      value={knowledge.primaryLogoUrl}
                      onChange={(value) => updateKnowledge("primaryLogoUrl", value)}
                      disabled={isSubmitting}
                    />
                    {errors.primaryLogoUrl && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                        <CircleAlert className="h-3.5 w-3.5" />
                        {errors.primaryLogoUrl}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-5">
                    <Field id="business-name" label="Nama Brand" error={errors.name}>
                      <Input
                        id="business-name"
                        value={knowledge.name}
                        onChange={(event) => updateKnowledge("name", event.target.value)}
                        placeholder="Masukkan nama brand"
                        disabled={isSubmitting}
                      />
                    </Field>

                    <Field id="business-category" label="Kategori Bisnis" error={errors.category}>
                      <select
                        id="business-category"
                        value={knowledge.category}
                        onChange={(event) => updateKnowledge("category", event.target.value)}
                        disabled={isSubmitting}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {businessCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                <Field id="business-description" label="Deskripsi" error={errors.description}>
                  <Textarea
                    id="business-description"
                    value={knowledge.description}
                    onChange={(event) => updateKnowledge("description", event.target.value)}
                    placeholder="Ceritakan secara singkat tentang business"
                    rows={4}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                </Field>

                <Field id="business-website" label="Website" error={errors.websiteUrl}>
                  <Input
                    id="business-website"
                    type="url"
                    value={knowledge.websiteUrl}
                    onChange={(event) => updateKnowledge("websiteUrl", event.target.value)}
                    placeholder="https://example.com"
                    disabled={isSubmitting}
                  />
                </Field>

                <Field
                  id="business-phone"
                  label="Nomor Telepon"
                  error={errors.countryCode || errors.businessPhone}
                >
                  <div className="flex gap-2">
                    <select
                      aria-label="Kode negara"
                      value={knowledge.countryCode}
                      onChange={(event) => updateKnowledge("countryCode", event.target.value)}
                      disabled={isSubmitting}
                      className="flex h-9 w-28 shrink-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      id="business-phone"
                      inputMode="numeric"
                      value={knowledge.businessPhone}
                      onChange={(event) =>
                        updateKnowledge("businessPhone", event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="85156031385"
                      disabled={isSubmitting}
                    />
                  </div>
                </Field>

                <Field id="business-color" label="Color Tone" error={errors.colorTone}>
                  <div className="flex gap-2">
                    <Input
                      aria-label="Pilih color tone"
                      type="color"
                      value={colorInputValue(knowledge.colorTone)}
                      onChange={(event) =>
                        updateKnowledge("colorTone", normalizeColor(event.target.value))
                      }
                      disabled={isSubmitting}
                      className="h-9 w-14 cursor-pointer p-1"
                    />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        #
                      </span>
                      <Input
                        id="business-color"
                        value={knowledge.colorTone}
                        onChange={(event) =>
                          updateKnowledge("colorTone", normalizeColor(event.target.value))
                        }
                        placeholder="FFFFFF"
                        maxLength={6}
                        disabled={isSubmitting}
                        className="pl-7 font-mono uppercase"
                      />
                    </div>
                  </div>
                </Field>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex w-full flex-col items-start gap-6 xl:flex-row">
                  <div>
                    <ImageUploadField
                      label="Foto Produk"
                      value={product.imageUrl}
                      onChange={(value) => updateProduct("imageUrl", value)}
                      disabled={isSubmitting}
                    />
                    {errors["product.imageUrl"] && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                        <CircleAlert className="h-3.5 w-3.5" />
                        {errors["product.imageUrl"]}
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-5">
                    <Field id="product-name" label="Nama Produk" error={errors["product.name"]}>
                      <Input
                        id="product-name"
                        value={product.name}
                        onChange={(event) => updateProduct("name", event.target.value)}
                        placeholder="Masukkan nama produk"
                        disabled={isSubmitting}
                      />
                    </Field>

                    <Field
                      id="product-category"
                      label="Kategori Produk"
                      error={errors["product.category"]}
                    >
                      <Input
                        id="product-category"
                        value={product.category}
                        onChange={(event) => updateProduct("category", event.target.value)}
                        placeholder="Contoh: Product Digital"
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                </div>

                <Field
                  id="product-description"
                  label="Deskripsi Produk"
                  error={errors["product.description"]}
                >
                  <Textarea
                    id="product-description"
                    value={product.description}
                    onChange={(event) => updateProduct("description", event.target.value)}
                    placeholder="Jelaskan produk secara singkat"
                    rows={4}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <Field id="product-currency" label="Mata Uang" error={errors["product.currency"]}>
                    <select
                      id="product-currency"
                      value={product.currency}
                      onChange={(event) => updateProduct("currency", event.target.value)}
                      disabled={isSubmitting}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field id="product-price" label="Harga" error={errors["product.price"]}>
                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="1"
                      value={product.price}
                      onChange={(event) => updateProduct("price", event.target.value)}
                      placeholder="350000"
                      disabled={isSubmitting}
                    />
                  </Field>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <Field
                  id="target-audience"
                  label="Target Audience"
                  error={errors["role.targetAudience"]}
                >
                  <Input
                    id="target-audience"
                    value={role.targetAudience}
                    onChange={(event) => updateRole("targetAudience", event.target.value)}
                    placeholder="Contoh: Warga dan pelaku UMKM"
                    disabled={isSubmitting}
                  />
                </Field>

                <Field id="content-tone" label="Content Tone" error={errors["role.tone"]}>
                  <Input
                    id="content-tone"
                    value={role.tone}
                    onChange={(event) => updateRole("tone", event.target.value)}
                    placeholder="Contoh: Warm"
                    disabled={isSubmitting}
                  />
                </Field>

                <Field id="business-hashtag" label="Hashtags" error={errors["role.hashtags"]}>
                  <div className="flex gap-2">
                    <Input
                      id="business-hashtag"
                      value={hashtagInput}
                      onChange={(event) => setHashtagInput(event.target.value)}
                      onKeyDown={handleHashtagKeyDown}
                      onPaste={(event) => {
                        const text = event.clipboardData.getData("text");
                        if (!/[\s,]/.test(text)) return;
                        event.preventDefault();
                        addHashtags(text.split(/[\s,]+/));
                      }}
                      placeholder="Ketik hashtag lalu tekan Enter"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={commitHashtagInput}
                      disabled={isSubmitting || !hashtagInput.trim()}
                      title="Tambahkan hashtag"
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {role.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {role.hashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-sm text-blue-700 dark:text-blue-300"
                        >
                          #{hashtag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(hashtag)}
                            disabled={isSubmitting}
                            title={`Hapus hashtag ${hashtag}`}
                            className="rounded-sm p-0.5 transition-colors hover:bg-blue-500/15"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>

                <div className="border-t border-border pt-5">
                  <Field id="owner-email" label="Email Owner" error={errors.ownerEmail}>
                    <Input
                      id="owner-email"
                      type="email"
                      autoComplete="email"
                      value={ownerEmail}
                      onChange={(event) => {
                        setOwnerEmail(event.target.value);
                        clearError("ownerEmail");
                      }}
                      placeholder="owner@example.com"
                      disabled={isSubmitting}
                    />
                  </Field>
                </div>
              </div>
            )}
          </form>
        </div>

        <footer className="border-t border-border bg-background p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Progress value={currentStep * 50} className="min-w-16 flex-1" />
            <div className="flex shrink-0 gap-2">
              {currentStep === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Batal
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setErrors({});
                    setCurrentStep((stepIndex) => stepIndex - 1);
                  }}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
              )}
              <Button
                type="submit"
                form="create-business-form"
                disabled={isSubmitting}
                className={cn(currentStep === steps.length - 1 && "min-w-32")}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : currentStep === steps.length - 1 ? (
                  <Check className="h-4 w-4" />
                ) : null}
                {isSubmitting
                  ? "Membuat..."
                  : currentStep === steps.length - 1
                    ? "Buat Business"
                    : "Selanjutnya"}
                {!isSubmitting && currentStep < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </footer>
      </section>

      <aside className="relative hidden min-w-0 flex-1 overflow-hidden md:block">
        <img
          src={step.imageUrl}
          alt={`Ilustrasi ${step.title}`}
          className="h-full w-full object-cover"
        />
      </aside>
    </div>
  );
}
