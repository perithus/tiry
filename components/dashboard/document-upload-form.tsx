"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addVerificationDocument } from "@/lib/actions/company";

export function DocumentUploadForm({
  locale,
  allowedTypes,
  maxSizeMb
}: {
  locale: "pl" | "en";
  allowedTypes: string;
  maxSizeMb: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState("COMPANY_REGISTRATION");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <form
      className="mt-5 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          try {
            const formData = new FormData();
            formData.set("type", type);
            if (file) {
              formData.set("file", file);
            }
            await addVerificationDocument(formData);
            setSuccess(locale === "pl" ? "Dokument został dodany." : "Document has been added.");
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            router.refresh();
          } catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : locale === "pl" ? "Nie udało się dodać dokumentu." : "Unable to add document.");
          }
        });
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink-700">{locale === "pl" ? "Typ dokumentu" : "Document type"}</span>
        <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
          <option value="COMPANY_REGISTRATION">COMPANY_REGISTRATION</option>
          <option value="VAT_CERTIFICATE">VAT_CERTIFICATE</option>
          <option value="INSURANCE">INSURANCE</option>
          <option value="IDENTITY">IDENTITY</option>
          <option value="OTHER">OTHER</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-ink-700">{locale === "pl" ? "Plik" : "File"}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
        />
      </label>
      <p className="text-xs text-ink-500">
        {locale === "pl"
          ? `Dozwolone typy: ${allowedTypes}. Maksymalny rozmiar: ${maxSizeMb} MB.`
          : `Allowed types: ${allowedTypes}. Maximum size: ${maxSizeMb} MB.`}
      </p>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="text-sm text-teal-700">{success}</p> : null}
      <button disabled={pending} className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60">
        {pending ? (locale === "pl" ? "Dodawanie..." : "Adding...") : (locale === "pl" ? "Dodaj dokument" : "Add document")}
      </button>
    </form>
  );
}
