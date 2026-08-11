"use client";

import { useId, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Uploads into the PRIVATE `vault` bucket (migration 0081).
 *
 * ⚠️ THE BUCKET IS WRITE-ONLY FOR THE PUBLIC. Its policy grants INSERT to anon
 * and SELECT to super admins alone, and the bucket itself is `public = false`.
 * So this component returns storage PATHS, not URLs — there is no public URL to
 * return, which is the point. §20: an owner's title deed must not be one
 * guessed path away from the open internet, and §22 says the same about the
 * consent under which it was given.
 *
 * ⚠️ EVERY UPLOAD GETS ITS OWN UUID PREFIX. Two owners uploading `deed.pdf`
 * must not collide, and a predictable path is a browsable path.
 *
 * ⚠️ THE FILE IS RE-WRAPPED AS A BLOB before it is sent. Supabase Storage reads
 * the Blob's own `.type`, not the `contentType` option, when deciding what it
 * has been handed — and some browsers hand over a `File` with an empty type for
 * anything they do not recognise, which the bucket then rejects. Re-wrapping is
 * what makes a `.dwg` or an unusual PDF land instead of failing with a MIME
 * error the visitor cannot act on.
 */

const MAX_BYTES = 25 * 1024 * 1024; // the bucket's own cap, stated here so the
// message is a sentence rather than a 413.

export type UploadedFile = { path: string; name: string; size: number };

export function VaultUpload({
  label,
  hint,
  accept,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  accept?: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    if (!chosen.length) return;
    setBusy(true);
    setError(null);
    const done: UploadedFile[] = [];
    try {
      for (const file of chosen) {
        if (file.size > MAX_BYTES) {
          throw new Error(`${file.name} is larger than 25 MB. Send it to the desk instead.`);
        }
        const safe = file.name.replace(/[^\w.\-]+/g, "-").slice(-80);
        const path = `${crypto.randomUUID()}/${safe}`;
        const blob = new Blob([await file.arrayBuffer()], {
          type: file.type || "application/octet-stream",
        });
        const { error: upErr } = await supabase.storage
          .from("vault")
          .upload(path, blob, { contentType: blob.type, upsert: false });
        if (upErr) throw new Error(upErr.message);
        done.push({ path, name: file.name, size: file.size });
      }
      onChange([...value, ...done]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file could not be uploaded.");
    } finally {
      setBusy(false);
      // Let the same file be chosen again after an error.
      if (input.current) input.current.value = "";
    }
  }

  function remove(path: string) {
    // Removes it from the submission, not from storage — an anonymous visitor
    // has no delete grant on this bucket and should not have one. An orphaned
    // object is a housekeeping chore for the desk; a public delete grant is a
    // way to erase somebody else's documents.
    onChange(value.filter((f) => f.path !== path));
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </label>
      {hint ? <p className="mb-phi2 text-tiny text-ink-faint">{hint}</p> : null}

      <input
        ref={input}
        id={id}
        type="file"
        multiple
        accept={accept}
        onChange={pick}
        disabled={busy}
        className="block w-full cursor-pointer rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink-muted file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-canvas-sunken file:px-4 file:py-1.5 file:text-tiny file:font-semibold file:uppercase file:tracking-[0.12em] file:text-ink disabled:opacity-50"
      />

      {busy ? <p className="mt-phi2 text-tiny text-ink-faint">Uploading privately…</p> : null}
      {error ? (
        <p role="alert" className="mt-phi2 text-tiny text-jamin-red-deep">
          {error}
        </p>
      ) : null}

      {value.length > 0 && (
        <ul className="mt-phi2 space-y-1">
          {value.map((f) => (
            <li key={f.path} className="flex items-center justify-between gap-3 text-tiny text-ink-muted">
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => remove(f.path)}
                className="shrink-0 uppercase tracking-[0.12em] text-cta-deep"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
