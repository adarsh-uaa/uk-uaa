export type JourneySlug = "arrival" | "departure" | "transit";
export type TerminalSlug = "normal" | "vip";

export interface ServiceDetails {
  slug: string;
  title: string;
  inclusions: string[];
  additionalService?: string;
  price?: {
    amount: number;
    currency: string;
    upToPassengers: number;
  };
  apiServiceId?: string;
}

export interface TerminalDetails {
  label: string;
  services: Partial<Record<JourneySlug, ServiceDetails[]>>;
  apiTerminalId?: string;
  apiEnabled?: boolean;
}

export interface AirportTerminalConfig {
  normal: TerminalDetails;
  vip?: TerminalDetails;
}

export const terminalServices: Record<string, AirportTerminalConfig> = {
  heathrow: {
    normal: {
      label: "Normal Terminal",
      services: {
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
              data: "Price upto 3 passengers:",
            },
            // apiServiceId: 'CONFIRMED_SUPPLIER_ID'
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
              data: "Price upto 3 passengers:",
            },
            // apiServiceId: 'CONFIRMED_SUPPLIER_ID'
          },
        ],
        departure: [
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
              data: "Price upto 3 passengers:",
            },
            // apiServiceId: 'CONFIRMED_SUPPLIER_ID'
          },
        ],
        transit: [],
      },
    },

    vip: {
      label: "VIP Terminal",
      apiEnabled: false,
      services: {
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
              data: "Price upto 3 passengers:",
            },
            // apiServiceId: 'CONFIRMED_SUPPLIER_ID'
          },
        ],
        departure: [],
        transit: [],
      },
    },
  },

  gatwick: {
    normal: {
      label: "Normal Terminal",
      services: {},
    },
  },

  manchester: {
    normal: {
      label: "Normal Terminal",
      services: {},
    },
  },

  edinburgh: {
    normal: {
      label: "Normal Terminal",
      services: {},
    },
  },

  birmingham: {
    normal: {
      label: "Normal Terminal",
      services: {},
    },
  },

  stansted: {
    normal: {
      label: "Normal Terminal",
      services: {},
    },
  },
};

export function getAirportTerminals(airport: string): AirportTerminalConfig {
  return (
    terminalServices[airport] || {
      normal: {
        label: "Normal Terminal",
        services: {},
      },
    }
  );
}

export function getTerminalDetails(
  airport: string,
  terminal: TerminalSlug,
): TerminalDetails | undefined {
  return getAirportTerminals(airport)[terminal];
}

export function getServicePackages(
  airport: string,
  terminal: TerminalSlug,
  journey: string,
): ServiceDetails[] {
  return (
    getTerminalDetails(airport, terminal)?.services[journey as JourneySlug] ||
    []
  );
}

export function getServiceDetails(
  airport: string,
  terminal: TerminalSlug,
  journey: string,
  packageSlug?: string,
): ServiceDetails | undefined {
  const packages = getServicePackages(airport, terminal, journey);

  return packageSlug
    ? packages.find((item) => item.slug === packageSlug)
    : packages[0];
}
