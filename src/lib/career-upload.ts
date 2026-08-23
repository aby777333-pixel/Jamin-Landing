import { supabase } from "./supabase";

/**
 * The careers attachment uploader (owner 2026-08-23: "add upload image,
 * resume, word, as optional in everything").
 *
 * Kept out of the form component because three separate rules have to agree
 * and they are easier to keep in step in one file than scattered through JSX:
 * the bucket's `allowed_mime_types`, this module's `ACCEPT`, and the whitelist
 * inside `website_career_apply` (migration 0094). **Change one and change all
 * three** — the failure mode otherwise is a file the browser happily uploads
 * and the RPC then refuses, leaving an orphan in the bucket and a confusing
 * message on screen.
 */

export const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's 10 MB

/** The eight types the bucket accepts, mapped from the extensions people
 *  actually have. ⚠️ Must equal `allowed_mime_types` on `career-uploads`. */
const BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const ALLOWED = new Set(Object.values(BY_EXT));

/** What the file input offers. Extensions as well as wildcards, because
 *  Android's picker matches on extension and iOS on type. */
export const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,.doc,.docx,image/*,application/pdf";

export const ACCEPT_HINT = "Image, PDF or Word · up to 10 MB";

/**
 * 🚨 THE TYPE IS DECIDED BY THE EXTENSION, NOT BY `file.type`, AND THAT IS THE
 * WHOLE REASON THIS FUNCTION EXISTS.
 *
 * Supabase Storage validates a bucket's `allowed_mime_types` against the
 * **Blob's own `.type`** — not the `contentType` option passed to `.upload()`.
 * supabase-js appends the File to a FormData, so the multipart part carries
 * `file.type` and nothing else can override it.
 *
 * That matters here because browsers are unreliable about Office documents: a
 * `.docx` arrives as `application/octet-stream` from several Android pickers
 * and as an empty string from a few desktop file managers. Uploading such a
 * File as-is is rejected by the bucket with "mime type … is not supported",
 * which reads to the applicant as though their CV is broken.
 *
 * So the extension decides, and the file is re-wrapped in a new `File` carrying
 * that type before it goes anywhere.
 */
export function safeType(file: File): string | null {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const byExt = BY_EXT[ext];
  if (byExt) return byExt;
  // No usable extension — fall back to what the browser claims, but only if it
  // is one of the eight. Anything else is refused rather than guessed at.
  const claimed = (file.type || "").toLowerCase();
  return ALLOWED.has(claimed) ? claimed : null;
}

/**
 * ⚠️ THE NAME IS REWRITTEN TO MATCH THE SERVER'S PATH REGEX.
 * `website_career_apply` accepts `careers/<uuid>/<name>` where the name is
 * `[A-Za-z0-9._-]{1,160}`. Real filenames carry spaces, brackets, Tamil script
 * and `#`, every one of which would fail that check AFTER the upload had
 * already succeeded. The ORIGINAL name still travels to the desk in
 * `attachment_name`, so nothing is lost — only the storage key is sanitised.
 */
function safeName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-120);
  return cleaned.length >= 1 ? cleaned : "attachment";
}

export type Attachment = {
  path: string;
  name: string;
  type: string;
  size: number;
};

/** Human-readable, for the field's own "attached" line. */
export function prettySize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Checks a file WITHOUT uploading it, so the form can refuse instantly. */
export function checkFile(file: File): { ok: true; type: string } | { ok: false; error: string } {
  if (file.size <= 0) return { ok: false, error: "That file appears to be empty." };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `That file is ${prettySize(file.size)}. Please keep it under 10 MB.` };
  }
  const type = safeType(file);
  if (!type) {
    return { ok: false, error: "Please attach an image, a PDF or a Word document." };
  }
  return { ok: true, type };
}

/**
 * Uploads one file and returns what the RPC needs to record it.
 *
 * ⚠️ THE UPLOAD HAPPENS BEFORE THE APPLICATION IS WRITTEN, so a file whose
 * form submission then fails is left in the bucket with no row pointing at it.
 * That is a knowing trade: the alternative is writing the row first and
 * patching it after, which leaves the desk looking at an application that
 * claims an attachment nobody can open. An orphan is invisible and harmless —
 * the bucket is private, the path is a random uuid, and nothing lists it.
 * Sweep them with a scheduled job if the volume ever justifies one.
 */
export async function uploadCareerFile(file: File): Promise<Attachment> {
  const check = checkFile(file);
  if (!check.ok) throw new Error(check.error);

  const folder = crypto.randomUUID();
  const name = safeName(file.name);
  const path = `careers/${folder}/${name}`;

  // The re-wrap. See `safeType`.
  const body = new File([file], name, { type: check.type });

  const { error } = await supabase.storage.from("career-uploads").upload(path, body, {
    contentType: check.type,
    // ⚠️ `upsert: false`. The bucket grants anon INSERT and nothing else, so an
    // upsert would attempt an UPDATE that RLS refuses — and the path is a fresh
    // uuid every time, so there is never anything to overwrite.
    upsert: false,
  });
  if (error) throw new Error(error.message || "That file could not be uploaded.");

  return { path, name: file.name.slice(0, 160), type: check.type, size: file.size };
}
