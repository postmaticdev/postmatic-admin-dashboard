import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert, Edit3, Hash, Loader2, MessageCircle, Save, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertManagedBusinessRoleKnowledge,
  type RemoteBusinessRoleKnowledge,
} from "@/lib/business-api";
import { BusinessHashtagInput } from "./BusinessHashtagInput";
import { normalizeHashtags } from "./business-hashtag-utils";
import { getErrorMessage } from "./mappers";

interface RoleKnowledgeSectionProps {
  businessId: string;
  role?: RemoteBusinessRoleKnowledge | null;
  onChanged: () => void;
}

export function RoleKnowledgeSection({ businessId, role, onChanged }: RoleKnowledgeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtagError, setHashtagError] = useState("");

  const mutation = useMutation({
    mutationFn: (submittedHashtags: string[]) =>
      upsertManagedBusinessRoleKnowledge(businessId, {
        targetAudience: targetAudience.trim(),
        tone: tone.trim(),
        hashtags: submittedHashtags,
      }),
    onSuccess: () => {
      toast.success("Role knowledge berhasil diperbarui.");
      setIsOpen(false);
      onChanged();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal memperbarui role knowledge."));
    },
  });

  const openEditor = () => {
    setTargetAudience(role?.targetAudience ?? "");
    setTone(role?.tone ?? "");
    setHashtags(normalizeHashtags(role?.hashtags ?? []));
    setHashtagInput("");
    setHashtagError("");
    setIsOpen(true);
  };

  const items = [
    {
      icon: Users,
      label: "Target Audience",
      value: role?.targetAudience || "Belum tersedia",
      iconClass: "bg-amber-500/15 text-amber-600",
    },
    {
      icon: MessageCircle,
      label: "Content Tone",
      value: role?.tone || "Belum tersedia",
      iconClass: "bg-blue-500/15 text-blue-600",
    },
    {
      icon: Hash,
      label: "Hashtags",
      value: role?.hashtags?.join(", ") || "Belum tersedia",
      iconClass: "bg-fuchsia-500/15 text-fuchsia-600",
    },
  ];

  return (
    <>
      <section className="h-full rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">Role Knowledge</h2>
          <Button variant="ghost" size="icon" onClick={openEditor} title="Edit role knowledge">
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex min-w-0 items-center gap-3 rounded-md border p-3"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${item.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="truncate text-sm font-medium text-foreground" title={item.value}>
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={(open) => !mutation.isPending && setIsOpen(open)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Role Knowledge</DialogTitle>
            <DialogDescription>
              Atur audiens, gaya komunikasi, dan hashtag untuk business ini.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const submittedHashtags = normalizeHashtags([...hashtags, hashtagInput]);
              if (!targetAudience.trim() || !tone.trim() || submittedHashtags.length === 0) {
                setHashtagError(
                  submittedHashtags.length === 0 ? "Tambahkan minimal satu hashtag." : "",
                );
                toast.error("Target audience, content tone, dan hashtag wajib diisi.");
                return;
              }

              setHashtags(submittedHashtags);
              setHashtagInput("");
              setHashtagError("");
              mutation.mutate(submittedHashtags);
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Textarea
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
                placeholder="Contoh: Pemilik UMKM dan tim marketing"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Tone</label>
              <Input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Contoh: Hangat, profesional, dan ramah"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hashtags</label>
              <BusinessHashtagInput
                value={hashtags}
                onChange={(value) => {
                  setHashtags(value);
                  setHashtagError("");
                }}
                draft={hashtagInput}
                onDraftChange={setHashtagInput}
                disabled={mutation.isPending}
                invalid={Boolean(hashtagError)}
              />
              {hashtagError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                  {hashtagError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
