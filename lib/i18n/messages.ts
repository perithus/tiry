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
      title: "Premium truck and trailer inventory for serious B2B campaigns.",
      description:
        "Connect advertisers with fleet operators selling route-backed advertising surfaces across national and cross-border logistics networks.",
      primaryCta: "Explore inventory",
      secondaryCta: "List your fleet",
      metricsDescription: "Built for enterprise-grade media planning and operational verification.",
      whyEyebrow: "Why teams choose TIY",
      whyTitle: "Marketplace infrastructure designed for trust, speed, and operational reality.",
      whyDescription:
        "The platform combines premium inventory discovery, structured inquiry workflows, and moderation-first controls so both sides can transact with confidence.",
      featuredEyebrow: "Featured inventory",
      featuredTitle: "Launch faster with verified listings.",
      featuredDescription:
        "Featured listings combine premium visibility, structured route data, and moderation-backed credibility."
    },
    marketing: {
      how: {
        eyebrow: "How it works",
        title: "A moderated B2B workflow from discovery to booking.",
        description: "Designed to make truck media inventory easier to trust, search, and operationalize.",
        steps: [
          {
            title: "Fleet owners verify their company and upload inventory",
            body: "Operational, company, and media details are captured in structured listing records designed for moderation and enterprise trust."
          },
          {
            title: "Advertisers discover inventory with campaign-oriented filters",
            body: "Route footprint, pricing model, geography, availability, and surface format narrow the search to relevant opportunities."
          },
          {
            title: "Both parties manage inquiries and bookings in one platform",
            body: "The platform supports status tracking, messaging, offer handling, and administrative oversight for safer execution."
          }
        ]
      },
      advertisers: {
        eyebrow: "For advertisers",
        title: "Plan route-aware outdoor campaigns with less guesswork.",
        description: "Browse verified fleet inventory, review structured route data, submit campaign inquiries, and manage campaign history from one workspace.",
        features: [
          ["Search with media-planning filters", "Sort listings by geography, route scope, pricing model, ad surface, budget fit, and carrier profile."],
          ["Submit structured briefs", "Send campaign timing, target territories, budgets, and goals directly to verified fleet operators."],
          ["Track status and responses", "Monitor inquiry progress, offers, campaign states, and platform messages across current and past activity."],
          ["Build with confidence", "Use moderated listings and verification-backed company profiles to reduce supplier uncertainty."]
        ]
      },
      carriers: {
        eyebrow: "For transport companies",
        title: "Monetize fleet visibility with a safer operational workflow.",
        description: "List ad-ready surfaces on trucks and trailers, define routes and pricing, manage inquiries, and centralize verification requirements.",
        features: [
          ["Manage fleets and surfaces", "Represent trucks, trailers, ad surfaces, availability windows, route coverage, and proof imagery in one domain model."],
          ["Respond with structured offers", "Move from inbound inquiry to custom offer and booking-ready workflow without scattered email threads."],
          ["Verification-first trust layer", "Surface compliance readiness with company documents, moderation status, and admin-reviewed inventory."],
          ["Role-aware access", "Separate carrier ownership from delegated fleet management using RBAC and company-scoped permissions."]
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
          ["How are companies verified?", "Admins can review company status, submitted documents, and listing quality before granting verified status."],
          ["Can advertisers book directly?", "The MVP supports inquiry and offer workflows first, with booking records once terms are accepted."],
          ["Does the platform support multiple user roles?", "Yes. Advertisers, carrier owners, fleet managers, admins, and super admins are separated through RBAC."],
          ["How are uploads secured?", "The upload layer is designed with MIME/type validation, file size caps, and storage abstraction for hardened providers."]
        ]
      },
      privacy: {
        title: "Privacy Policy",
        body: "This starter includes secure-by-default handling for sessions, credentials, validation, and auditability. A production launch should complete a jurisdiction-specific privacy notice and data processing addendum."
      },
      terms: {
        title: "Terms",
        body: "This repository provides a production-oriented marketplace foundation. Commercial launch should add full legal terms covering marketplace liability, carrier compliance, campaign approvals, and booking conditions."
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
        campaigns: "Campaigns",
        settings: "Settings",
        companyProfile: "Company profile",
        vehicles: "Vehicles",
        availability: "Availability",
        verification: "Verification",
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
      title: "Premium powierzchnie reklamowe na ciężarówkach i naczepach dla poważnych kampanii B2B.",
      description:
        "Łączymy reklamodawców z operatorami flot, którzy sprzedają powierzchnie reklamowe oparte o realne trasy krajowe i międzynarodowe.",
      primaryCta: "Przeglądaj oferty",
      secondaryCta: "Dodaj swoją flotę",
      metricsDescription: "Zaprojektowane pod planowanie kampanii klasy enterprise i wiarygodną weryfikację operacyjną.",
      whyEyebrow: "Dlaczego zespoły wybierają TIY",
      whyTitle: "Infrastruktura marketplace zbudowana pod zaufanie, szybkość i realia operacyjne.",
      whyDescription:
        "Platforma łączy premium discovery ofert, uporządkowany workflow zapytań oraz moderację, dzięki czemu obie strony mogą działać pewniej.",
      featuredEyebrow: "Wybrane oferty",
      featuredTitle: "Startuj szybciej ze zweryfikowanymi ofertami.",
      featuredDescription:
        "Wybrane oferty łączą wysoką widoczność, dane o trasach i wiarygodność wspartą moderacją."
    },
    marketing: {
      how: {
        eyebrow: "Jak to działa",
        title: "Moderowany workflow B2B od discovery do rezerwacji.",
        description: "Zaprojektowane tak, by inventory reklamowe na ciężarówkach było łatwiejsze do zaufania, wyszukania i wdrożenia.",
        steps: [
          {
            title: "Właściciele flot weryfikują firmę i dodają inventory",
            body: "Dane operacyjne, firmowe i mediowe są zapisywane w ustrukturyzowanych ofertach gotowych do moderacji i oceny przez biznes."
          },
          {
            title: "Reklamodawcy odkrywają inventory przez filtry kampanijne",
            body: "Zasięg tras, model cenowy, geografia, dostępność i format powierzchni zawężają wyszukiwanie do sensownych opcji."
          },
          {
            title: "Obie strony zarządzają zapytaniami i bookingami w jednym miejscu",
            body: "Platforma wspiera statusy, wiadomości, oferty i nadzór administracyjny, żeby egzekucja była bezpieczniejsza."
          }
        ]
      },
      advertisers: {
        eyebrow: "Dla reklamodawców",
        title: "Planuj kampanie outdoorowe oparte o trasy z mniejszą ilością zgadywania.",
        description: "Przeglądaj zweryfikowane inventory flot, analizuj dane o trasach, wysyłaj zapytania kampanijne i zarządzaj historią działań z jednego miejsca.",
        features: [
          ["Szukaj po filtrach mediowych", "Sortuj oferty po geografii, zasięgu tras, modelu cenowym, typie powierzchni, budżecie i profilu przewoźnika."],
          ["Wysyłaj uporządkowane briefy", "Przekazuj terminy kampanii, kraje docelowe, budżety i cele bezpośrednio do zweryfikowanych operatorów flot."],
          ["Śledź statusy i odpowiedzi", "Monitoruj postęp zapytań, oferty, statusy kampanii i wiadomości platformowe dla bieżących i zakończonych działań."],
          ["Buduj kampanie pewniej", "Korzystaj z moderowanych ofert i profili firm wspartych weryfikacją, aby ograniczyć ryzyko dostawcy."]
        ]
      },
      carriers: {
        eyebrow: "Dla firm transportowych",
        title: "Monetyzuj widoczność floty przez bezpieczniejszy workflow operacyjny.",
        description: "Dodawaj powierzchnie reklamowe na ciężarówkach i naczepach, definiuj trasy i ceny, zarządzaj zapytaniami i centralizuj wymagania weryfikacyjne.",
        features: [
          ["Zarządzaj flotą i powierzchniami", "Opisuj ciężarówki, naczepy, powierzchnie reklamowe, okna dostępności, zasięg tras i zdjęcia dowodowe w jednym modelu domenowym."],
          ["Odpowiadaj uporządkowanymi ofertami", "Przejdź od incoming inquiry do indywidualnej oferty i workflow gotowego pod booking bez chaosu w mailach."],
          ["Warstwa zaufania oparta o weryfikację", "Pokazuj gotowość compliance przez dokumenty firmy, status moderacji i inventory przeglądane przez admina."],
          ["Dostęp oparty o role", "Oddziel właściciela przewoźnika od delegowanego fleet managera przez RBAC i zakresy firmowe."]
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
          ["Jak firmy są weryfikowane?", "Admini mogą sprawdzać status firmy, przesłane dokumenty i jakość oferty zanim nadadzą status verified."],
          ["Czy reklamodawcy mogą bookować bezpośrednio?", "MVP najpierw wspiera workflow zapytań i ofert, a booking pojawia się po zaakceptowaniu warunków."],
          ["Czy platforma wspiera wiele ról?", "Tak. Reklamodawcy, właściciele przewoźników, fleet managerowie, admini i super admini są rozdzieleni przez RBAC."],
          ["Jak zabezpieczane są uploady?", "Warstwa uploadów ma walidację MIME/type, limity rozmiaru i abstrakcję storage gotową pod twardszych dostawców."]
        ]
      },
      privacy: {
        title: "Polityka prywatności",
        body: "Ten starter zawiera bezpieczne domyślnie podejście do sesji, credentials, walidacji i audytowalności. Wersja produkcyjna powinna dostać pełną politykę prywatności i zapisy o przetwarzaniu danych zgodne z jurysdykcją."
      },
      terms: {
        title: "Regulamin",
        body: "To repozytorium daje produkcyjny fundament marketplace. Komercyjny launch powinien dodać pełne warunki dotyczące odpowiedzialności platformy, compliance przewoźników, akceptacji kampanii i warunków bookingów."
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
        campaigns: "Kampanie",
        settings: "Ustawienia",
        companyProfile: "Profil firmy",
        vehicles: "Pojazdy",
        availability: "Dostępność",
        verification: "Weryfikacja",
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
