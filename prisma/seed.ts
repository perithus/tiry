import {
  AdSurfaceType,
  AuditAction,
  CampaignPriority,
  CampaignSource,
  CampaignStatus,
  CampaignTaskStatus,
  CompanyStatus,
  ContentPageStatus,
  ListingStatus,
  PricingModel,
  PrismaClient,
  RouteScope,
  UserRole,
  UserStatus,
  VehicleType,
  VerificationStatus
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const company = await prisma.company.upsert({
    where: { slug: "northgrid-logistics" },
    update: {},
    create: {
      slug: "northgrid-logistics",
      legalName: "Northgrid Logistics Sp. z o.o.",
      displayName: "Northgrid Logistics",
      description: "Cross-border carrier operating high-visibility fleets across Central Europe.",
      headquartersCity: "Poznan",
      headquartersCountry: "Poland",
      fleetSize: 48,
      verificationStatus: VerificationStatus.VERIFIED,
      status: CompanyStatus.VERIFIED
    }
  });

  const [advertiser, owner, admin] = await Promise.all([
    prisma.user.upsert({
      where: { email: "advertiser@example.com" },
      update: {},
      create: {
        email: "advertiser@example.com",
        passwordHash,
        name: "Alicja Markiewicz",
        role: UserRole.ADVERTISER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      }
    }),
    prisma.user.upsert({
      where: { email: "owner@example.com" },
      update: {},
      create: {
        email: "owner@example.com",
        passwordHash,
        name: "Michal Wrona",
        role: UserRole.CARRIER_OWNER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        companyId: company.id
      }
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        passwordHash,
        name: "Platform Admin",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date()
      }
    })
  ]);

  const existingFleet = await prisma.fleet.findFirst({
    where: {
      companyId: company.id,
      name: "International Premium Fleet"
    }
  });

  const fleet = existingFleet
    ? await prisma.fleet.update({
        where: { id: existingFleet.id },
        data: {
          description: "EU corridor trailers with stable routes and strong urban exposure.",
          vehicleCount: 24
        }
      })
    : await prisma.fleet.create({
        data: {
          companyId: company.id,
          name: "International Premium Fleet",
          description: "EU corridor trailers with stable routes and strong urban exposure.",
          vehicleCount: 24
        }
      });

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      companyId: company.id,
      name: "Schmitz Cargobull Mega Trailer"
    }
  });

  const vehicle = existingVehicle
    ? await prisma.vehicle.update({
        where: { id: existingVehicle.id },
        data: {
          fleetId: fleet.id,
          registrationCountry: "Poland",
          vehicleType: VehicleType.TRAILER,
          monthlyMileageKm: 18000,
          estimatedMonthlyReach: 1200000
        }
      })
    : await prisma.vehicle.create({
        data: {
          companyId: company.id,
          fleetId: fleet.id,
          name: "Schmitz Cargobull Mega Trailer",
          registrationCountry: "Poland",
          vehicleType: VehicleType.TRAILER,
          monthlyMileageKm: 18000,
          estimatedMonthlyReach: 1200000
        }
      });

  const existingAdSurface = await prisma.adSurface.findFirst({
    where: {
      vehicleId: vehicle.id,
      type: AdSurfaceType.FULL_WRAP
    }
  });

  const adSurface = existingAdSurface
    ? await prisma.adSurface.update({
        where: { id: existingAdSurface.id },
        data: {
          widthMm: 13600,
          heightMm: 2600
        }
      })
    : await prisma.adSurface.create({
        data: {
          vehicleId: vehicle.id,
          type: AdSurfaceType.FULL_WRAP,
          widthMm: 13600,
          heightMm: 2600
        }
      });

  const listing = await prisma.listing.upsert({
    where: { slug: "pan-eu-full-wrap-priority-routes" },
    update: {
      companyId: company.id,
      vehicleId: vehicle.id,
      adSurfaceId: adSurface.id,
      title: "Pan-EU Full Wrap on Priority Logistics Routes",
      description: "Premium full-wrap inventory with regular exposure across Poland, Germany, Czechia and the Benelux corridor.",
      baseCity: "Poznan",
      baseCountry: "Poland",
      routeScope: RouteScope.INTERNATIONAL,
      countriesCovered: ["Poland", "Germany", "Netherlands", "Belgium", "Czechia"],
      citiesCovered: ["Poznan", "Berlin", "Rotterdam", "Brussels", "Prague"],
      estimatedMonthlyMileage: 18000,
      estimatedCampaignReach: 1200000,
      pricingModel: PricingModel.FIXED_MONTHLY,
      priceFromCents: 480000,
      currency: "EUR",
      availableFrom: new Date(),
      minimumCampaignDays: 30,
      verificationStatus: VerificationStatus.VERIFIED,
      status: ListingStatus.ACTIVE,
      featured: true
    },
    create: {
      slug: "pan-eu-full-wrap-priority-routes",
      companyId: company.id,
      vehicleId: vehicle.id,
      adSurfaceId: adSurface.id,
      title: "Pan-EU Full Wrap on Priority Logistics Routes",
      description: "Premium full-wrap inventory with regular exposure across Poland, Germany, Czechia and the Benelux corridor.",
      baseCity: "Poznan",
      baseCountry: "Poland",
      routeScope: RouteScope.INTERNATIONAL,
      countriesCovered: ["Poland", "Germany", "Netherlands", "Belgium", "Czechia"],
      citiesCovered: ["Poznan", "Berlin", "Rotterdam", "Brussels", "Prague"],
      estimatedMonthlyMileage: 18000,
      estimatedCampaignReach: 1200000,
      pricingModel: PricingModel.FIXED_MONTHLY,
      priceFromCents: 480000,
      currency: "EUR",
      availableFrom: new Date(),
      minimumCampaignDays: 30,
      verificationStatus: VerificationStatus.VERIFIED,
      status: ListingStatus.ACTIVE,
      featured: true
    }
  });

  await prisma.listingImage.deleteMany({
    where: { listingId: listing.id }
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing.id,
      url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c",
      alt: "Branded logistics trailer mockup",
      sortOrder: 0
    }
  });

  await prisma.routeCoverage.deleteMany({
    where: { listingId: listing.id }
  });

  await prisma.routeCoverage.createMany({
    data: [
      { listingId: listing.id, routeScope: RouteScope.INTERNATIONAL, country: "Poland", city: "Poznan", routeLabel: "Poznan - Berlin" },
      { listingId: listing.id, routeScope: RouteScope.INTERNATIONAL, country: "Germany", city: "Berlin", routeLabel: "Berlin - Rotterdam" },
      { listingId: listing.id, routeScope: RouteScope.INTERNATIONAL, country: "Netherlands", city: "Rotterdam", routeLabel: "Rotterdam - Brussels" }
    ]
  });

  const inquiry = await prisma.campaignInquiry.upsert({
    where: {
      id: "cm-demo-inquiry-spring-retail"
    },
    update: {
      advertiserId: advertiser.id,
      listingId: listing.id,
      campaignName: "Spring Retail Visibility",
      message: "We are exploring a 2-month activation focused on Poland and Germany.",
      budgetMinCents: 700000,
      budgetMaxCents: 1200000,
      targetCountries: ["Poland", "Germany"]
    },
    create: {
      id: "cm-demo-inquiry-spring-retail",
      advertiserId: advertiser.id,
      listingId: listing.id,
      campaignName: "Spring Retail Visibility",
      message: "We are exploring a 2-month activation focused on Poland and Germany.",
      budgetMinCents: 700000,
      budgetMaxCents: 1200000,
      targetCountries: ["Poland", "Germany"]
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: {
      slug: "spring-retail-visibility-demo"
    },
    update: {
      name: "Spring Retail Visibility",
      advertiserId: advertiser.id,
      companyId: company.id,
      primaryListingId: listing.id,
      inquiryId: inquiry.id,
      ownerId: admin.id,
      status: CampaignStatus.NEGOTIATION,
      priority: CampaignPriority.HIGH,
      source: CampaignSource.MARKETPLACE_INQUIRY,
      brief: "Cross-border retail awareness campaign focused on Poland and Germany for spring activations.",
      internalSummary: "Advertiser is responsive, route fit is strong, and the carrier can reserve inventory within two weeks.",
      budgetCents: 980000,
      currency: "EUR",
      plannedStartDate: new Date("2026-05-15"),
      plannedEndDate: new Date("2026-07-15")
    },
    create: {
      slug: "spring-retail-visibility-demo",
      name: "Spring Retail Visibility",
      advertiserId: advertiser.id,
      companyId: company.id,
      primaryListingId: listing.id,
      inquiryId: inquiry.id,
      ownerId: admin.id,
      status: CampaignStatus.NEGOTIATION,
      priority: CampaignPriority.HIGH,
      source: CampaignSource.MARKETPLACE_INQUIRY,
      brief: "Cross-border retail awareness campaign focused on Poland and Germany for spring activations.",
      internalSummary: "Advertiser is responsive, route fit is strong, and the carrier can reserve inventory within two weeks.",
      budgetCents: 980000,
      currency: "EUR",
      plannedStartDate: new Date("2026-05-15"),
      plannedEndDate: new Date("2026-07-15")
    }
  });

  await prisma.campaignNote.upsert({
    where: {
      id: "cm-demo-note-1"
    },
    update: {
      campaignId: campaign.id,
      authorId: admin.id,
      body: "Carrier confirmed route stability and can deliver updated trailer visuals before creative sign-off."
    },
    create: {
      id: "cm-demo-note-1",
      campaignId: campaign.id,
      authorId: admin.id,
      body: "Carrier confirmed route stability and can deliver updated trailer visuals before creative sign-off."
    }
  });

  await prisma.campaignTask.upsert({
    where: {
      id: "cm-demo-task-1"
    },
    update: {
      campaignId: campaign.id,
      assigneeId: admin.id,
      title: "Confirm creative delivery timeline",
      description: "Collect production-ready wrap assets and lock the installation window with the fleet operator.",
      status: CampaignTaskStatus.IN_PROGRESS,
      dueDate: new Date("2026-05-02")
    },
    create: {
      id: "cm-demo-task-1",
      campaignId: campaign.id,
      assigneeId: admin.id,
      title: "Confirm creative delivery timeline",
      description: "Collect production-ready wrap assets and lock the installation window with the fleet operator.",
      status: CampaignTaskStatus.IN_PROGRESS,
      dueDate: new Date("2026-05-02")
    }
  });

  const contentPages = [
    {
      slug: "privacy-policy",
      locale: "en",
      title: "Privacy Policy",
      body:
        "We process account, session, inquiry, and moderation data to operate the marketplace securely. Production rollout should extend this page with a jurisdiction-specific privacy notice, lawful basis mapping, retention schedule, and data processor list."
    },
    {
      slug: "privacy-policy",
      locale: "pl",
      title: "Polityka prywatności",
      body:
        "Przetwarzamy dane kont, sesji, zapytań i moderacji w celu bezpiecznego działania marketplace. Wersja produkcyjna powinna rozszerzyć tę stronę o pełną informację RODO, podstawy prawne, okresy retencji i listę podmiotów przetwarzających."
    },
    {
      slug: "terms",
      locale: "en",
      title: "Terms",
      body:
        "This marketplace foundation supports commercial discovery, inquiry, moderation, and campaign operations. Before launch, add full legal terms covering platform liability, booking conditions, approval workflow, carrier compliance, and advertiser obligations."
    },
    {
      slug: "terms",
      locale: "pl",
      title: "Regulamin",
      body:
        "Ten fundament marketplace wspiera discovery, zapytania, moderację i operacje kampanii. Przed wdrożeniem produkcyjnym należy dodać pełny regulamin obejmujący odpowiedzialność platformy, warunki bookingów, workflow akceptacji, compliance przewoźników i obowiązki reklamodawców."
    }
  ] as const;

  for (const page of contentPages) {
    await prisma.contentPage.upsert({
      where: {
        slug_locale: {
          slug: page.slug,
          locale: page.locale
        }
      },
      update: {
        title: page.title,
        body: page.body,
        status: ContentPageStatus.PUBLISHED,
        editedById: admin.id,
        publishedAt: new Date()
      },
      create: {
        slug: page.slug,
        locale: page.locale,
        title: page.title,
        body: page.body,
        status: ContentPageStatus.PUBLISHED,
        editedById: admin.id,
        publishedAt: new Date()
      }
    });
  }

  const faqSeeds = [
    {
      locale: "en",
      question: "How are transport companies verified?",
      answer: "Admins review company details, submitted documents, and listing quality before a carrier is marked as verified.",
      category: "Verification",
      sortOrder: 1
    },
    {
      locale: "en",
      question: "Can advertisers manage campaigns inside the platform?",
      answer: "Yes. Advertisers can already track inquiries and campaign records, while admins manage the internal CRM workflow.",
      category: "Campaigns",
      sortOrder: 2
    },
    {
      locale: "pl",
      question: "Jak weryfikowane są firmy transportowe?",
      answer: "Administratorzy sprawdzają dane firmy, przesłane dokumenty i jakość ofert, zanim przewoźnik otrzyma status zweryfikowanego.",
      category: "Weryfikacja",
      sortOrder: 1
    },
    {
      locale: "pl",
      question: "Czy reklamodawcy mogą zarządzać kampaniami w platformie?",
      answer: "Tak. Reklamodawcy mogą już śledzić zapytania i rekordy kampanii, a administratorzy prowadzą wewnętrzny workflow CRM.",
      category: "Kampanie",
      sortOrder: 2
    }
  ] as const;

  for (const faq of faqSeeds) {
    const existingFaq = await prisma.faqItem.findFirst({
      where: {
        locale: faq.locale,
        question: faq.question
      }
    });

    if (existingFaq) {
      await prisma.faqItem.update({
        where: { id: existingFaq.id },
        data: {
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          active: true,
          editedById: admin.id
        }
      });
    } else {
      await prisma.faqItem.create({
        data: {
          locale: faq.locale,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          active: true,
          editedById: admin.id
        }
      });
    }
  }

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: owner.id,
        action: AuditAction.SIGN_UP,
        entityType: "User",
        entityId: owner.id
      },
      {
        actorId: admin.id,
        action: AuditAction.VERIFICATION_REVIEWED,
        entityType: "Company",
        entityId: company.id
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
