"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadListingImage } from "@/lib/actions/uploads";

export function ListingImageUploadForm({
  listingId,
  locale
}: {
  listingId: string;
  locale: "pl" | "en";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          try {
            const formData = new FormData();
            formData.set("listingId", listingId);
            formData.set("alt", alt);
            if (file) {
              formData.set("file", file);
            }
            await uploadListingImage(formData);
            setAlt("");
            setFile(null);
            setSuccess(locale === "pl" ? "Zdjęcie zostało dodane." : "Image uploaded successfully.");
            router.refresh();
          } catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : locale === "pl" ? "Nie udało się dodać zdjęcia." : "Unable to upload image.");
          }
        });
      }}
    >
      <input
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        placeholder={locale === "pl" ? "Opis zdjęcia" : "Image alt text"}
        className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
      />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="text-sm text-teal-700">{success}</p> : null}
      <div className="flex justify-end">
        <button disabled={pending} className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60">
          {pending ? (locale === "pl" ? "Dodawanie..." : "Uploading...") : (locale === "pl" ? "Dodaj zdjęcie" : "Upload image")}
        </button>
      </div>
    </form>
  );
}
