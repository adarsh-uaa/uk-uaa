export interface AirportOption {
  slug: string
  name: string
  code: string
  id: string
  types: readonly string[]
  extras?: readonly string[]
  is_vip?: boolean
}

export const airportsCatalog: readonly AirportOption[] = [
  // Primary UK hubs (VIP Hubs)
  { slug: "heathrow", name: "London Heathrow", code: "LHR", id: "740", types: ["arrival", "departure", "transit"], is_vip: true },
  { slug: "gatwick", name: "London Gatwick", code: "LGW", id: "739", types: ["arrival", "departure", "transit"], is_vip: true },
  { slug: "manchester", name: "Manchester Airport", code: "MAN", id: "744", types: ["arrival", "departure", "transit"], is_vip: true },
  { slug: "edinburgh", name: "Edinburgh Airport", code: "EDI", id: "732", types: ["arrival", "departure", "transit"], is_vip: true },
  { slug: "birmingham", name: "Birmingham Airport", code: "BHX", id: "725", types: ["arrival", "departure", "transit"], is_vip: true },
  { slug: "stansted", name: "London Stansted", code: "STN", id: "742", types: ["arrival", "departure", "transit"], is_vip: true },

  // Complete UK Airports List
  { slug: "aberdeen-international-airport", name: "Aberdeen International Airport", code: "ABZ", id: "3600", types: ["arrival", "departure", "transit"] },
  { slug: "alderney-airport", name: "Alderney Airport", code: "ACI", id: "3577", types: ["arrival", "departure", "transit"] },
  { slug: "anglesey-airport", name: "Anglesey Airport", code: "HLY", id: "3596", types: ["arrival", "departure", "transit"] },
  { slug: "barra-airport", name: "Barra Airport", code: "BRR", id: "3610", types: ["arrival", "departure", "transit"] },
  { slug: "barrow-walney-island-airfield", name: "Barrow/Walney Island Airfield", code: "BWF", id: "3589", types: ["arrival", "departure", "transit"] },
  { slug: "belfast-international-airport", name: "Belfast International Airport", code: "BFS", id: "3549", types: ["arrival", "departure", "transit"] },
  { slug: "benbecula-airport", name: "Benbecula Airport", code: "BEB", id: "3606", types: ["arrival", "departure", "transit"] },
  { slug: "blackbushe-airport", name: "Blackbushe Airport", code: "BBS", id: "3583", types: ["arrival", "departure", "transit"] },
  { slug: "blackpool-airport", name: "Blackpool Airport", code: "BLK", id: "3587", types: ["arrival", "departure", "transit"] },
  { slug: "bournemouth-airport", name: "Bournemouth Airport", code: "BOH", id: "726", types: ["arrival", "departure", "transit"] },
  { slug: "bristol-airport", name: "Bristol Airport", code: "BRS", id: "727", types: ["arrival", "departure", "transit"] },
  { slug: "cambridge-airport", name: "Cambridge Airport", code: "CBG", id: "3617", types: ["arrival", "departure", "transit"] },
  { slug: "campbeltown-airport", name: "Campbeltown Airport", code: "CAL", id: "3563", types: ["arrival", "departure", "transit"] },
  { slug: "cardiff-airport", name: "Cardiff Airport", code: "CWL", id: "3567", types: ["arrival", "departure", "transit"] },
  { slug: "chichester-goodwood-airport", name: "Chichester/Goodwood Airport", code: "QUG", id: "3633", types: ["arrival", "departure", "transit"] },
  { slug: "city-of-derry-airport", name: "City of Derry Airport", code: "LDY", id: "3552", types: ["arrival", "departure", "transit"] },
  { slug: "colonsay-airport", name: "Colonsay Airport", code: "CSA", id: "3632", types: ["arrival", "departure", "transit"] },
  { slug: "coventry-airport", name: "Coventry Airport", code: "CVT", id: "3554", types: ["arrival", "departure", "transit"] },
  { slug: "doncaster-sheffield-airport", name: "Doncaster Sheffield Airport", code: "DSA", id: "729", types: ["arrival", "departure", "transit"] },
  { slug: "dundee-airport", name: "Dundee Airport", code: "DND", id: "3608", types: ["arrival", "departure", "transit"] },
  { slug: "durham-tees-valley-airport", name: "Durham Tees Valley Airport", code: "MME", id: "3594", types: ["arrival", "departure", "transit"] },
  { slug: "east-midlands-airport", name: "East Midlands Airport", code: "EMA", id: "731", types: ["arrival", "departure", "transit"] },
  { slug: "ebbsfleet-international-station", name: "Ebbsfleet International Railway Station", code: "XQE", id: "3611", types: ["arrival", "departure", "transit"] },
  { slug: "enniskillen-st-angelo-airport", name: "Enniskillen/St Angelo Airport", code: "ENK", id: "3550", types: ["arrival", "departure", "transit"] },
  { slug: "exeter-international-airport", name: "Exeter International Airport", code: "EXT", id: "3621", types: ["arrival", "departure", "transit"] },
  { slug: "fair-isle-airport", name: "Fair Isle Airport", code: "FIE", id: "3626", types: ["arrival", "departure", "transit"] },
  { slug: "farnborough-airport", name: "Farnborough Airport", code: "FAB", id: "3582", types: ["arrival", "departure", "transit"] },
  { slug: "glasgow-airport", name: "Glasgow Airport", code: "GLA", id: "734", types: ["arrival", "departure", "transit"] },
  { slug: "gloucestershire-airport", name: "Gloucestershire Airport", code: "GLO", id: "3555", types: ["arrival", "departure", "transit"] },
  { slug: "guernsey-airport", name: "Guernsey Airport", code: "GCI", id: "3132", types: ["arrival", "departure", "transit"] },
  { slug: "hawarden-airport", name: "Hawarden Airport", code: "CEG", id: "3591", types: ["arrival", "departure", "transit"] },
  { slug: "humberside-airport", name: "Humberside Airport", code: "HUY", id: "3588", types: ["arrival", "departure", "transit"] },
  { slug: "inverness-airport", name: "Inverness Airport", code: "INV", id: "3601", types: ["arrival", "departure", "transit"] },
  { slug: "islay-airport", name: "Islay Airport", code: "ILY", id: "3604", types: ["arrival", "departure", "transit"] },
  { slug: "isle-of-man-airport", name: "Isle of Man Airport", code: "IOM", id: "3592", types: ["arrival", "departure", "transit"] },
  { slug: "jersey-airport", name: "Jersey Airport", code: "JER", id: "3578", types: ["arrival", "departure", "transit"] },
  { slug: "kinloss-barracks", name: "Kinloss Barracks", code: "FSS", id: "3614", types: ["arrival", "departure", "transit"] },
  { slug: "kirkwall-airport", name: "Kirkwall Airport", code: "KOI", id: "3597", types: ["arrival", "departure", "transit"] },
  { slug: "lasham-airfield", name: "Lasham Airfield", code: "QLA", id: "3575", types: ["arrival", "departure", "transit"] },
  { slug: "leeds-bradford-airport", name: "Leeds Bradford Airport", code: "LBA", id: "737", types: ["arrival", "departure", "transit"] },
  { slug: "leuchars-station", name: "Leuchars Station", code: "ADX", id: "3615", types: ["arrival", "departure", "transit"] },
  { slug: "liverpool-john-lennon-airport-738", name: "Liverpool John Lennon Airport (738)", code: "LPL", id: "738", types: ["arrival", "departure", "transit"] },
  { slug: "liverpool-john-lennon-airport", name: "Liverpool John Lennon Airport", code: "LPL", id: "3570", types: ["arrival", "departure", "transit"] },
  { slug: "london-biggin-hill-airport", name: "London Biggin Hill Airport", code: "BQH", id: "3580", types: ["arrival", "departure", "transit"] },
  { slug: "london-international-airport", name: "London International Airport", code: "YXU", id: "3545", types: ["arrival", "departure", "transit"] },
  { slug: "london-luton-airport-3571", name: "London Luton Airport (3571)", code: "LTN", id: "3571", types: ["arrival", "departure", "transit"] },
  { slug: "london-oxford-airport", name: "London Oxford Airport", code: "OXF", id: "3622", types: ["arrival", "departure", "transit"] },
  { slug: "london-southend-airport", name: "London Southend Airport", code: "SEN", id: "3584", types: ["arrival", "departure", "transit"] },
  { slug: "london-city-airport", name: "London City Airport", code: "LCY", id: "743", types: ["arrival", "departure", "transit"] },
  { slug: "london-luton-airport", name: "London Luton Airport", code: "LTN", id: "741", types: ["arrival", "departure", "transit"] },
  { slug: "lydd-airport", name: "Lydd Airport", code: "LYX", id: "3585", types: ["arrival", "departure", "transit"] },
  { slug: "mod-st-athan", name: "MOD St Athan", code: "DGX", id: "3561", types: ["arrival", "departure", "transit"] },
  { slug: "newcastle-international-airport-3593", name: "Newcastle International Airport (3593)", code: "NCL", id: "3593", types: ["arrival", "departure", "transit"] },
  { slug: "newcastle-international-airport", name: "Newcastle International Airport", code: "NCL", id: "745", types: ["arrival", "departure", "transit"] },
  { slug: "norwich-international-airport-3618", name: "Norwich International Airport (3618)", code: "NWI", id: "3618", types: ["arrival", "departure", "transit"] },
  { slug: "norwich-international-airport", name: "Norwich International Airport", code: "NWI", id: "746", types: ["arrival", "departure", "transit"] },
  { slug: "nottingham-airport", name: "Nottingham Airport", code: "NQT", id: "3557", types: ["arrival", "departure", "transit"] },
  { slug: "oban-airport", name: "Oban Airport", code: "OBN", id: "3627", types: ["arrival", "departure", "transit"] },
  { slug: "outer-skerries-airport", name: "Outer Skerries Airport", code: "OUK", id: "3574", types: ["arrival", "departure", "transit"] },
  { slug: "papa-westray-airport", name: "Papa Westray Airport", code: "PPW", id: "3628", types: ["arrival", "departure", "transit"] },
  { slug: "raf-coningsby", name: "RAF Coningsby", code: "QCY", id: "3566", types: ["arrival", "departure", "transit"] },
  { slug: "raf-honington", name: "RAF Honington", code: "BEQ", id: "3565", types: ["arrival", "departure", "transit"] },
  { slug: "raf-linton-on-ouse", name: "RAF Linton-on-Ouse", code: "HRT", id: "3613", types: ["arrival", "departure", "transit"] },
  { slug: "raf-lyneham", name: "RAF Lyneham", code: "LYE", id: "3560", types: ["arrival", "departure", "transit"] },
  { slug: "raf-northolt", name: "RAF Northolt", code: "NHT", id: "3576", types: ["arrival", "departure", "transit"] },
  { slug: "raf-scampton", name: "RAF Scampton", code: "SQZ", id: "3551", types: ["arrival", "departure", "transit"] },
  { slug: "raf-waddington", name: "RAF Waddington", code: "WTN", id: "3605", types: ["arrival", "departure", "transit"] },
  { slug: "redhill-aerodrome", name: "Redhill Aerodrome", code: "KRH", id: "3634", types: ["arrival", "departure", "transit"] },
  { slug: "robin-hood-airport-doncaster-3559", name: "Robin Hood Airport Doncaster Sheffield (3559)", code: "DSA", id: "3559", types: ["arrival", "departure", "transit"] },
  { slug: "rochester-airport", name: "Rochester Airport", code: "RCS", id: "3635", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-abingdon", name: "Royal Air Force Abingdon", code: "ABB", id: "3548", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-benson", name: "Royal Air Force Benson", code: "BEX", id: "3623", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-fairford", name: "Royal Air Force Fairford", code: "FFD", id: "3624", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-lossiemouth", name: "Royal Air Force Lossiemouth", code: "LMO", id: "3616", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-marham", name: "Royal Air Force Marham", code: "KNF", id: "3586", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-odiham", name: "Royal Air Force Odiham", code: "ODH", id: "3620", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-station-cottesmore", name: "Royal Air Force Station Cottesmore", code: "OKH", id: "3556", types: ["arrival", "departure", "transit"] },
  { slug: "royal-air-force-wyton", name: "Royal Air Force Wyton", code: "QUY", id: "3625", types: ["arrival", "departure", "transit"] },
  { slug: "royal-naval-air-station-yeovilton", name: "Royal Naval Air Station Yeovilton", code: "YEO", id: "3562", types: ["arrival", "departure", "transit"] },
  { slug: "sanday-airport", name: "Sanday Airport", code: "NDY", id: "3629", types: ["arrival", "departure", "transit"] },
  { slug: "scatsta-airport-3607", name: "Scatsta Airport (3607)", code: "SCS", id: "3607", types: ["arrival", "departure", "transit"] },
  { slug: "scatsta-airport-3564", name: "Scatsta Airport (3564)", code: "SDZ", id: "3564", types: ["arrival", "departure", "transit"] },
  { slug: "shoreham-airport", name: "Shoreham Airport", code: "ESH", id: "3579", types: ["arrival", "departure", "transit"] },
  { slug: "southampton-airport-3573", name: "Southampton Airport (3573)", code: "SOU", id: "3573", types: ["arrival", "departure", "transit"] },
  { slug: "southampton-airport", name: "Southampton Airport", code: "SOU", id: "747", types: ["arrival", "departure", "transit"] },
  { slug: "stornoway-airport", name: "Stornoway Airport", code: "SYY", id: "3609", types: ["arrival", "departure", "transit"] },
  { slug: "sumburgh-airport", name: "Sumburgh Airport", code: "LSI", id: "3598", types: ["arrival", "departure", "transit"] },
  { slug: "swansea-airport", name: "Swansea Airport", code: "SWS", id: "3568", types: ["arrival", "departure", "transit"] },
  { slug: "tingwall-airport", name: "Tingwall Airport", code: "LWK", id: "3630", types: ["arrival", "departure", "transit"] },
  { slug: "tiree-airport", name: "Tiree Airport", code: "TRE", id: "3612", types: ["arrival", "departure", "transit"] },
  { slug: "westray-airport", name: "Westray Airport", code: "WRY", id: "3631", types: ["arrival", "departure", "transit"] },
  { slug: "wick-john-o-groats-airport", name: "Wick John O' Groats Airport", code: "WIC", id: "3599", types: ["arrival", "departure", "transit"] }
]

export const journeyTypes = [
  { slug: "arrival", name: "VIP Arrival", id: "1" },
  { slug: "departure", name: "VIP Dispatch", id: "2" },
  { slug: "transit", name: "VIP Transit", id: "3" },
] as const;

export const vipAirportsCatalog = airportsCatalog.filter((a) => a.is_vip);

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

export const selectAirport = (slugOrCode: string): AirportOption => {
  const query = (slugOrCode || "").trim().toLowerCase();
  const fallback: AirportOption = airportsCatalog[0] ?? {
    slug: "heathrow",
    name: "London Heathrow",
    code: "LHR",
    id: "740",
    types: ["arrival", "departure", "transit"],
    is_vip: true,
  };
  const found = airportsCatalog.find(
    (a) => a.slug.toLowerCase() === query || a.code.toLowerCase() === query
  ) ?? fallback;
  return {
    ...found,
    is_vip: Boolean(found.is_vip),
    types: found.types || ["arrival", "departure", "transit"],
    extras: found.extras || [],
  };
};

export function formatApiDate(date: string) {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1]}/${String(day).padStart(2, "0")}/${year}`;
}
