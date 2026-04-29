import type { Locale } from "@/lib/i18n/shared";

export const messages = {
  en: {
    brand: "Truck Inventory Yard",
    nav: {
      language: "Language",
      howItWorks: "How it works",
      advertisers: "For advertisers",
      carriers: "For transport companies",
      marketplace: "Marketplace",
      faq: "FAQ",
      contact: "Contact",
      signIn: "Sign in",
      getStarted: "Get started"
    },
    footer: {
      description: "Secure marketplace infrastructure for truck and trailer advertising inventory across Europe.",
      platform: "Platform",
      company: "Company",
      legal: "Legal",
      privacy: "Privacy policy",
      terms: "Terms"
    },
    home: {
      badge: "Verified transport media marketplace",
      title: "Premium truck and trailer advertising surfaces for B2B campaigns that deliver.",
      description:
        "Connect with verified fleet operators across Europe who offer route-backed advertising inventory on trucks and trailers. From domestic logistics to cross-border corridors — find the right inventory, send structured briefs, and manage campaigns from one secure platform.",
      primaryCta: "Explore inventory",
      secondaryCta: "List your fleet",
      metricsDescription: "Built for enterprise-grade media planning, operational verification, and campaign accountability.",
      whyEyebrow: "Why leading teams choose TIY",
      whyTitle: "Marketplace infrastructure built for trust, speed, and real operational needs.",
      whyDescription:
        "TIY combines verified inventory discovery, structured inquiry workflows, and moderation-first controls so advertisers and fleet operators can transact with confidence. Every listing is backed by company verification, route data, and platform accountability.",
      featuredEyebrow: "Featured inventory",
      featuredTitle: "Launch campaigns faster with verified fleet listings.",
      featuredDescription:
        "Featured listings combine premium visibility, detailed route data, and moderation-backed credibility. Start your next outdoor campaign with inventory you can trust."
    },
    marketing: {
      how: {
        eyebrow: "How it works",
        title: "A streamlined B2B workflow from discovery to campaign launch.",
        description: "TIY is designed to make truck and trailer advertising inventory easier to discover, verify, and operationalize — for both advertisers and fleet operators.",
        steps: [
          {
            title: "Fleet operators create verified company profiles and list inventory",
            body: "Register your transport company, complete verification, and add your fleet's advertising surfaces. Each listing includes vehicle details, route coverage, pricing models, and proof imagery — all structured for advertiser confidence."
          },
          {
            title: "Advertisers discover and filter inventory by campaign requirements",
            body: "Browse verified fleet listings with filters for geography, route scope (domestic, international, or mixed), monthly mileage, ad surface format, and pricing model. Save favorites and compare inventory side-by-side."
          },
          {
            title: "Submit structured campaign briefs directly to fleet operators",
            body: "Send detailed inquiries with campaign timing, target territories, budget range, and campaign goals. Fleet operators receive structured briefs they can respond to with custom offers — all without scattered email threads."
          },
          {
            title: "Manage campaigns, offers, and communications in one workspace",
            body: "Track inquiry status, review offers, handle messaging, and monitor campaign progress through to completion. Platform moderation ensures both sides maintain accountability throughout the partnership."
          }
        ]
      },
      advertisers: {
        eyebrow: "For advertisers",
        title: "Plan route-aware outdoor campaigns with precision and confidence.",
        description: "TIY gives advertisers access to verified fleet inventory with structured route data, transparent pricing, and a streamlined workflow from discovery through campaign execution. No more cold outreach, unclear availability, or unverifiable suppliers.",
        features: [
          ["Campaign-ready inventory filters", "Search by geography, route scope, monthly mileage, ad surface format, pricing model, and carrier profile. Find inventory that matches your campaign targets in minutes, not weeks."],
          ["Structured brief submission", "Send detailed campaign briefs directly to verified fleet operators. Include timing, territories, budget range, creative requirements, and campaign goals — all in one standardized format that gets responses faster."],
          ["Full inquiry lifecycle tracking", "Monitor every submitted brief through the entire workflow: pending, under review, offer received, negotiating, booked, in-progress, and completed. Never lose track of an opportunity again."],
          ["Verification-backed supplier confidence", "Every fleet operator goes through company verification before listing inventory. Moderated listings include proof imagery, compliance documentation, and route data you can trust."],
          ["Saved inventory and comparisons", "Bookmark promising listings, organize by campaign, and return to compare options as your media plan evolves. Build your preferred supplier network over time."],
          ["Centralized campaign history", "Access complete records of past campaigns, carrier performance, and partnership outcomes. Use historical data to refine future media planning and supplier selection."]
        ]
      },
      carriers: {
        eyebrow: "For transport companies",
        title: "Monetize your fleet's visibility with a structured, professional workflow.",
        description: "Transform your trucks and trailers into advertising inventory without disrupting operations. TIY helps transport companies create verified listings, manage inquiries professionally, and build long-term partnerships with advertisers — all through one secure platform.",
        features: [
          ["Complete fleet and surface management", "Document every advertising surface across your fleet: truck sides, trailers, tailgates, and specialty formats. Include vehicle specifications, route coverage, monthly mileage, and professional proof imagery that sells your inventory."],
          ["Flexible pricing models", "Define your pricing structure your way: per truck per month, per impression-based, flat campaign fees, or custom quotes. Respond to each inquiry with tailored offers that reflect your fleet's unique coverage and availability."],
          ["Professional inquiry management", "Receive structured briefs from verified advertisers with clear campaign requirements. Respond with offers, ask clarifying questions, and negotiate terms — all documented in the platform for complete transparency."],
          ["Company verification that builds trust", "Complete the verification process once and signal trustworthiness to every advertiser. Upload compliance documents, verify your company identity, and let the platform's moderation system advocate for your reliability."],
          ["Role-based team access", "Grant fleet managers, sales teams, or administrative staff access without giving away company ownership. RBAC ensures everyone has exactly the permissions they need — nothing more."],
          ["Availability and booking control", "Block out maintenance periods, coordinate with existing commitments, and prevent double-booking. Maintain full control over when and how your fleet's advertising surfaces are available."]
        ]
      },
      marketplace: {
        eyebrow: "Marketplace",
        title: "Browse verified truck and trailer media inventory.",
        description: "Filter by route profile, geography, pricing model, and campaign fit to identify the right carrier inventory.",
        emptyTitle: "No matching listings",
        emptyBody: "Try widening the geography or pricing filters to uncover more inventory."
      },
      faq: {
        title: "Frequently asked questions",
        items: [
          ["How does truck and trailer advertising work?", "Fleet operators sell advertising space on their vehicles' exterior surfaces. Advertisers pay for visibility exposure as trucks travel established routes — whether domestic, international, or mixed. Campaigns can target specific regions, routes, or mileage volumes depending on the carrier's network."],
          ["How are companies and listings verified on TIY?", "Transport companies submit verification documents including business registration, insurance, and fleet documentation. Platform admins review submissions and approve verified status. Advertisers can see verification badges, moderation scores, and document status before committing to partnerships."],
          ["What information do listings include?", "Each listing contains vehicle type and specifications, advertising surface dimensions and positions, available formats (full wrap, partial, billboards), route coverage (domestic, international, mixed), monthly mileage estimates, base location, pricing model, availability windows, and proof imagery."],
          ["Can I negotiate custom pricing or campaign terms?", "Yes. Advertisers submit campaign briefs with their requirements and budget expectations. Fleet operators review briefs and respond with custom offers. Both parties can negotiate terms through the platform before finalizing the booking."],
          ["What happens if there's a dispute or quality issue?", "TIY maintains audit trails of all inquiries, offers, and communications. Platform admins can review activity and facilitate resolution. Both advertisers and carriers have documentation of all agreements made through the platform."],
          ["Does the platform support multiple user roles?", "Yes. TIY uses role-based access control (RBAC) with distinct roles: advertisers, carrier owners, fleet managers, admins, and super admins. Each role has appropriate permissions and data access scoped to their function."],
          ["How are uploads and file transfers secured?", "The upload layer implements MIME/type validation, file size limits, virus scanning, and storage abstraction for secure cloud providers. All files are served through authenticated, time-limited URLs."],
          ["What regions and countries are supported?", "TIY is designed for European-scale deployment. Listings include country metadata, route coverage data, and cross-border capability indicators. The platform supports multiple languages and regional compliance requirements."]
        ]
      },
      privacy: {
        title: "Privacy Policy",
        body: "This Privacy Policy describes how TIY (\"we,\" \"us,\" or \"our\") collects, uses, and protects information when you use our platform for truck and trailer advertising marketplace services.\n\n**Information We Collect**\nWe collect information you provide directly: account registration details, company information, verification documents, fleet and vehicle data, listing content, campaign briefs, messages, and communications. We also collect usage data including IP addresses, browser type, pages visited, and platform interactions.\n\n**How We Use Your Information**\nWe use collected information to: provide and maintain platform services, process verification applications, facilitate marketplace transactions, communicate about inquiries and campaigns, enforce platform terms and policies, detect and prevent fraud or abuse, and improve our services.\n\n**Information Sharing**\nWe share information with: other platform users as necessary for marketplace transactions (e.g., advertiser details shared with carriers for inquiries), service providers who assist platform operations, legal authorities when required by law, and parties involved in business transfers.\n\n**Data Retention**\nWe retain account information for the duration of your account plus necessary cleanup periods. Verification documents are retained per compliance requirements. Audit logs are maintained for security and accountability.\n\n**Your Rights**\nDepending on your jurisdiction, you may have rights to: access your personal data, correct inaccurate information, delete your data, restrict processing, data portability, and object to certain processing. Contact us to exercise these rights.\n\n**Security**\nWe implement appropriate technical and organizational measures including encryption, secure sessions, access controls, and regular security assessments to protect your data.\n\n**Cookies**\nWe use essential cookies for platform functionality. With consent, we may use analytics and marketing cookies. See our Cookie Policy for details.\n\n**Contact**\nFor privacy inquiries, contact us at privacy@tiy.example.com."
      },
      terms: {
        title: "Terms of Service",
        body: "**Agreement to Terms**\nBy accessing or using TIY's platform and services, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.\n\n**Platform Description**\nTIY provides a B2B marketplace connecting advertisers seeking truck and trailer advertising surfaces with fleet operators offering such inventory. The platform facilitates discovery, inquiry management, offer handling, and campaign coordination.\n\n**User Accounts**\nYou must register for an account to access marketplace features. You are responsible for maintaining account security, providing accurate information, and promptly updating details. Account roles determine access levels: advertisers, carrier owners, fleet managers, and administrators.\n\n**Verification Requirements**\nTransport companies seeking verified status must submit accurate documentation for admin review. Verification status reflects admin assessment and does not guarantee performance, reliability, or compliance. Advertisers should conduct due diligence.\n\n**Listing Standards**\nListings must be accurate, complete, and reflect actual available inventory. Misleading, incomplete, or fraudulent listings may be removed with or without notice. Fleet operators must maintain listing accuracy as availability changes.\n\n**Inquiry and Campaign Workflows**\nPlatform workflows facilitate communication between advertisers and carriers. TIY is not a party to campaigns, bookings, or agreements made between users. Users are responsible for negotiating terms, fulfilling commitments, and resolving disputes independently.\n\n**Marketplace Liability**\nTIY provides infrastructure and moderation tools. We do not guarantee inventory availability, campaign outcomes, or the accuracy of user-submitted information. Users bear responsibility for their marketplace activities and partnerships.\n\n**Carrier Compliance**\nCarriers represent and warrant that: they legally own or have rights to advertised surfaces, vehicles meet applicable regulations, advertising content does not violate laws, and they maintain required insurance and documentation.\n\n**Advertiser Responsibilities**\nAdvertisers represent and warrant that: advertising content is legal, does not violate third-party rights, complies with applicable advertising regulations, and campaign briefs accurately describe requirements.\n\n**Prohibited Conduct**\nUsers may not: post fraudulent listings, submit false inquiries, harass other users, circumvent platform workflows, attempt unauthorized access, or use the platform for illegal purposes.\n\n**Moderation and Enforcement**\nTIY reserves the right to: review listings and communications, suspend or terminate violating accounts, remove inappropriate content, and cooperate with legal authorities.\n\n**Limitation of Liability**\nTIY is not liable for: indirect, incidental, or consequential damages; lost profits or business opportunities; user disputes; or actions taken based on platform information.\n\n**Changes to Terms**\nWe may update these terms periodically. Continued platform use constitutes acceptance of updated terms. Material changes will be communicated through the platform.\n\n**Governing Law**\nThese terms are governed by applicable European law. Disputes may be resolved through designated arbitration or court proceedings.\n\n**Contact**\nFor questions about these terms, contact legal@tiy.example.com."
      },
      listing: {
        baseLocation: "Base location",
        pricing: "Pricing",
        estimatedReach: "Estimated reach",
        monthlyMileage: "Monthly mileage",
        routeCoverage: "Route coverage",
        advertiserInfoTitle: "What advertisers see",
        advertiserInfoBody: "Verified company context, route-backed coverage, campaign timing, and a structured inquiry flow help both sides move faster with less risk."
      }
    },
    auth: {
      signInTitle: "Sign in",
      signInHero: "Welcome back to the truck media marketplace.",
      signInDescription:
        "Sign in to manage inquiries, listings, verification, and campaign activity across your role-specific workspace.",
      signInLead: "Use your platform credentials to continue.",
      noAccount: "No account yet?",
      createOne: "Create one",
      signUpTitle: "Create account",
      signUpHero: "Create a secure B2B marketplace account.",
      signUpDescription:
        "Choose your role, complete onboarding, and start using advertiser or carrier workflows designed for trust and scalability.",
      signUpLead: "Strong password rules and secure session cookies are enabled by default.",
      alreadyRegistered: "Already registered?",
      forgotPasswordTitle: "Forgot password",
      forgotPasswordBody:
        "The production reset-email flow is intentionally left for the next phase so it can be wired to your chosen transactional email provider.",
      verifyTitle: "Verify email",
      verifyBody:
        "This starter currently auto-verifies seed/demo accounts. The verification page is ready for token-based email verification wiring.",
      emailLabel: "Email",
      passwordLabel: "Password",
      fullNameLabel: "Full name",
      roleLabel: "I am joining as",
      roleAdvertiser: "Advertiser",
      roleCarrierOwner: "Carrier owner",
      roleFleetManager: "Fleet manager",
      signInLoading: "Signing in...",
      signUpLoading: "Creating account..."
    },
    contact: {
      eyebrow: "Contact",
      title: "Talk to the team behind the marketplace.",
      description:
        "Use the contact form for partnerships, onboarding support, enterprise rollout planning, or commercial questions.",
      detailsTitle: "Direct contact",
      detailsBody:
        "You can also reach the team directly by email. Messages sent through the form are validated, rate limited, and ready for captcha enforcement.",
      emailLabel: "Email",
      responseLabel: "Response time",
      responseValue: "Usually within one business day",
      formTitle: "Send a message",
      formDescription: "We only process your data to answer your request and handle follow-up communication if you agree.",
      success: "Message sent successfully. We will get back to you soon."
    },
    form: {
      name: "Full name",
      email: "Work email",
      company: "Company",
      subject: "Subject",
      message: "Message",
      privacyConsent: "I agree to the processing of my data for handling this inquiry.",
      marketingConsent: "I want to receive product and launch updates by email.",
      captchaPending: "Captcha protection is prepared and can be activated as soon as a provider key is added.",
      submitContact: "Send message",
      sending: "Sending..."
    },
    filters: {
      searchPlaceholder: "Search by route, carrier, or format",
      allCountries: "All countries",
      allRouteScopes: "All route scopes",
      domestic: "Domestic",
      international: "International",
      mixed: "Mixed",
      allPricingModels: "All pricing models"
    },
    cookies: {
      title: "Cookies and data preferences",
      description:
        "We use essential cookies to keep the platform secure. With your consent, we can also enable analytics and marketing cookies.",
      processing:
        "Personal data is processed to maintain security, remember preferences, and improve the platform in line with your consent choices.",
      acceptAll: "Accept all",
      rejectOptional: "Reject optional",
      manage: "Manage settings",
      save: "Save preferences",
      necessary: "Necessary cookies",
      necessaryDescription: "Required for sessions, security controls, and core platform functionality.",
      analytics: "Analytics cookies",
      analyticsDescription: "Help us understand traffic and improve UX.",
      marketing: "Marketing cookies",
      marketingDescription: "Support lead attribution and campaign optimisation.",
      preferencesSaved: "Cookie preferences saved."
    },
    dashboard: {
      workspace: "Workspace",
      nav: {
        overview: "Overview",
        savedListings: "Saved listings",
        users: "Users",
        verifications: "Verifications",
        listings: "Listings",
        inquiries: "Inquiries",
        messages: "Messages",
        notifications: "Notifications",
        campaigns: "Campaigns",
        security: "Security",
        settings: "Settings",
        companyProfile: "Company profile",
        vehicles: "Vehicles",
        availability: "Availability",
        verification: "Verification",
        reports: "Reports",
        auditLogs: "Audit logs",
        content: "Content"
      },
      advertiser: {
        title: "Advertiser workspace",
        overviewHeading: "Campaign planning and inquiry control",
        overviewSubheading: "Use saved inventory, active inquiries, and campaign visibility to move from discovery to execution.",
        savedListings: "Saved listings",
        savedListingsSubheading: "Keep track of preferred inventory while your team evaluates route fit, reach, and pricing.",
        savedListingsPlaceholder: "Saved listings UI is scaffolded and ready to be connected to the SavedListing model for live account data.",
        inquiriesHeading: "Inquiries",
        inquiriesSubheading: "Review carrier responses, campaign details, and current status for every submitted brief.",
        campaignsHeading: "Campaign status",
        campaignsSubheading: "Track active and completed bookings, commercial milestones, and post-campaign review opportunities.",
        campaignsPlaceholder: "Booking and campaign lifecycle views are scaffolded for future commercial rollout.",
        messagesHeading: "Messages",
        messagesSubheading: "The schema supports structured conversations tied to inquiries and future support flows.",
        messagesPlaceholder: "Messaging UI foundation is ready for threaded conversation integration.",
        settingsHeading: "Account settings",
        settingsSubheading: "Manage contact details, credentials, and notification preferences.",
        settingsPlaceholder: "Settings surface is ready for profile and notification controls.",
        metricSavedListings: "Saved listings",
        metricSavedListingsDesc: "High-fit carrier inventory tracked for future campaign planning.",
        metricActiveInquiries: "Active inquiries",
        metricActiveInquiriesDesc: "Carrier responses currently in progress across multiple regions.",
        metricLiveCampaigns: "Live campaigns",
        metricLiveCampaignsDesc: "Commercially active placements under current booking windows.",
        campaign: "Campaign",
        listing: "Listing",
        status: "Status"
      },
      fleet: {
        title: "Fleet workspace",
        overviewHeading: "Operations, inventory, and inquiries in one place",
        overviewSubheading: "Manage company data, list ad-ready surfaces, and respond to advertiser demand through a security-first workflow.",
        companyHeading: "Company profile",
        companySubheading: "Maintain legal identity, headquarters, fleet size, and carrier presentation details used across listings and verification.",
        vehiclesHeading: "Vehicles",
        vehiclesSubheading: "Structured truck and trailer records feed ad surface definitions and listing generation.",
        listingsHeading: "Listings",
        listingsSubheading: "Control visibility, moderation state, and inventory positioning for advertiser-facing offers.",
        availabilityHeading: "Availability",
        availabilitySubheading: "Future availability controls can coordinate route windows, blackout periods, and booking reservations.",
        availabilityPlaceholder: "Availability management foundation is ready for listing-level scheduling rules.",
        inquiriesHeading: "Incoming inquiries",
        inquiriesSubheading: "Review advertiser briefs, campaign budgets, and target geographies before responding with commercial offers.",
        messagesHeading: "Messages",
        messagesSubheading: "Structured messaging will sit on top of the conversation and message tables already present in the schema.",
        messagesPlaceholder: "Messaging UI placeholder for future threaded carrier-advertiser collaboration.",
        verificationHeading: "Verification",
        verificationSubheading: "Centralize company compliance documents and track review status before listings go fully live.",
        verificationEmpty: "No documents uploaded yet.",
        settingsHeading: "Settings",
        settingsSubheading: "Manage team access, credentials, and future notification rules.",
        settingsPlaceholder: "Settings surface is prepared for delegated fleet manager access and alert controls.",
        metricActiveListings: "Active listings",
        metricActiveListingsDesc: "Currently visible inventory available to advertisers.",
        metricIncomingInquiries: "Incoming inquiries",
        metricIncomingInquiriesDesc: "New briefs waiting for review or commercial response.",
        metricVerificationReadiness: "Verification readiness",
        metricVerificationReadinessDesc: "Document and moderation completeness across the company profile.",
        perMonth: "per month"
      },
      admin: {
        title: "Admin control",
        overviewHeading: "Marketplace governance and moderation",
        overviewSubheading: "Review users, companies, listings, and audit trails from a single operational panel.",
        pendingVerifications: "Pending verifications",
        pendingVerificationsDesc: "Companies or documents awaiting review.",
        listingsToModerate: "Listings to moderate",
        listingsToModerateDesc: "Inventory requiring status or quality review.",
        auditEvents: "Audit events today",
        auditEventsDesc: "Tracked security and moderation actions across the platform.",
        usersHeading: "Users",
        usersSubheading: "Review platform membership, role assignments, and account states.",
        verificationsHeading: "Company verifications",
        verificationsSubheading: "Review carrier readiness, document completeness, and verification status.",
        inquiriesHeading: "Inquiry monitoring",
        inquiriesSubheading: "Review marketplace activity patterns and investigate unusual or risky behavior.",
        auditHeading: "Audit logs",
        auditSubheading: "Sensitive account, moderation, and security actions are recorded for accountability.",
        contentHeading: "Content and taxonomy",
        contentSubheading: "Prepare category management, FAQ editing, and controlled public content governance.",
        contentPlaceholder: "Content management foundation is reserved for controlled admin authoring workflows.",
        verificationsUnknownHq: "Unknown HQ",
        auditAction: "Action",
        auditActor: "Actor",
        auditEntity: "Entity",
        auditTime: "Time",
        auditSystem: "System",
        name: "Name",
        email: "Email",
        role: "Role",
        status: "Status",
        listingsHeading: "Listing moderation",
        listingsSubheading: "Moderate visibility and verification state while preserving an auditable trail.",
        approveListing: "Approve listing"
      }
    }
  },
  pl: {
    brand: "Truck Inventory Yard",
    nav: {
      language: "Język",
      howItWorks: "Jak to działa",
      advertisers: "Dla reklamodawców",
      carriers: "Dla firm transportowych",
      marketplace: "Oferty",
      faq: "FAQ",
      contact: "Kontakt",
      signIn: "Zaloguj się",
      getStarted: "Zacznij"
    },
    footer: {
      description: "Bezpieczna infrastruktura marketplace dla reklam na ciężarówkach i naczepach w całej Europie.",
      platform: "Platforma",
      company: "Firma",
      legal: "Informacje prawne",
      privacy: "Polityka prywatności",
      terms: "Regulamin"
    },
    home: {
      badge: "Zweryfikowany marketplace reklam transportowych",
      title: "Premium powierzchnie reklamowe na ciężarówkach i naczepach dla kampanii B2B, które przynoszą rezultaty.",
      description:
        "Połącz się ze zweryfikowanymi operatorami flot w całej Europie, którzy oferują powierzchnie reklamowe oparte o realne trasy. Od logistyki krajowej po korytarze międzynarodowe — znajdź odpowiedni inventory, wyślij uporządkowane briefy i zarządzaj kampaniami z jednej bezpiecznej platformy.",
      primaryCta: "Przeglądaj oferty",
      secondaryCta: "Dodaj swoją flotę",
      metricsDescription: "Zaprojektowane pod planowanie kampanii klasy enterprise, wiarygodną weryfikację operacyjną i rozliczalność kampanii.",
      whyEyebrow: "Dlaczego wiodące zespoły wybierają TIY",
      whyTitle: "Infrastruktura marketplace zbudowana pod zaufanie, szybkość i realne potrzeby operacyjne.",
      whyDescription:
        "TIY łączy zweryfikowane discovery ofert, uporządkowane workflow zapytań i moderację na pierwszym miejscu, dzięki czemu reklamodawcy i operatorzy flot mogą transakcjonować z pewnością. Każda oferta jest wsparta weryfikacją firmy, danymi o trasach i rozliczalnością platformy.",
      featuredEyebrow: "Wybrane oferty",
      featuredTitle: "Uruchamiaj kampanie szybciej ze zweryfikowanymi ofertami flot.",
      featuredDescription:
        "Wybrane oferty łączą wysoką widoczność, szczegółowe dane o trasach i wiarygodność wspartą moderacją. Rozpocznij swoją kolejną kampanię outdoorową z inventory, któremu możesz zaufać."
    },
    marketing: {
      how: {
        eyebrow: "Jak to działa",
        title: "Usprawniony workflow B2B od discovery do uruchomienia kampanii.",
        description: "TIY jest zaprojektowane tak, by inventory reklamowe na ciężarówkach i naczepach było łatwiejsze do odkrycia, weryfikacji i wdrożenia — dla reklamodawców i operatorów flot.",
        steps: [
          {
            title: "Operatorzy flot tworzą zweryfikowane profile firm i dodają inventory",
            body: "Zarejestruj swoją firmę transportową, przejdź weryfikację i dodaj powierzchnie reklamowe swojej floty. Każda oferta zawiera dane pojazdu, zasięg tras, modele cenowe i zdjęcia dowodowe — wszystko ustrukturyzowane dla pewności reklamodawców."
          },
          {
            title: "Reklamodawcy odkrywają i filtrują inventory według wymagań kampanii",
            body: "Przeglądaj zweryfikowane oferty flot z filtrami geografii, zasięgu tras (krajowe, międzynarodowe lub mieszane), miesięcznego przebiegu, formatu powierzchni reklamowej i modelu cenowego. Zapisuj ulubione i porównuj oferty obok siebie."
          },
          {
            title: "Wysyłaj uporządkowane briefy kampanijne bezpośrednio do operatorów flot",
            body: "Przesyłaj szczegółowe zapytania z terminami kampanii, krajami docelowymi, zakresem budżetu i celami kampanii. Operatorzy flot otrzymują ustrukturyzowane briefy, na które mogą odpowiadać indywidualnymi ofertami — wszystko bez rozrzuconych wątków e-mail."
          },
          {
            title: "Zarządzaj kampaniami, ofertami i komunikacją w jednym miejscu pracy",
            body: "Śledź status zapytań, przeglądaj oferty, obsługuj wiadomości i monitoruj postęp kampanii aż do zakończenia. Moderacja platformy zapewnia rozliczalność obu stron przez cały okres partnerstwa."
          }
        ]
      },
      advertisers: {
        eyebrow: "Dla reklamodawców",
        title: "Planuj kampanie outdoorowe oparte o trasy z precyzją i pewnością.",
        description: "TIY daje reklamodawcom dostęp do zweryfikowanego inventory flot z ustrukturyzowanymi danymi o trasach, przejrzystym cennikiem i usprawnionym workflow od discovery przez realizację kampanii. Koniec z zimnymi rozesłaniami, niejasną dostępnością i nieweryfikowalnymi dostawcami.",
        features: [
          ["Filtry inventory gotowe pod kampanię", "Szukaj po geografii, zasięgu tras, miesięcznym przebiegu, formacie powierzchni reklamowej, modelu cenowym i profilu przewoźnika. Znajdź inventory dopasowane do celów kampanii w minuty, nie w tygodnie."],
          ["Uporządkowane składanie briefów", "Wysyłaj szczegółowe briefy kampanijne bezpośrednio do zweryfikowanych operatorów flot. Dołączaj terminy, terytoria, zakres budżetu, wymagania kreatywne i cele kampanii — wszystko w jednym ustandaryzowanym formacie, który przyspiesza odpowiedzi."],
          ["Pełne śledzenie cyklu życia zapytania", "Monitoruj każde złożone zapytanie przez cały workflow: oczekujące, w trakcie przeglądu, oferta otrzymana, negocjacje, zarezerwowane, w realizacji i zakończone. Nigdy więcej nie gub żadnej szansy."],
          ["Pewność dostawcy wsparta weryfikacją", "Każdy operator floty przechodzi weryfikację firmy przed wystawieniem inventory. Moderowane oferty zawierają zdjęcia dowodowe, dokumentację compliance i dane o trasach, którym można zaufać."],
          ["Zapisane inventory i porównania", "Zapisuj obiecujące oferty, organizuj je według kampanii i wracaj, by porównywać opcje w miarę ewolucji twojego planu mediowego. Buduj sieć preferowanych dostawców w czasie."],
          ["Zcentralizowana historia kampanii", "Uzyskuj dostęp do pełnych zapisów przeszłych kampanii, wyników przewoźników i efektów partnerstwa. Wykorzystuj dane historyczne do udoskonalania przyszłego planowania mediowego i selekcji dostawców."]
        ]
      },
      carriers: {
        eyebrow: "Dla firm transportowych",
        title: "Monetyzuj widoczność swojej floty dzięki ustrukturyzowanemu, profesjonalnemu workflow.",
        description: "Przekształć swoje ciężarówki i naczepy w powierzchnie reklamowe bez zakłócania operacji. TIY pomaga firmom transportowym tworzyć zweryfikowane oferty, profesjonalnie zarządzać zapytaniami i budować długoterminowe partnerstwa z reklamodawcami — wszystko przez jedną bezpieczną platformę.",
        features: [
          ["Kompletne zarządzanie flotą i powierzchniami", "Dokumentuj każdą powierzchnię reklamową w swojej flocie: boki ciężarówek, naczepy, klapy tylne i formaty specjalne. Dołączaj specyfikacje pojazdów, zasięg tras, miesięczny przebieg i profesjonalne zdjęcia dowodowe, które sprzedają twój inventory."],
          ["Elastyczne modele cenowe", "Definiuj swoją strukturę cenową po swojemu: za ciężarówkę miesięcznie, w modelu opartym o zasięg, ryczałt za kampanię lub indywidualne wyceny. Odpowiadaj na każde zapytanie dostosowanymi ofertami, które odzwierciedlają unikalny zasięg i dostępność twojej floty."],
          ["Profesjonalne zarządzanie zapytaniami", "Otrzymuj ustrukturyzowane briefy od zweryfikowanych reklamodawców z jasnymi wymaganiami kampanii. Odpowiadaj ofertami, zadawaj pytania wyjaśniające i negocjuj warunki — wszystko udokumentowane na platformie dla pełnej przejrzystości."],
          ["Weryfikacja firmy budująca zaufanie", "Przejdź proces weryfikacji raz i sygnalizuj wiarygodność każdemu reklamodawcy. Wgraj dokumenty compliance, zweryfikuj tożsamość firmy i pozwól systemowi moderacji platformy promować twoją rzetelność."],
          ["Dostęp oparty o role dla zespołu", "Przyznawaj dostęp menedżerom floty, zespołom sprzedaży lub personelowi administracyjnemu bez oddawania własności firmy. RBAC zapewnia, że każdy ma dokładnie te uprawnienia, których potrzebuje — nic więcej."],
          ["Kontrola dostępności i rezerwacji", "Blokuj okresy konserwacji, koordynuj z istniejącymi zobowiązaniami i zapobiegaj podwójnym rezerwacjom. Utrzymuj pełną kontrolę nad tym, kiedy i jak powierzchnie reklamowe twojej floty są dostępne."]
        ]
      },
      marketplace: {
        eyebrow: "Oferty",
        title: "Przeglądaj zweryfikowane inventory reklamowe na ciężarówkach i naczepach.",
        description: "Filtruj po profilu tras, geografii, modelu cenowym i dopasowaniu do kampanii, aby znaleźć odpowiedni inventory przewoźnika.",
        emptyTitle: "Brak pasujących ofert",
        emptyBody: "Poszerz filtry geograficzne lub cenowe, aby zobaczyć więcej inventory."
      },
      faq: {
        title: "Najczęściej zadawane pytania",
        items: [
          ["Jak działa reklama na ciężarówkach i naczepach?", "Operatorzy flot sprzedają powierzchnie reklamowe na zewnętrznych częściach swoich pojazdów. Reklamodawcy płacą za ekspozycję widoczności w miarę podróży ciężarówek po ustalonych trasach — czy to krajowych, międzynarodowych, czy mieszanych. Kampanie mogą być targetowane na konkretne regiony, trasy lub wolumeny przebiegu w zależności od sieci przewoźnika."],
          ["Jak firmy i oferty są weryfikowane na TIY?", "Firmy transportowe przesyłają dokumenty weryfikacyjne obejmujące rejestrację działalności, ubezpieczenie i dokumentację floty. Administratorzy platformy przeglądają zgłoszenia i przyznają status zweryfikowanego. Reklamodawcy widzą badge weryfikacji, wyniki moderacji i status dokumentów przed podjęciem decyzji o partnerstwie."],
          ["Jakie informacje zawierają oferty?", "Każda oferta zawiera typ i specyfikacje pojazdu, wymiary i pozycje powierzchni reklamowych, dostępne formaty (pełne oklejenie, częściowe, billboardy), zasięg tras (krajowe, międzynarodowe, mieszane), szacunkowy miesięczny przebieg, lokalizację bazową, model cenowy, okna dostępności oraz zdjęcia dowodowe."],
          ["Czy mogę negocjować niestandardowe ceny lub warunki kampanii?", "Tak. Reklamodawcy składają briefy kampanijne z wymaganiami i oczekiwaniami budżetowymi. Operatorzy flot przeglądają briefy i odpowiadają indywidualnymi ofertami. Obie strony mogą negocjować warunki przez platformę przed sfinalizowaniem rezerwacji."],
          ["Co się stanie w przypadku sporu lub problemu z jakością?", "TIY prowadzi logi audytowe wszystkich zapytań, ofert i komunikacji. Administratorzy platformy mogą przeglądać aktywność i ułatwiać rozwiązywanie sporów. Zarówno reklamodawcy, jak i przewoźnicy mają dokumentację wszystkich ustaleń poczynionych przez platformę."],
          ["Czy platforma wspiera wiele ról użytkowników?", "Tak. TIY wykorzystuje kontrolę dostępu opartą o role (RBAC) z wyraźnymi rolami: reklamodawcy, właściciele przewoźników, menedżerowie flot, admini i super admini. Każda rola ma odpowiednie uprawnienia i zakres dostępu do danych."],
          ["Jak zabezpieczone są uploady i transfery plików?", "Warstwa uploadów implementuje walidację MIME/type, limity rozmiaru plików, skanowanie antywirusowe i abstrakcję storage dla bezpiecznych dostawców chmurowych. Wszystkie pliki są serwowane przez uwierzytelnione, czasowo ograniczone URL-e."],
          ["Jakie regiony i kraje są wspierane?", "TIY jest zaprojektowane pod wdrożenie w skali europejskiej. Oferty zawierają metadane kraju, dane o zasięgu tras i wskaźniki możliwości przekraczania granic. Platforma wspiera wiele języków i regionalne wymagania compliance."]
        ]
      },
      privacy: {
        title: "Polityka prywatności",
        body: "Niniejsza Polityka prywatności opisuje, jak TIY (\"my\", \"nas\" lub \"nasz\") zbiera, wykorzystuje i chroni informacje, gdy korzystasz z naszej platformy usług marketplace reklam na ciężarówkach i naczepach.\n\n**Jakie informacje zbieramy**\nZbieramy informacje, które podajesz bezpośrednio: dane rejestracji konta, informacje o firmie, dokumenty weryfikacyjne, dane floty i pojazdów, treści ofert, briefy kampanijne, wiadomości i korespondencję. Zbieramy również dane o użytkowaniu obejmujące adresy IP, typ przeglądarki, odwiedzane strony i interakcje z platformą.\n\n**Jak wykorzystujemy Twoje informacje**\nWykorzystujemy zebrane informacje do: świadczenia i utrzymywania usług platformy, przetwarzania aplikacji weryfikacyjnych, ułatwiania transakcji marketplace, komunikowania się w sprawach zapytań i kampanii, egzekwowania warunków i zasad platformy, wykrywania i zapobiegania oszustwom lub nadużyciom oraz doskonalenia naszych usług.\n\n**Udostępnianie informacji**\nUdostępniamy informacje: innym użytkownikom platformy w zakresie niezbędnym do transakcji marketplace (np. dane reklamodawców udostępniane przewoźnikom w ramach zapytań), dostawcom usług wspierającym działanie platformy, organom prawnym gdy wymaga tego prawo oraz stronom zaangażowanym w transfery biznesowe.\n\n**Retencja danych**\nPrzechowujemy dane konta przez czas trwania konta plus okresy niezbędnej likwidacji. Dokumenty weryfikacyjne są przechowywane zgodnie z wymogami compliance. Logi audytowe są utrzymywane dla bezpieczeństwa i rozliczalności.\n\n**Twoje prawa**\nW zależności od jurysdykcji możesz mieć prawa do: dostępu do swoich danych osobowych, sprostowania nieprawidłowych informacji, usunięcia danych, ograniczenia przetwarzania, przenoszenia danych oraz sprzeciwu wobec określonego przetwarzania. Skontaktuj się z nami, aby skorzystać z tych praw.\n\n**Bezpieczeństwo**\nWdrażamy odpowiednie środki techniczne i organizacyjne obejmujące szyfrowanie, bezpieczne sesje, kontrole dostępu i regularne oceny bezpieczeństwa w celu ochrony Twoich danych.\n\n**Pliki cookies**\nUżywamy niezbędnych plików cookies do funkcjonalności platformy. Za zgodą możemy używać plików cookies analitycznych i marketingowych. Szczegóły w naszej Polityce cookies.\n\n**Kontakt**\nW sprawach prywatności skontaktuj się z nami pod adresem privacy@tiy.example.com."
      },
      terms: {
        title: "Regulamin usług",
        body: "**Akceptacja warunków**\nUzyskując dostęp lub korzystając z platformy i usług TIY, wyrażasz zgodę na związanie niniejszym Regulaminem. Jeśli nie wyrażasz zgody, nie korzystaj z platformy.\n\n**Opis platformy**\nTIY zapewnia marketplace B2B łączący reklamodawców poszukujących powierzchni reklamowych na ciężarówkach i naczepach z operatorami flot oferującymi taki inventory. Platforma ułatwia discovery, zarządzanie zapytaniami, obsługę ofert i koordynację kampanii.\n\n**Konta użytkowników**\nAby korzystać z funkcji marketplace, musisz zarejestrować konto. Odpowiadasz za utrzymywanie bezpieczeństwa konta, podawanie prawdziwych informacji i aktualizowanie danych. Role konta określają poziomy dostępu: reklamodawcy, właściciele przewoźników, menedżerowie flot i administratorzy.\n\n**Wymagania weryfikacyjne**\nFirmy transportowe ubiegające się o status zweryfikowanego muszą przesłać dokładną dokumentację do przeglądu przez administratorów. Status weryfikacji odzwierciedla ocenę administratora i nie gwarantuje wydajności, niezawodności ani zgodności. Reklamodawcy powinni przeprowadzać własną due diligence.\n\n**Standardy ofert**\nOferty muszą być dokładne, kompletne i odzwierciedlać rzeczywisty dostępny inventory. Wprowadzające w błąd, niekompletne lub oszukańcze oferty mogą być usunięte z lub bez powiadomienia. Operatorzy flot muszą utrzymywać aktualność ofert w miarę zmian dostępności.\n\n**Workflow zapytań i kampanii**\nWorkflow platformy ułatwia komunikację między reklamodawcami a przewoźnikami. TIY nie jest stroną kampanii, rezerwacji ani umów zawieranych między użytkownikami. Użytkownicy są odpowiedzialni za negocjowanie warunków, wypełnianie zobowiązań i samodzielne rozwiązywanie sporów.\n\n**Odpowiedzialność marketplace**\nTIY zapewnia infrastrukturę i narzędzia moderacji. Nie gwarantujemy dostępności inventory, wyników kampanii ani dokładności informacji przesyłanych przez użytkowników. Użytkownicy ponoszą odpowiedzialność za swoje działania marketplace i partnerstwa.\n\n**Compliance przewoźników**\nPrzewoźnicy oświadczają i gwarantują, że: są prawnymi właścicielami lub mają prawa do reklamowanych powierzchni, pojazdy spełniają obowiązujące przepisy, treści reklamowe nie naruszają prawa oraz utrzymują wymagane ubezpieczenie i dokumentację.\n\n**Odpowiedzialność reklamodawców**\nReklamodawcy oświadczają i gwarantują, że: treści reklamowe są legalne, nie naruszają praw osób trzecich, są zgodne z obowiązującymi przepisami reklamowymi oraz briefy kampanijne dokładnie opisują wymagania.\n\n**Zakazane zachowania**\nUżytkownicy nie mogą: publikować oszukańczych ofert, składać fałszywych zapytań, nękać innych użytkowników, omijać workflow platformy, próbować nieautoryzowanego dostępu ani używać platformy do nielegalnych celów.\n\n**Moderacja i egzekwowanie**\nTIY zastrzega prawo do: przeglądania ofert i komunikacji, zawieszania lub usuwania naruszających kont, usuwania nieodpowiednich treści oraz współpracy z organami ścigania.\n\n**Ograniczenie odpowiedzialności**\nTIY nie ponosi odpowiedzialności za: szkody pośrednie, przypadkowe lub wtórne; utracone zyski lub szanse biznesowe; spory użytkowników; ani działania podejmowane na podstawie informacji platformy.\n\n**Zmiany regulaminu**\nMożemy okresowo aktualizować niniejszy regulamin. Dalsze korzystanie z platformy stanowi akceptację zaktualizowanych warunków. Istotne zmiany będą komunikowane przez platformę.\n\n**Prawo właściwe**\nNiniejszy regulamin podlega obowiązującemu prawu europejskiemu. Spory mogą być rozstrzygane przez wyznaczony arbitraż lub postępowania sądowe.\n\n**Kontakt**\nW sprawach pytań o niniejszy regulamin skontaktuj się z nami pod adresem legal@tiy.example.com."
      },
      listing: {
        baseLocation: "Lokalizacja bazowa",
        pricing: "Cennik",
        estimatedReach: "Szacowany zasięg",
        monthlyMileage: "Miesięczny przebieg",
        routeCoverage: "Pokrycie tras",
        advertiserInfoTitle: "Co widzi reklamodawca",
        advertiserInfoBody: "Zweryfikowany kontekst firmy, zasięg oparty o trasy, timing kampanii i uporządkowany flow zapytań pomagają obu stronom działać szybciej i bezpieczniej."
      }
    },
    auth: {
      signInTitle: "Logowanie",
      signInHero: "Witaj z powrotem w marketplace reklam na ciężarówkach.",
      signInDescription:
        "Zaloguj się, aby zarządzać zapytaniami, ofertami, weryfikacją i aktywnością kampanii w swoim panelu.",
      signInLead: "Użyj danych konta, aby kontynuować.",
      noAccount: "Nie masz jeszcze konta?",
      createOne: "Załóż konto",
      signUpTitle: "Załóż konto",
      signUpHero: "Utworz bezpieczne konto B2B w marketplace.",
      signUpDescription:
        "Wybierz swoją rolę, przejdź onboarding i zacznij korzystać z workflow dla reklamodawców lub przewoźników.",
      signUpLead: "Silne hasła i bezpieczne sesje HttpOnly są włączone domyślnie.",
      alreadyRegistered: "Masz już konto?",
      forgotPasswordTitle: "Nie pamiętasz hasła",
      forgotPasswordBody:
        "Produkcyjny flow resetu hasła zostawiliśmy na kolejny etap, żeby podpiąć go do wybranego dostawcy e-maili transakcyjnych.",
      verifyTitle: "Weryfikacja e-mail",
      verifyBody:
        "Ten starter automatycznie weryfikuje konta demo z seeda. Strona jest gotowa pod tokenową weryfikację e-mail.",
      emailLabel: "E-mail",
      passwordLabel: "Hasło",
      fullNameLabel: "Imię i nazwisko",
      roleLabel: "Dołączam jako",
      roleAdvertiser: "Reklamodawca",
      roleCarrierOwner: "Właściciel przewoźnika",
      roleFleetManager: "Fleet manager",
      signInLoading: "Logowanie...",
      signUpLoading: "Tworzenie konta..."
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Porozmawiaj z zespołem odpowiedzialnym za marketplace.",
      description:
        "Użyj formularza kontaktowego do partnerstw, onboardingu, wdrożeń enterprise albo pytań handlowych.",
      detailsTitle: "Kontakt bezpośredni",
      detailsBody:
        "Możesz też napisać do nas bezpośrednio mailem. Wiadomości z formularza są walidowane, limitowane i gotowe pod obsługę captcha.",
      emailLabel: "E-mail",
      responseLabel: "Czas odpowiedzi",
      responseValue: "Zwykle w jeden dzień roboczy",
      formTitle: "Wyślij wiadomość",
      formDescription: "Przetwarzamy Twoje dane tylko po to, aby obsłużyć zapytanie i ewentualny dalszy kontakt, jeśli wyrazisz zgodę.",
      success: "Wiadomość została wysłana. Odezwiemy się najszybciej jak to możliwe."
    },
    form: {
      name: "Imię i nazwisko",
      email: "E-mail służbowy",
      company: "Firma",
      subject: "Temat",
      message: "Wiadomość",
      privacyConsent: "Wyrażam zgodę na przetwarzanie moich danych w celu obsługi tego zapytania.",
      marketingConsent: "Chcę otrzymywać aktualizacje produktowe i informacje o premierach e-mailem.",
      captchaPending: "Warstwa captcha jest przygotowana i można ją włączyć od razu po dodaniu kluczy dostawcy.",
      submitContact: "Wyślij wiadomość",
      sending: "Wysyłanie..."
    },
    filters: {
      searchPlaceholder: "Szukaj po trasie, przewozniku lub formacie",
      allCountries: "Wszystkie kraje",
      allRouteScopes: "Wszystkie typy tras",
      domestic: "Krajowe",
      international: "Międzynarodowe",
      mixed: "Mieszane",
      allPricingModels: "Wszystkie modele cenowe"
    },
    cookies: {
      title: "Cookies i preferencje danych",
      description:
        "Używamy niezbędnych cookies do bezpieczeństwa platformy. Za Twoją zgodą możemy włączyć także cookies analityczne i marketingowe.",
      processing:
        "Dane osobowe są przetwarzane w celu utrzymania bezpieczeństwa, zapamiętywania preferencji i ulepszania platformy zgodnie z Twoimi wyborami.",
      acceptAll: "Akceptuj wszystkie",
      rejectOptional: "Odrzuć opcjonalne",
      manage: "Ustawienia",
      save: "Zapisz preferencje",
      necessary: "Niezbędne cookies",
      necessaryDescription: "Wymagane do sesji, zabezpieczeń i podstawowego działania platformy.",
      analytics: "Cookies analityczne",
      analyticsDescription: "Pomagają nam rozumieć ruch i poprawiać UX.",
      marketing: "Cookies marketingowe",
      marketingDescription: "Wspierają atrybucję leadów i optymalizację kampanii.",
      preferencesSaved: "Preferencje cookies zostały zapisane."
    },
    dashboard: {
      workspace: "Panel",
      nav: {
        overview: "Przegląd",
        savedListings: "Zapisane oferty",
        users: "Użytkownicy",
        verifications: "Weryfikacje",
        listings: "Oferty",
        inquiries: "Zapytania",
        messages: "Wiadomości",
        notifications: "Powiadomienia",
        campaigns: "Kampanie",
        security: "Bezpieczeństwo",
        settings: "Ustawienia",
        companyProfile: "Profil firmy",
        vehicles: "Pojazdy",
        availability: "Dostępność",
        verification: "Weryfikacja",
        reports: "Raporty",
        auditLogs: "Logi audytowe",
        content: "Treści"
      },
      advertiser: {
        title: "Panel reklamodawcy",
        overviewHeading: "Planowanie kampanii i kontrola zapytań",
        overviewSubheading: "Korzystaj z zapisanych ofert, aktywnych zapytań i widoczności kampanii, aby przejść od discovery do realizacji.",
        savedListings: "Zapisane oferty",
        savedListingsSubheading: "Trzymaj pod ręką wybrane inventory, gdy zespół ocenia dopasowanie tras, zasięg i cenę.",
        savedListingsPlaceholder: "Widok zapisanych ofert jest gotowy do podłączenia pod model SavedListing dla danych na żywo.",
        inquiriesHeading: "Zapytania",
        inquiriesSubheading: "Przeglądaj odpowiedzi przewoźników, szczegóły kampanii i aktualny status każdego wysłanego briefu.",
        campaignsHeading: "Status kampanii",
        campaignsSubheading: "Śledź aktywne i zakończone bookingi, kamienie milowe i możliwości oceny po kampanii.",
        campaignsPlaceholder: "Widoki lifecycle kampanii i bookingów są przygotowane pod dalszy rollout komercyjny.",
        messagesHeading: "Wiadomości",
        messagesSubheading: "Schemat wspiera uporządkowane konwersacje powiązane z zapytaniami i przyszłymi flow supportowymi.",
        messagesPlaceholder: "Podstawa UI wiadomości jest gotowa pod integrację wątkowanych rozmów.",
        settingsHeading: "Ustawienia konta",
        settingsSubheading: "Zarządzaj danymi kontaktowymi, poświadczeniami i preferencjami powiadomień.",
        settingsPlaceholder: "Widok ustawień jest gotowy pod kontrolę profilu i powiadomień.",
        metricSavedListings: "Zapisane oferty",
        metricSavedListingsDesc: "Inventory przewoźników o wysokim dopasowaniu zapisane do dalszego planowania kampanii.",
        metricActiveInquiries: "Aktywne zapytania",
        metricActiveInquiriesDesc: "Odpowiedzi przewoźników będące obecnie w toku w wielu regionach.",
        metricLiveCampaigns: "Aktywne kampanie",
        metricLiveCampaignsDesc: "Komercyjnie aktywne placementy w obecnych oknach bookingowych.",
        campaign: "Kampania",
        listing: "Oferta",
        status: "Status"
      },
      fleet: {
        title: "Panel floty",
        overviewHeading: "Operacje, inventory i zapytania w jednym miejscu",
        overviewSubheading: "Zarządzaj danymi firmy, wystawiaj powierzchnie reklamowe i odpowiadaj na popyt reklamodawców w bezpiecznym workflow.",
        companyHeading: "Profil firmy",
        companySubheading: "Utrzymuj tożsamość prawną, siedzibę, wielkość floty i dane prezentacyjne używane w ofertach i weryfikacji.",
        vehiclesHeading: "Pojazdy",
        vehiclesSubheading: "Ustrukturyzowane rekordy ciężarówek i naczep zasilają definicje powierzchni reklamowych i generowanie ofert.",
        listingsHeading: "Oferty",
        listingsSubheading: "Kontroluj widoczność, stan moderacji i pozycjonowanie inventory dla ofert widocznych dla reklamodawców.",
        availabilityHeading: "Dostępność",
        availabilitySubheading: "Przyszłe sterowanie dostępnością może koordynować okna tras, blackouty i rezerwacje bookingowe.",
        availabilityPlaceholder: "Podstawa zarządzania dostępnością jest gotowa pod harmonogramy na poziomie ofert.",
        inquiriesHeading: "Przychodzące zapytania",
        inquiriesSubheading: "Przeglądaj briefy reklamodawców, budżety kampanii i geografie docelowe przed przygotowaniem ofert handlowych.",
        messagesHeading: "Wiadomości",
        messagesSubheading: "Ustrukturyzowane wiadomości będą osadzone na tabelach conversation i message obecnych już w schemacie.",
        messagesPlaceholder: "Placeholder UI wiadomości jest gotowy pod przyszłą współpracę przewoźnik-reklamodawca.",
        verificationHeading: "Weryfikacja",
        verificationSubheading: "Centralizuj dokumenty compliance firmy i śledź status review zanim oferty staną się w pełni live.",
        verificationEmpty: "Nie dodano jeszcze żadnych dokumentów.",
        settingsHeading: "Ustawienia",
        settingsSubheading: "Zarządzaj dostępami zespołu, poświadczeniami i przyszłymi zasadami powiadomień.",
        settingsPlaceholder: "Widok ustawień jest przygotowany pod delegowany dostęp fleet managerów i reguły alertów.",
        metricActiveListings: "Aktywne oferty",
        metricActiveListingsDesc: "Inventory obecnie widoczne dla reklamodawców.",
        metricIncomingInquiries: "Przychodzące zapytania",
        metricIncomingInquiriesDesc: "Nowe briefy czekające na review lub odpowiedź handlową.",
        metricVerificationReadiness: "Gotowość weryfikacyjna",
        metricVerificationReadinessDesc: "Kompletność dokumentów i moderacji w profilu firmy.",
        perMonth: "miesięcznie"
      },
      admin: {
        title: "Panel administratora",
        overviewHeading: "Nadzór marketplace i moderacja",
        overviewSubheading: "Przeglądaj użytkowników, firmy, oferty i logi audytowe z jednego panelu operacyjnego.",
        pendingVerifications: "Oczekujące weryfikacje",
        pendingVerificationsDesc: "Firmy lub dokumenty czekające na review.",
        listingsToModerate: "Oferty do moderacji",
        listingsToModerateDesc: "Inventory wymagające zmiany statusu albo oceny jakości.",
        auditEvents: "Zdarzenia audytowe dzisiaj",
        auditEventsDesc: "Rejestrowane akcje bezpieczeństwa i moderacji na platformie.",
        usersHeading: "Użytkownicy",
        usersSubheading: "Przeglądaj konta, role i statusy użytkowników platformy.",
        verificationsHeading: "Weryfikacje firm",
        verificationsSubheading: "Przeglądaj gotowość przewoźników, kompletność dokumentów i status weryfikacji.",
        inquiriesHeading: "Monitoring zapytań",
        inquiriesSubheading: "Przeglądaj wzorce aktywności marketplace i analizuj nietypowe lub ryzykowne zachowania.",
        auditHeading: "Logi audytowe",
        auditSubheading: "Wrażliwe akcje kont, moderacji i bezpieczeństwa są rejestrowane dla rozliczalności.",
        contentHeading: "Treści i taksonomia",
        contentSubheading: "Przygotuj zarządzanie kategoriami, FAQ i kontrolowaną administrację treści publicznych.",
        contentPlaceholder: "Podstawa zarządzania treściami jest zarezerwowana pod kontrolowane workflow redakcyjne admina.",
        verificationsUnknownHq: "Nieznana siedziba",
        auditAction: "Akcja",
        auditActor: "Aktor",
        auditEntity: "Encja",
        auditTime: "Czas",
        auditSystem: "System",
        name: "Nazwa",
        email: "E-mail",
        role: "Rola",
        status: "Status",
        listingsHeading: "Moderacja ofert",
        listingsSubheading: "Moderuj widoczność i stan weryfikacji, zachowując audytowalny ślad zmian.",
        approveListing: "Akceptuj ofertę"
      }
    }
  }
} satisfies Record<Locale, Record<string, unknown>>;

export function getMessages(locale: Locale) {
  return messages[locale];
}
