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
     LONDON HEATHROW (LHR)
     -------------------------------------------------------- */
  heathrow: {
    /* NORMAL TERMINAL */
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "lhr-arrival-meet-greet",
            title: "LHR Arrival Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (maximum 4 luggage).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 3 hours of service."
            ],
            additionalService:
              "Electric buggy service can be provided from the arrival gate to the immigration area. Additional charges may apply.",
            price: {
              amount: 990,
              currency: "USD",
              upToPassengers: 3,
              data: "Price upto 3 passengers: 990 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "lhr-departure-meet-greet",
            title: "LHR Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 4 luggage).",
              "Assistance with Check In formalities.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 3 hours of service."
            ],
            additionalService:
              "Electric buggy service can be provided from the security checkpoint to the boarding gate. Additional charges may apply.",
            price: {
              amount: 560,
              currency: "USD",
              upToPassengers: 3,
              data: "Price upto 3 passengers: 560 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "lhr-transit-meet-greet",
            title: "LHR Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Transfer between terminals, if required.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 2 hours of service."
            ],
            additionalService:
              "Electric buggy service can be provided from the security checkpoint to the boarding gate. Additional charges may apply.",
            price: {
              amount: 425,
              currency: "USD",
              upToPassengers: 2,
              data: "Price upto 2 passengers: 425 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    },

    /* VIP TERMINAL */
    vip: {
      label: "VIP Terminal (Windsor Suite)",
      apiEnabled: false,
      services: {
        arrival: [
          {
            slug: "lhr-vip-arrival-meet-greet",
            title: "LHR VIP Arrival Meet and Greet Service",
            inclusions: [
              "Meet your greeter after leaving the aircraft either at the aerobridge or at the footsteps of the aircraft.",
              "You will be escorted to the VIP suite in a private luxury chauffeur-driven car.",
              "You will be directed to the private lounge where you can relax while we serve a full menu of food and drinks.",
              "All the passport and immigration formalities will be handled by our team.",
              "We take your baggage tags and arrange for the collection of the baggage.",
              "The baggage team collects your luggage.",
              "Our chauffeur service will take you to any address in the UK."
            ],
            price: {
              amount: 7025,
              currency: "USD",
              upToPassengers: 3,
              data: "Price for 1-3 passengers: 7,025 USD (4-6 pax: 9,187 USD | 7-9 pax: 11,130 USD | 10-12 pax: 12,966 USD)"
            },
            apiServiceId: "11"
          }
        ],
        departure: [
          {
            slug: "lhr-vip-departure-meet-greet",
            title: "LHR VIP Departure Meet and Greet Service",
            inclusions: [
              "Our chauffeur service picks you up from any address in the UK.",
              "Our greeter will meet you at the curb side and escort you to the private lounge.",
              "Assist you in baggage handling processes.",
              "Facilitates check in with the airline.",
              "You can relax in your private lounge, order food and drink, go shopping, reclaim VAT or pass the time however you wish.",
              "Be escorted to the aircraft in a luxury chauffeur-driven car at the time of departure."
            ],
            price: {
              amount: 7025,
              currency: "USD",
              upToPassengers: 3,
              data: "Price for 1-3 passengers: 7,025 USD (4-6 pax: 9,187 USD | 7-9 pax: 11,130 USD | 10-12 pax: 12,966 USD)"
            },
            apiServiceId: "11"
          }
        ],
        transit: [
          {
            slug: "lhr-vip-transit-meet-greet",
            title: "LHR VIP Transit Meet and Greet Service",
            inclusions: [
              "Meet your greeter after leaving the aircraft either at the aerobridge or at the footsteps of the aircraft.",
              "We take your baggage tags and arrange for the collection of the baggage.",
              "You will be escorted to the VIP suite in a private luxury chauffeur-driven car.",
              "You will be directed to the private lounge where you can relax while we serve a full menu of food and drinks.",
              "All the passport and immigration formalities will be handled by our team.",
              "Facilitates check in with the airline.",
              "Be escorted to the aircraft in a luxury chauffeur-driven car at the time of departure."
            ],
            price: {
              amount: 7025,
              currency: "USD",
              upToPassengers: 3,
              data: "Price for 1-3 passengers: 7,025 USD (4-6 pax: 9,187 USD | 7-9 pax: 11,130 USD | 10-12 pax: 12,966 USD)"
            },
            apiServiceId: "11"
          }
        ]
      }
    }
  },

  /* --------------------------------------------------------
     LONDON GATWICK (LGW)
     -------------------------------------------------------- */
  gatwick: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "lgw-gold-arrival-meet-greet",
            title: "LGW Gold Arrival Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (Maximum 4 luggage).",
              "Escort through customs formalities.",
              "Coordinate with the driver for a meeting point.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum service duration: 3 hours."
            ],
            price: {
              amount: 560,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 560 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "lgw-gold-departure-meet-greet",
            title: "LGW Gold Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 4 luggage).",
              "Assistance with Check In formalities.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 3 hours service."
            ],
            price: {
              amount: 560,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 560 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "lgw-gold-transit-meet-greet",
            title: "LGW Gold Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (maximum 4 luggage), if required.",
              "Escort through customs formalities.",
              "Assistance with Check-in formalities, if required.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 3 hours service."
            ],
            price: {
              amount: 600,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 600 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    },

    vip: {
      label: "VIP Terminal",
      services: {
        arrival: [
          {
            slug: "lgw-vip-arrival-meet-greet",
            title: "LGW VIP Arrival Meet and Greet Service",
            inclusions: [
              "A VIP terminal staff member will greet you at the aircraft with a name board.",
              "Escort you in a chauffeur-driven vehicle directly to our lounges, where dedicated immigration personnel will assist with your entry into the United Kingdom.",
              "Your checked-in luggage will be collected directly from the aircraft and delivered to the lounge, ready for your onward journey.",
              "Assistance will be provided until you reach your vehicle.",
              "Maximum 3 bags per passenger.",
              "Service up to 3 hours."
            ],
            price: {
              amount: 1870,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 1,870 USD (Additional Passenger: 880 USD | Child 2-12y: 370 USD)"
            },
            apiServiceId: "11"
          }
        ],
        departure: [
          {
            slug: "lgw-vip-departure-meet-greet",
            title: "LGW VIP Departure Meet and Greet Service",
            inclusions: [
              "Upon your arrival at the VIP Terminal, our staff will warmly welcome you and assist with the airline check In formalities.",
              "You will then be escorted to a lounge where you can relax while waiting for your departure.",
              "Beverages and pre-packaged refreshments will be available in our lounges.",
              "When it’s time to board your flight, you will be guided through dedicated security screening and transported in a luxury vehicle directly to the aircraft.",
              "Maximum 3 bags per passenger.",
              "Service up to 3 hours."
            ],
            price: {
              amount: 1870,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 1,870 USD (Additional Passenger: 880 USD | Child 2-12y: 370 USD)"
            },
            apiServiceId: "11"
          }
        ],
        transit: [
          {
            slug: "lgw-vip-transit-meet-greet",
            title: "LGW VIP Transit Meet and Greet Service",
            inclusions: [
              "A VIP terminal staff member will greet you at the aircraft with a name board.",
              "Escort you in a chauffeur-driven vehicle directly to our lounges, where dedicated immigration personnel will assist with your entry into the United Kingdom.",
              "Your checked-in luggage will be collected directly from the aircraft and delivered to the check In counter, if required.",
              "When it’s time to board your flight, you will be guided through dedicated security screening and transported in a luxury vehicle directly to the aircraft.",
              "Service up to 3 hours."
            ],
            price: {
              amount: 0,
              currency: "USD",
              upToPassengers: 1,
              data: "Price upon request"
            },
            apiServiceId: "11"
          }
        ]
      }
    }
  },

  /* --------------------------------------------------------
     BIRMINGHAM (BHX)
     -------------------------------------------------------- */
  birmingham: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "bhx-arrival-meet-greet",
            title: "BHX Arrival Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (maximum 4 luggage).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum service duration: 2 hours."
            ],
            price: {
              amount: 280,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 280 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "bhx-departure-meet-greet",
            title: "BHX Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 4 luggage).",
              "Assistance with Check In formalities.",
              "Escort through immigration assistance.",
              "Fast-track through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate."
            ],
            price: {
              amount: 280,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 280 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "bhx-transit-meet-greet",
            title: "BHX Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Transfer between terminals, if required.",
              "Fast-track through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate."
            ],
            price: {
              amount: 280,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 280 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    }
  },

  /* --------------------------------------------------------
     LONDON STANSTED (STN)
     -------------------------------------------------------- */
  stansted: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "stn-arrival-meet-greet",
            title: "STN Arrival Meet and Greet Service",
            inclusions: [
              "Meet your travel concierge at your arrival gate after leaving the plane with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (maximum 8 luggage).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum 2 hours service."
            ],
            price: {
              amount: 770,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1st passenger: 770 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "stn-departure-meet-greet",
            title: "STN Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 8 luggage).",
              "Assistance with Check In formalities.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 2 hours service."
            ],
            price: {
              amount: 770,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1st passenger: 770 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "stn-transit-meet-greet",
            title: "STN Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Transfer between terminals, if required.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum 3 hours service."
            ],
            price: {
              amount: 565,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1st passenger: 565 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    }
  },

  /* --------------------------------------------------------
     EDINBURGH (EDI)
     -------------------------------------------------------- */
  edinburgh: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "edi-arrival-meet-greet",
            title: "EDI Arrival Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Escort through immigration.",
              "Baggage Assistance (maximum 3 luggage).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup.",
              "Maximum service duration: 3 hours."
            ],
            price: {
              amount: 380,
              currency: "USD",
              upToPassengers: 4,
              data: "Price up to 4 passengers: 380 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "edi-departure-meet-greet",
            title: "EDI Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 3 luggage).",
              "Assistance with Check In formalities.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum service duration: 3 hours."
            ],
            price: {
              amount: 430,
              currency: "USD",
              upToPassengers: 4,
              data: "Price up to 4 passengers: 430 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "edi-transit-meet-greet",
            title: "EDI Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Escort through immigration.",
              "Baggage Assistance (maximum 3 luggage), if required.",
              "Escort you through customs formalities.",
              "Transfer between terminals, if required.",
              "Assistance with Check-in formalities, if required.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate.",
              "Maximum service duration: 3 hours."
            ],
            price: {
              amount: 760,
              currency: "USD",
              upToPassengers: 4,
              data: "Price up to 4 passengers: 760 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    }
  },

  /* --------------------------------------------------------
     MANCHESTER (MAN)
     -------------------------------------------------------- */
  manchester: {
    normal: {
      label: "Normal Terminal",
      services: {
        arrival: [
          {
            slug: "man-arrival-meet-greet",
            title: "MAN Arrival Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Baggage Assistance (maximum 4 luggage).",
              "Escort through customs formalities.",
              "Escort to the airport exit and coordinate with your driver for pickup."
            ],
            price: {
              amount: 295,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 295 USD"
            },
            apiServiceId: "1"
          }
        ],
        departure: [
          {
            slug: "man-departure-meet-greet",
            title: "MAN Departure Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the curb side.",
              "Baggage Assistance (maximum 4 luggage).",
              "Assistance with Check In formalities.",
              "Fast-track immigration assistance.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate."
            ],
            price: {
              amount: 295,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 295 USD"
            },
            apiServiceId: "1"
          }
        ],
        transit: [
          {
            slug: "man-transit-meet-greet",
            title: "MAN Transit Meet and Greet Service",
            inclusions: [
              "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
              "Fast-track immigration assistance.",
              "Transfer between terminals, if required.",
              "Escort through security.",
              "Escort to lounge (subject to lounge access eligibility).",
              "Escort to boarding gate."
            ],
            price: {
              amount: 295,
              currency: "USD",
              upToPassengers: 1,
              data: "Price for 1 passenger: 295 USD"
            },
            apiServiceId: "1"
          }
        ]
      }
    }
  }
};

/* ==========================================================
   HELPERS & FALLBACK
   ========================================================== */

const standardUkAirportConfig: AirportTerminalConfig = {
  normal: {
    label: "Normal Terminal",
    services: {
      arrival: [
        {
          slug: "uk-arrival-meet-greet",
          title: "UK Airport Arrival Meet and Greet Service",
          inclusions: [
            "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
            "Fast-track immigration assistance.",
            "Baggage Assistance (maximum 4 luggage).",
            "Escort through customs formalities.",
            "Escort to the airport exit and coordinate with your driver for pickup.",
            "Maximum 3 hours of service."
          ],
          price: {
            amount: 295,
            currency: "USD",
            upToPassengers: 1,
            data: "Price for 1 passenger: 295 USD"
          },
          apiServiceId: "1"
        }
      ],
      departure: [
        {
          slug: "uk-departure-meet-greet",
          title: "UK Airport Departure Meet and Greet Service",
          inclusions: [
            "Meet your personal greeter at the curb side.",
            "Baggage Assistance (maximum 4 luggage).",
            "Assistance with Check In formalities.",
            "Fast-track immigration assistance.",
            "Escort through security.",
            "Escort to lounge (subject to lounge access eligibility).",
            "Escort to boarding gate."
          ],
          price: {
            amount: 295,
            currency: "USD",
            upToPassengers: 1,
            data: "Price for 1 passenger: 295 USD"
          },
          apiServiceId: "1"
        }
      ],
      transit: [
        {
          slug: "uk-transit-meet-greet",
          title: "UK Airport Transit Meet and Greet Service",
          inclusions: [
            "Meet your personal greeter at the end of the aerobridge or at the arrival gate with a name board.",
            "Fast-track immigration assistance.",
            "Transfer between terminals, if required.",
            "Escort through security.",
            "Escort to lounge (subject to lounge access eligibility).",
            "Escort to boarding gate."
          ],
          price: {
            amount: 295,
            currency: "USD",
            upToPassengers: 1,
            data: "Price for 1 passenger: 295 USD"
          },
          apiServiceId: "1"
        }
      ]
    }
  }
};

/**
 * Return the airport terminal configuration.
 */
export function getAirportTerminals(airport: string): AirportTerminalConfig {
  return terminalServices[airport] ?? standardUkAirportConfig;
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
  if (!price || price.amount === 0) {
    return price?.data || "Price on request";
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
