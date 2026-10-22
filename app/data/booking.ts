// DEMONSTRATION CONFIG ONLY. Replace IDs and allowed service combinations with your supplier's verified values.
export const airportsCatalog = [
  {
    slug: "heathrow",
    name: "London Heathrow",
    code: "LHR",
    id: "",
    types: ["arrival", "departure", "transit"],
    extras: ["porter", "lounge", "family", "chauffeur"],
  },
  {
    slug: "gatwick",
    name: "London Gatwick",
    code: "LGW",
    id: "",
    types: ["arrival", "departure"],
    extras: ["porter", "family", "chauffeur"],
  },
  {
    slug: "manchester",
    name: "Manchester",
    code: "MAN",
    id: "",
    types: ["arrival", "departure", "transit"],
    extras: ["lounge", "family", "chauffeur"],
  },
  {
    slug: "edinburgh",
    name: "Edinburgh",
    code: "EDI",
    id: "",
    types: ["arrival", "departure"],
    extras: ["family", "chauffeur"],
  },
  {
    slug: "birmingham",
    name: "Birmingham",
    code: "BHX",
    id: "",
    types: ["arrival", "departure"],
    extras: ["porter", "family"],
  },
  {
    slug: "stansted",
    name: "London Stansted",
    code: "STN",
    id: "",
    types: ["arrival", "departure"],
    extras: ["family", "chauffeur"],
  },
] as const;
export const journeyTypes = [
  { slug: "arrival", name: "VIP Arrival", id: "1" },
  { slug: "departure", name: "VIP Departure", id: "2" },
  { slug: "transit", name: "VIP Transit", id: "3" },
] as const;
export const extrasCatalog = [
  { slug: "porter", name: "Porter & luggage assistance", id: "" },
  { slug: "lounge", name: "VIP lounge arrangement", id: "" },
  { slug: "family", name: "Family assistance", id: "" },
  { slug: "chauffeur", name: "Chauffeur coordination", id: "" },
] as const;
export const classes = [
  { name: "Economy", id: "1" },
  { name: "Premium Economy", id: "2" },
  { name: "Business", id: "3" },
  { name: "First Class", id: "4" },
];
export const communicationMethods = [
  "Email (Default)",
  "WhatsApp – Message Only",
  "WhatsApp – Message & Call",
  "Direct Call",
];
export const selectAirport = (slug: string) =>
  airportsCatalog.find((a) => a.slug === slug) || airportsCatalog[0];
export function formatApiDate(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]}/${String(day).padStart(2, "0")}/${year}`;
}
