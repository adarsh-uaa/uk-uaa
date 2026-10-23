/* ==========================================================
   UK AIRPORT ASSISTANCE
   Airport → Terminal → Journey → Service Packages
   ========================================================== */

export type JourneySlug = "arrival" | "departure" | "transit";

export type TerminalSlug = "normal" | "vip";

/* ==========================================================
   TYPES
   ========================================================== */

export interface ServicePrice {
  amount: number;
  currency: string;

  // Passenger limit included in displayed price
  upToPassengers: number;

  // Optional custom price label
  data?: string;
}

export interface ServiceDetails {
  slug: string;
  title: string;
  inclusions: string[];

  additionalService?: string;

  price?: ServicePrice;

  // Optional supplier service ID
  apiServiceId?: string;
}

export interface TerminalDetails {
  label: string;

  services: Partial<Record<JourneySlug, ServiceDetails[]>>;

  // Supplier integration
  apiTerminalId?: string;
  apiEnabled?: boolean;
}

export interface AirportTerminalConfig {
  normal: TerminalDetails;
  vip?: TerminalDetails;
}

/* ==========================================================
   SERVICE CONFIGURATION
   ========================================================== */

export const terminalServices: Record<string, AirportTerminalConfig> = {
  /* --------------------------------------------------------
     LONDON HEATHROW
     -------------------------------------------------------- */

  heathrow: {
    /* NORMAL TERMINAL */

    normal: {
      label: "Normal Terminal",

      services: {
        /* ARRIVAL SERVICES */

        arrival: [
          {
            slug: "arrival-meet-greet",

            title: "LHR Arrival Meet and Greet Service",

            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage assistance (maximum 4 luggage pieces).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 3 hours of service.",
            ],

            additionalService:
              "Electric buggy service can be provided from the arrival gate to the immigration area. Additional charges may apply.",

            price: {
              amount: 90,
              currency: "USD",
              upToPassengers: 3,
              data: "Price up to 3 passengers:",
            },

            // apiServiceId: "SUPPLIER_SERVICE_ID"
          },

          {
            slug: "arrivals-meet-greet",

            title: "LHR Arrivals Meet and Greet Service",

            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 3 hours of service.",
            ],

            additionalService:
              "Electric buggy service can be provided from the arrival gate to the immigration area. Additional charges may apply.",

            price: {
              amount: 90,
              currency: "USD",
              upToPassengers: 3,
              data: "Price up to 3 passengers:",
            },

            // apiServiceId: "SUPPLIER_SERVICE_ID"
          },
        ],

        /* DEPARTURE SERVICES */

        departure: [
          {
            slug: "departure-meet-greet",

            // Kept your supplied description unchanged
            title: "LHR Arrivals Meet and Greet Service",

            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 3 hours of service.",
            ],

            additionalService:
              "Electric buggy service can be provided from the arrival gate to the immigration area. Additional charges may apply.",

            price: {
              amount: 90,
              currency: "USD",
              upToPassengers: 3,
              data: "Price up to 3 passengers:",
            },

            // apiServiceId: "SUPPLIER_SERVICE_ID"
          },
        ],

        /* TRANSIT SERVICES */

        transit: [],
      },
    },

    /* VIP TERMINAL */

    vip: {
      label: "VIP Terminal",

      // Enable only after supplier API mapping is verified
      apiEnabled: false,

      // apiTerminalId: "SUPPLIER_TERMINAL_ID",

      services: {
        arrival: [
          {
            slug: "vip-arrival-meet-greet",

            title: "LHR Arrival Meet and Greet Service",

            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage assistance (maximum 4 luggage pieces).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 3 hours of service.",
            ],

            additionalService:
              "Electric buggy service can be provided from the arrival gate to the immigration area. Additional charges may apply.",

            price: {
              amount: 90,
              currency: "USD",
              upToPassengers: 3,
              data: "Price up to 3 passengers:",
            },

            // apiServiceId: "SUPPLIER_SERVICE_ID"
          },
        ],

        departure: [],

        transit: [],
      },
    },
  },

  /* --------------------------------------------------------
     LONDON GATWICK
     -------------------------------------------------------- */

  gatwick: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [],
        departure: [],
        transit: [],
      },
    },
  },

  /* --------------------------------------------------------
     MANCHESTER
     -------------------------------------------------------- */

  manchester: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [],
        departure: [],
        transit: [],
      },
    },
  },

  /* --------------------------------------------------------
     EDINBURGH
     -------------------------------------------------------- */

  edinburgh: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [],
        departure: [],
        transit: [],
      },
    },
  },

  /* --------------------------------------------------------
     BIRMINGHAM
     -------------------------------------------------------- */

  birmingham: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [],
        departure: [],
        transit: [],
      },
    },
  },

  /* --------------------------------------------------------
     LONDON STANSTED
     -------------------------------------------------------- */

  stansted: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [],
        departure: [],
        transit: [],
      },
    },
  },
};

/* ==========================================================
   HELPERS
   ========================================================== */

const emptyAirport: AirportTerminalConfig = {
  normal: {
    label: "Normal Terminal",
    services: {},
  },
};

/**
 * Return the airport terminal configuration.
 */
export function getAirportTerminals(airport: string): AirportTerminalConfig {
  return terminalServices[airport] ?? emptyAirport;
}

/**
 * Return details for a selected terminal.
 */
export function getTerminalDetails(
  airport: string,
  terminal: TerminalSlug,
): TerminalDetails | undefined {
  return getAirportTerminals(airport)[terminal];
}

/**
 * Return all available packages for a journey.
 */
export function getServicePackages(
  airport: string,
  terminal: TerminalSlug,
  journey: string,
): ServiceDetails[] {
  if (
    journey !== "arrival" &&
    journey !== "departure" &&
    journey !== "transit"
  ) {
    return [];
  }

  return getTerminalDetails(airport, terminal)?.services[journey] ?? [];
}

/**
 * Return a specific selected package.
 *
 * If no package slug is supplied,
 * return the first available package.
 */
export function getServiceDetails(
  airport: string,
  terminal: TerminalSlug,
  journey: string,
  packageSlug?: string,
): ServiceDetails | undefined {
  const packages = getServicePackages(airport, terminal, journey);

  if (!packages.length) {
    return undefined;
  }

  if (!packageSlug) {
    return packages[0];
  }

  return packages.find((item) => item.slug === packageSlug);
}

/**
 * Check whether a terminal has any configured packages.
 */
export function hasTerminalServices(
  airport: string,
  terminal: TerminalSlug,
): boolean {
  const selectedTerminal = getTerminalDetails(airport, terminal);

  if (!selectedTerminal) {
    return false;
  }

  return Object.values(selectedTerminal.services).some(
    (packages) => (packages?.length ?? 0) > 0,
  );
}

/**
 * Return journey types that have configured packages.
 */
export function getAvailableJourneys(
  airport: string,
  terminal: TerminalSlug,
): JourneySlug[] {
  const journeys: JourneySlug[] = ["arrival", "departure", "transit"];

  return journeys.filter(
    (journey) => getServicePackages(airport, terminal, journey).length > 0,
  );
}

/**
 * Format a package price.
 */
export function formatServicePrice(price?: ServicePrice): string {
  if (!price) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

export function getSelectedServicePackages(
  airport: string,
  terminal: TerminalSlug,
  journey: string,
  packageSlugs: string[],
): ServiceDetails[] {
  const selected = new Set(packageSlugs);

  return getServicePackages(airport, terminal, journey).filter((item) =>
    selected.has(item.slug),
  );
}
