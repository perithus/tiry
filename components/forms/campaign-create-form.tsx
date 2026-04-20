"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createCampaign } from "@/lib/actions/campaigns";
import { type Locale } from "@/lib/i18n/shared";
import { Button } from "@/components/shared/button";
import {
  campaignPriorityValues,
  campaignSchema,
  campaignSourceValues,
  campaignStatusValues
} from "@/lib/validation/campaign";

type CampaignFormValues = z.infer<typeof campaignSchema>;

type Option = {
  id: string;
  label: string;
};

const copy = {
  en: {
    title: "Create internal campaign",
    description: "Link advertiser demand, marketplace listings, and internal ownership in a single CRM record.",
    name: "Campaign name",
    advertiser: "Advertiser",
    company: "Carrier company",
    listing: "Primary listing",
    inquiry: "Source inquiry",
    owner: "Campaign owner",
    status: "Status",
    priority: "Priority",
    source: "Source",
    budget: "Budget (cents)",
    start: "Planned start date",
    end: "Planned end date",
    brief: "Campaign brief",
    summary: "Internal summary",
    submit: "Create campaign",
    saving: "Creating campaign...",
    success: "Campaign created successfully.",
    genericError: "Unable to create campaign right now.",
    choose: "Select an option",
    unassigned: "Leave unassigned"
  },
  pl: {
    title: "Dodaj kampanię wewnętrzną",
    description: "Połącz popyt reklamodawcy, ofertę marketplace i wewnętrznego ownera w jednym rekordzie CRM.",
    name: "Nazwa kampanii",
    advertiser: "Reklamodawca",
    company: "Firma transportowa",
    listing: "Główna oferta",
    inquiry: "Źródłowe zapytanie",
    owner: "Owner kampanii",
    status: "Status",
    priority: "Priorytet",
    source: "Źródło",
    budget: "Budżet (w centach)",
    start: "Planowana data startu",
    end: "Planowana data końca",
    brief: "Brief kampanii",
    summary: "Podsumowanie wewnętrzne",
    submit: "Utwórz kampanię",
    saving: "Tworzenie kampanii...",
    success: "Kampania została utworzona.",
    genericError: "Nie udało się utworzyć kampanii.",
    choose: "Wybierz opcję",
    unassigned: "Bez przypisania"
  }
} as const;

const statusLabels = {
  en: {
    DRAFT: "Draft",
    PLANNING: "Planning",
    NEGOTIATION: "Negotiation",
    READY_TO_BOOK: "Ready to book",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  },
  pl: {
    DRAFT: "Szkic",
    PLANNING: "Planowanie",
    NEGOTIATION: "Negocjacje",
    READY_TO_BOOK: "Gotowa do bookingu",
    ACTIVE: "Aktywna",
    COMPLETED: "Zakończona",
    CANCELLED: "Anulowana"
  }
} as const;

const priorityLabels = {
  en: {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent"
  },
  pl: {
    LOW: "Niski",
    MEDIUM: "Średni",
    HIGH: "Wysoki",
    URGENT: "Pilny"
  }
} as const;

const sourceLabels = {
  en: {
    MARKETPLACE_INQUIRY: "Marketplace inquiry",
    DIRECT_SALES: "Direct sales",
    REFERRAL: "Referral",
    PARTNER: "Partner",
    OTHER: "Other"
  },
  pl: {
    MARKETPLACE_INQUIRY: "Zapytanie z marketplace",
    DIRECT_SALES: "Sprzedaż bezpośrednia",
    REFERRAL: "Polecenie",
    PARTNER: "Partner",
    OTHER: "Inne"
  }
} as const;

export function CampaignCreateForm({
  locale,
  advertisers,
  companies,
  listings,
  inquiries,
  owners
}: {
  locale: Locale;
  advertisers: Option[];
  companies: Option[];
  listings: Option[];
  inquiries: Option[];
  owners: Option[];
}) {
  const t = copy[locale];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const defaultValues = useMemo<CampaignFormValues>(
    () => ({
      name: "",
      advertiserId: advertisers[0]?.id ?? "",
      companyId: "",
      primaryListingId: "",
      inquiryId: "",
      ownerId: "",
      status: "PLANNING",
      priority: "MEDIUM",
      source: "MARKETPLACE_INQUIRY",
      brief: "",
      internalSummary: "",
      budgetCents: undefined,
      currency: "EUR",
      plannedStartDate: undefined,
      plannedEndDate: undefined
    }),
    [advertisers]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues
  });

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    startTransition(async () => {
      const result = await createCampaign(values);

      if (!result.ok) {
        setSubmitError(result.error ?? t.genericError);
        return;
      }

      setSubmitSuccess(t.success);
      reset(defaultValues);
      router.refresh();
      router.push(`/admin/campaigns/${result.campaignId}`);
    });
  });

  return (
    <div className="glass-panel p-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink-900">{t.title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-600">{t.description}</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Field label={t.name} error={errors.name?.message} className="md:col-span-2">
          <input {...register("name")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>

        <Field label={t.advertiser} error={errors.advertiserId?.message}>
          <select {...register("advertiserId")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            {advertisers.map((advertiser) => (
              <option key={advertiser.id} value={advertiser.id}>
                {advertiser.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.owner} error={errors.ownerId?.message}>
          <select {...register("ownerId")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">{t.unassigned}</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.company} error={errors.companyId?.message}>
          <select {...register("companyId")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">{t.choose}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.listing} error={errors.primaryListingId?.message}>
          <select {...register("primaryListingId")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">{t.choose}</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.inquiry} error={errors.inquiryId?.message}>
          <select {...register("inquiryId")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">{t.choose}</option>
            {inquiries.map((inquiry) => (
              <option key={inquiry.id} value={inquiry.id}>
                {inquiry.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.budget} error={errors.budgetCents?.message}>
          <input
            {...register("budgetCents", { valueAsNumber: true })}
            type="number"
            min={0}
            className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
          />
        </Field>

        <Field label={t.status} error={errors.status?.message}>
          <select {...register("status")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            {campaignStatusValues.map((status) => (
              <option key={status} value={status}>
                {statusLabels[locale][status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.priority} error={errors.priority?.message}>
          <select {...register("priority")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            {campaignPriorityValues.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[locale][priority]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.source} error={errors.source?.message}>
          <select {...register("source")} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            {campaignSourceValues.map((source) => (
              <option key={source} value={source}>
                {sourceLabels[locale][source]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.start} error={errors.plannedStartDate?.message}>
          <input {...register("plannedStartDate")} type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>

        <Field label={t.end} error={errors.plannedEndDate?.message}>
          <input {...register("plannedEndDate")} type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>

        <Field label={t.brief} error={errors.brief?.message} className="md:col-span-2">
          <textarea {...register("brief")} rows={5} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>

        <Field label={t.summary} error={errors.internalSummary?.message} className="md:col-span-2">
          <textarea {...register("internalSummary")} rows={4} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>

        {submitError ? <p className="md:col-span-2 text-sm text-rose-700">{submitError}</p> : null}
        {submitSuccess ? <p className="md:col-span-2 text-sm text-teal-700">{submitSuccess}</p> : null}

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? t.saving : t.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
