import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeHashtags } from "./business-hashtag-utils";

interface BusinessHashtagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function BusinessHashtagInput({
  id,
  value,
  onChange,
  draft,
  onDraftChange,
  placeholder = "Ketik hashtag lalu tekan Enter",
  disabled = false,
  invalid = false,
}: BusinessHashtagInputProps) {
  const addHashtags = (rawValues: string[]) => {
    const next = normalizeHashtags([...value, ...rawValues]);
    if (next.length === value.length && rawValues.every((item) => !item.trim())) return;

    onChange(next);
    onDraftChange("");
  };

  const commitDraft = () => addHashtags([draft]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (["Enter", ",", " "].includes(event.key)) {
              event.preventDefault();
              commitDraft();
            }
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text");
            if (!/[\s,]/.test(text)) return;

            event.preventDefault();
            addHashtags(text.split(/[\s,]+/));
          }}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid}
          className={invalid ? "border-destructive focus-visible:ring-destructive" : undefined}
        />
        <Button
          type="button"
          size="icon"
          onClick={commitDraft}
          disabled={disabled || !draft.trim()}
          title="Tambahkan hashtag"
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((hashtag) => (
            <span
              key={hashtag}
              className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-1 text-sm text-blue-700 dark:text-blue-300"
            >
              #{hashtag}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== hashtag))}
                disabled={disabled}
                title={`Hapus hashtag ${hashtag}`}
                className="rounded-sm p-0.5 transition-colors hover:bg-blue-500/15 disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
