/**
 * Comprehensive Indian States, Union Territories, and Standardized Cities with Alias / Historical Name Resolution.
 * Automatically resolves common/historical names (e.g., Bangalore -> Bengaluru, Bombay -> Mumbai, Madras -> Chennai).
 */

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export interface CityItem {
  canonical: string;
  state: string;
  displayLabel?: string;
  aliases: string[];
}

export interface AutocompleteOption {
  value: string;
  label: string;
  subtitle?: string;
  state?: string;
  matchTerms?: string[];
}

/**
 * Canonical standardized city records with alias synonyms
 */
export const STANDARDIZED_CITIES: CityItem[] = [
  // --- Karnataka ---
  {
    canonical: 'Bengaluru',
    state: 'Karnataka',
    aliases: ['bangalore', 'bengaluru', 'banglore', 'bengalore', 'bengaluru urban', 'bengaluru rural', 'bangalore urban', 'bangalore rural', 'bengalooru', 'blr'],
  },
  {
    canonical: 'Mysuru',
    state: 'Karnataka',
    aliases: ['mysore', 'mysuru', 'maisuru', 'mysooru'],
  },
  {
    canonical: 'Mangaluru',
    state: 'Karnataka',
    aliases: ['mangalore', 'mangaluru', 'mangalor', 'mangalooru'],
  },
  {
    canonical: 'Belagavi',
    state: 'Karnataka',
    aliases: ['belgaum', 'belagavi'],
  },
  {
    canonical: 'Hubballi-Dharwad',
    state: 'Karnataka',
    aliases: ['hubli', 'hubballi', 'dharwad', 'hubli-dharwad', 'hubli dharwad'],
  },
  {
    canonical: 'Kalaburagi',
    state: 'Karnataka',
    aliases: ['gulbarga', 'kalaburagi', 'kalburgi'],
  },
  {
    canonical: 'Ballari',
    state: 'Karnataka',
    aliases: ['bellary', 'ballari'],
  },
  {
    canonical: 'Vijayapura',
    state: 'Karnataka',
    aliases: ['bijapur', 'vijayapura', 'vijayapur'],
  },
  {
    canonical: 'Shivamogga',
    state: 'Karnataka',
    aliases: ['shimoga', 'shivamogga', 'shivamoga'],
  },
  {
    canonical: 'Tumakuru',
    state: 'Karnataka',
    aliases: ['tumkur', 'tumakuru'],
  },
  {
    canonical: 'Hosapete',
    state: 'Karnataka',
    aliases: ['hospet', 'hosapete', 'hampi'],
  },
  {
    canonical: 'Chikkamagaluru',
    state: 'Karnataka',
    aliases: ['chikmagalur', 'chikkamagaluru'],
  },
  { canonical: 'Davanagere', state: 'Karnataka', aliases: ['davangere'] },
  { canonical: 'Udupi', state: 'Karnataka', aliases: ['udipi', 'manipal'] },
  { canonical: 'Hassan', state: 'Karnataka', aliases: [] },
  { canonical: 'Raichur', state: 'Karnataka', aliases: [] },
  { canonical: 'Bidar', state: 'Karnataka', aliases: [] },
  { canonical: 'Mandya', state: 'Karnataka', aliases: [] },
  { canonical: 'Gadag', state: 'Karnataka', aliases: ['gadag-betageri'] },
  { canonical: 'Bagalkot', state: 'Karnataka', aliases: ['ilkal', 'bagalkote', 'ilkal sarees'] },
  { canonical: 'Kolar', state: 'Karnataka', aliases: ['kgf', 'robertsonpet'] },
  { canonical: 'Chitradurga', state: 'Karnataka', aliases: ['molakalmuru', 'molakalmuru silk'] },
  { canonical: 'Chikkaballapur', state: 'Karnataka', aliases: ['chickballapur'] },
  { canonical: 'Ramanagara', state: 'Karnataka', aliases: ['ramnagar', 'ramanagar', 'silk city'] },
  { canonical: 'Karwar', state: 'Karnataka', aliases: ['uttara kannada'] },
  { canonical: 'Sirsi', state: 'Karnataka', aliases: [] },

  // --- Maharashtra ---
  {
    canonical: 'Mumbai',
    state: 'Maharashtra',
    aliases: ['bombay', 'mumbai', 'mumbai suburban', 'mumbai city', 'bombay city'],
  },
  {
    canonical: 'Pune',
    state: 'Maharashtra',
    aliases: ['poona', 'pune', 'pimpri', 'chinchwad', 'pimpri-chinchwad'],
  },
  {
    canonical: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    aliases: ['aurangabad', 'sambhajinagar', 'chhatrapati sambhajinagar', 'paithan', 'paithani'],
  },
  {
    canonical: 'Dharashiv',
    state: 'Maharashtra',
    aliases: ['osmanabad', 'dharashiv'],
  },
  {
    canonical: 'Ahilyanagar',
    state: 'Maharashtra',
    aliases: ['ahmednagar', 'ahilyanagar'],
  },
  {
    canonical: 'Nashik',
    state: 'Maharashtra',
    aliases: ['nasik', 'nashik', 'yeola', 'yeola paithani'],
  },
  { canonical: 'Nagpur', state: 'Maharashtra', aliases: [] },
  { canonical: 'Thane', state: 'Maharashtra', aliases: ['navi mumbai', 'kalyan', 'dombivli'] },
  { canonical: 'Solapur', state: 'Maharashtra', aliases: ['sholapur'] },
  { canonical: 'Kolhapur', state: 'Maharashtra', aliases: [] },
  { canonical: 'Amravati', state: 'Maharashtra', aliases: [] },
  { canonical: 'Nanded', state: 'Maharashtra', aliases: [] },
  { canonical: 'Sangli', state: 'Maharashtra', aliases: ['miraj'] },
  { canonical: 'Jalgaon', state: 'Maharashtra', aliases: [] },
  { canonical: 'Akola', state: 'Maharashtra', aliases: [] },
  { canonical: 'Latur', state: 'Maharashtra', aliases: [] },
  { canonical: 'Dhule', state: 'Maharashtra', aliases: [] },
  { canonical: 'Chandrapur', state: 'Maharashtra', aliases: [] },
  { canonical: 'Satara', state: 'Maharashtra', aliases: [] },

  // --- Tamil Nadu ---
  {
    canonical: 'Chennai',
    state: 'Tamil Nadu',
    aliases: ['madras', 'chennai', 'madras city'],
  },
  {
    canonical: 'Kanchipuram',
    state: 'Tamil Nadu',
    aliases: ['kanchi', 'kanchipuram', 'conjeevaram', 'kancheepuram', 'kanchipuram silk'],
  },
  {
    canonical: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    aliases: ['trichy', 'tiruchi', 'tiruchirapalli', 'tiruchirappalli'],
  },
  {
    canonical: 'Thanjavur',
    state: 'Tamil Nadu',
    aliases: ['tanjore', 'thanjavur'],
  },
  {
    canonical: 'Udhagamandalam',
    state: 'Tamil Nadu',
    aliases: ['ooty', 'udhagamandalam', 'otacamund', 'udhagai'],
  },
  {
    canonical: 'Tirunelveli',
    state: 'Tamil Nadu',
    aliases: ['nellai', 'tirunelveli', 'tinnevelly'],
  },
  {
    canonical: 'Arani',
    state: 'Tamil Nadu',
    aliases: ['arni', 'arani', 'arni silk'],
  },
  { canonical: 'Coimbatore', state: 'Tamil Nadu', aliases: ['kovai'] },
  { canonical: 'Madurai', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Salem', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Tiruppur', state: 'Tamil Nadu', aliases: ['tirupur'] },
  { canonical: 'Erode', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Vellore', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Thoothukudi', state: 'Tamil Nadu', aliases: ['tuticorin'] },
  { canonical: 'Dindigul', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Hosur', state: 'Tamil Nadu', aliases: [] },
  { canonical: 'Nagercoil', state: 'Tamil Nadu', aliases: ['kanyakumari'] },
  { canonical: 'Kumbakonam', state: 'Tamil Nadu', aliases: [] },

  // --- Uttar Pradesh ---
  {
    canonical: 'Varanasi',
    state: 'Uttar Pradesh',
    aliases: ['banaras', 'benares', 'kashi', 'varanasi', 'kadhwa', 'banarasi', 'banaras silk'],
  },
  {
    canonical: 'Prayagraj',
    state: 'Uttar Pradesh',
    aliases: ['allahabad', 'prayagraj', 'ilhabad'],
  },
  {
    canonical: 'Ayodhya',
    state: 'Uttar Pradesh',
    aliases: ['faizabad', 'ayodhya'],
  },
  {
    canonical: 'Kanpur',
    state: 'Uttar Pradesh',
    aliases: ['cawnpore', 'kanpur'],
  },
  {
    canonical: 'Noida',
    state: 'Uttar Pradesh',
    aliases: ['greater noida', 'noida', 'gautam buddha nagar'],
  },
  { canonical: 'Lucknow', state: 'Uttar Pradesh', aliases: ['chikankari'] },
  { canonical: 'Agra', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Ghaziabad', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Meerut', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Bareilly', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Aligarh', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Moradabad', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Gorakhpur', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Jhansi', state: 'Uttar Pradesh', aliases: [] },
  { canonical: 'Mathura', state: 'Uttar Pradesh', aliases: ['vrindavan'] },

  // --- West Bengal ---
  {
    canonical: 'Kolkata',
    state: 'West Bengal',
    aliases: ['calcutta', 'kolkata', 'calcutta city'],
  },
  {
    canonical: 'Bishnupur',
    state: 'West Bengal',
    aliases: ['baluchari', 'bishnupur', 'vishnupur', 'baluchari silk'],
  },
  {
    canonical: 'Shantipur',
    state: 'West Bengal',
    aliases: ['santipur', 'phulia', 'fulia'],
  },
  { canonical: 'Howrah', state: 'West Bengal', aliases: ['haora'] },
  { canonical: 'Siliguri', state: 'West Bengal', aliases: [] },
  { canonical: 'Durgapur', state: 'West Bengal', aliases: [] },
  { canonical: 'Asansol', state: 'West Bengal', aliases: [] },
  { canonical: 'Darjeeling', state: 'West Bengal', aliases: [] },

  // --- Telangana ---
  {
    canonical: 'Hyderabad',
    state: 'Telangana',
    aliases: ['secunderabad', 'cyberabad', 'hyderabad', 'bhagyanagar'],
  },
  {
    canonical: 'Bhuvanagiri',
    state: 'Telangana',
    aliases: ['pochampally', 'pochampalli', 'bhuvanagiri', 'yadadri', 'pochampally ikat'],
  },
  {
    canonical: 'Gadwal',
    state: 'Telangana',
    aliases: ['gadwal', 'gadwala', 'jogulamba gadwal'],
  },
  { canonical: 'Warangal', state: 'Telangana', aliases: ['hanamkonda', 'kazipet'] },
  { canonical: 'Nizamabad', state: 'Telangana', aliases: [] },
  { canonical: 'Karimnagar', state: 'Telangana', aliases: [] },
  { canonical: 'Khammam', state: 'Telangana', aliases: [] },

  // --- Andhra Pradesh ---
  {
    canonical: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    aliases: ['vizag', 'visakhapatnam', 'waltair'],
  },
  {
    canonical: 'Vijayawada',
    state: 'Andhra Pradesh',
    aliases: ['bezawada', 'vijayawada'],
  },
  {
    canonical: 'YSR Kadapa',
    state: 'Andhra Pradesh',
    aliases: ['cuddapah', 'kadapa', 'ysr kadapa'],
  },
  {
    canonical: 'Rajamahendravaram',
    state: 'Andhra Pradesh',
    aliases: ['rajahmundry', 'rajamahendravaram', 'rajamundry'],
  },
  {
    canonical: 'Dharmavaram',
    state: 'Andhra Pradesh',
    aliases: ['dharmavaram', 'dharmavaram silk'],
  },
  {
    canonical: 'Uppada',
    state: 'Andhra Pradesh',
    aliases: ['uppada', 'jamdani', 'uppada jamdani'],
  },
  { canonical: 'Guntur', state: 'Andhra Pradesh', aliases: ['amaravati', 'mangalagiri'] },
  { canonical: 'Nellore', state: 'Andhra Pradesh', aliases: [] },
  { canonical: 'Kurnool', state: 'Andhra Pradesh', aliases: [] },
  { canonical: 'Tirupati', state: 'Andhra Pradesh', aliases: ['srikalahasti', 'kalahasti'] },
  { canonical: 'Kakinada', state: 'Andhra Pradesh', aliases: [] },
  { canonical: 'Anantapur', state: 'Andhra Pradesh', aliases: ['anantapuram'] },

  // --- Kerala ---
  {
    canonical: 'Kochi',
    state: 'Kerala',
    aliases: ['cochin', 'ernakulam', 'kochi'],
  },
  {
    canonical: 'Thiruvananthapuram',
    state: 'Kerala',
    aliases: ['trivandrum', 'thiruvananthapuram'],
  },
  {
    canonical: 'Kozhikode',
    state: 'Kerala',
    aliases: ['calicut', 'kozhikode'],
  },
  {
    canonical: 'Alappuzha',
    state: 'Kerala',
    aliases: ['alleppey', 'alappuzha'],
  },
  {
    canonical: 'Thrissur',
    state: 'Kerala',
    aliases: ['trichur', 'thrissur'],
  },
  {
    canonical: 'Palakkad',
    state: 'Kerala',
    aliases: ['palghat', 'palakkad'],
  },
  {
    canonical: 'Kannur',
    state: 'Kerala',
    aliases: ['cannanore', 'kannur'],
  },
  {
    canonical: 'Kollam',
    state: 'Kerala',
    aliases: ['quilon', 'kollam'],
  },
  { canonical: 'Kottayam', state: 'Kerala', aliases: [] },
  { canonical: 'Malappuram', state: 'Kerala', aliases: [] },
  { canonical: 'Balaramapuram', state: 'Kerala', aliases: ['balaramapuram cotton', 'kasavu'] },

  // --- Gujarat ---
  {
    canonical: 'Vadodara',
    state: 'Gujarat',
    aliases: ['baroda', 'vadodara'],
  },
  {
    canonical: 'Patan',
    state: 'Gujarat',
    aliases: ['patan', 'patola', 'double ikat'],
  },
  { canonical: 'Ahmedabad', state: 'Gujarat', aliases: ['amdavad'] },
  { canonical: 'Surat', state: 'Gujarat', aliases: ['diamond city', 'silk city'] },
  { canonical: 'Rajkot', state: 'Gujarat', aliases: [] },
  { canonical: 'Gandhinagar', state: 'Gujarat', aliases: [] },
  { canonical: 'Bhavnagar', state: 'Gujarat', aliases: [] },
  { canonical: 'Jamnagar', state: 'Gujarat', aliases: ['bandhani'] },
  { canonical: 'Junagadh', state: 'Gujarat', aliases: [] },
  { canonical: 'Bhuj', state: 'Gujarat', aliases: ['kutch', 'ajrakh'] },

  // --- Haryana ---
  {
    canonical: 'Gurugram',
    state: 'Haryana',
    aliases: ['gurgaon', 'gurugram'],
  },
  { canonical: 'Faridabad', state: 'Haryana', aliases: [] },
  { canonical: 'Panipat', state: 'Haryana', aliases: ['textile city'] },
  { canonical: 'Ambala', state: 'Haryana', aliases: [] },
  { canonical: 'Karnal', state: 'Haryana', aliases: [] },
  { canonical: 'Panchkula', state: 'Haryana', aliases: [] },
  { canonical: 'Rohtak', state: 'Haryana', aliases: [] },
  { canonical: 'Sonipat', state: 'Haryana', aliases: [] },

  // --- Delhi ---
  {
    canonical: 'New Delhi',
    state: 'Delhi',
    aliases: ['delhi', 'new delhi', 'central delhi', 'south delhi', 'west delhi', 'north delhi', 'east delhi', 'connaught place', 'saket', 'dwarka', 'rohini'],
  },

  // --- Madhya Pradesh ---
  {
    canonical: 'Chanderi',
    state: 'Madhya Pradesh',
    aliases: ['chanderi', 'ashoknagar', 'chanderi silk'],
  },
  {
    canonical: 'Maheshwar',
    state: 'Madhya Pradesh',
    aliases: ['maheshwar', 'khargone', 'maheshwari silk', 'maheshwari'],
  },
  { canonical: 'Indore', state: 'Madhya Pradesh', aliases: [] },
  { canonical: 'Bhopal', state: 'Madhya Pradesh', aliases: [] },
  { canonical: 'Gwalior', state: 'Madhya Pradesh', aliases: [] },
  { canonical: 'Jabalpur', state: 'Madhya Pradesh', aliases: [] },
  { canonical: 'Ujjain', state: 'Madhya Pradesh', aliases: [] },

  // --- Rajasthan ---
  { canonical: 'Jaipur', state: 'Rajasthan', aliases: ['pink city', 'sanganer', 'bagru'] },
  { canonical: 'Jodhpur', state: 'Rajasthan', aliases: ['blue city'] },
  { canonical: 'Udaipur', state: 'Rajasthan', aliases: ['city of lakes'] },
  { canonical: 'Kota', state: 'Rajasthan', aliases: ['kota doria'] },
  { canonical: 'Bikaner', state: 'Rajasthan', aliases: [] },
  { canonical: 'Ajmer', state: 'Rajasthan', aliases: ['pushkar'] },

  // --- Punjab ---
  { canonical: 'Ludhiana', state: 'Punjab', aliases: [] },
  { canonical: 'Amritsar', state: 'Punjab', aliases: ['phulkari'] },
  { canonical: 'Jalandhar', state: 'Punjab', aliases: ['jullundur'] },
  { canonical: 'Mohali', state: 'Punjab', aliases: ['sas nagar'] },
  { canonical: 'Patiala', state: 'Punjab', aliases: [] },

  // --- Odisha ---
  { canonical: 'Bhubaneswar', state: 'Odisha', aliases: ['bhubaneshwar'] },
  { canonical: 'Cuttack', state: 'Odisha', aliases: ['kataka', 'tarakasi'] },
  { canonical: 'Puri', state: 'Odisha', aliases: [] },
  { canonical: 'Sambalpur', state: 'Odisha', aliases: ['sambalpuri', 'sambalpuri silk', 'pasapalli', 'bargarh', 'sonpur'] },
  { canonical: 'Berhampur', state: 'Odisha', aliases: ['brahmapur', 'berhampuri silk'] },

  // --- Bihar ---
  { canonical: 'Patna', state: 'Bihar', aliases: ['pataliputra'] },
  { canonical: 'Bhagalpur', state: 'Bihar', aliases: ['tussar', 'tussar silk', 'bhagalpuri'] },
  { canonical: 'Gaya', state: 'Bihar', aliases: ['bodh gaya'] },
  { canonical: 'Muzaffarpur', state: 'Bihar', aliases: [] },

  // --- Assam ---
  { canonical: 'Guwahati', state: 'Assam', aliases: ['gauhati'] },
  { canonical: 'Sualkuchi', state: 'Assam', aliases: ['muga', 'eri', 'muga silk', 'assam silk'] },
  { canonical: 'Silchar', state: 'Assam', aliases: [] },
  { canonical: 'Dibrugarh', state: 'Assam', aliases: [] },
  { canonical: 'Jorhat', state: 'Assam', aliases: [] },

  // --- Goa ---
  { canonical: 'Panaji', state: 'Goa', aliases: ['panjim'] },
  { canonical: 'Margao', state: 'Goa', aliases: ['madgaon'] },
  { canonical: 'Vasco da Gama', state: 'Goa', aliases: ['vasco'] },

  // --- Uttarakhand ---
  { canonical: 'Dehradun', state: 'Uttarakhand', aliases: [] },
  { canonical: 'Haridwar', state: 'Uttarakhand', aliases: ['hardwar'] },
  { canonical: 'Rishikesh', state: 'Uttarakhand', aliases: [] },
  { canonical: 'Nainital', state: 'Uttarakhand', aliases: [] },

  // --- Jharkhand ---
  { canonical: 'Ranchi', state: 'Jharkhand', aliases: [] },
  { canonical: 'Jamshedpur', state: 'Jharkhand', aliases: ['tatanagar'] },
  { canonical: 'Dhanbad', state: 'Jharkhand', aliases: [] },

  // --- Chhattisgarh ---
  { canonical: 'Raipur', state: 'Chhattisgarh', aliases: [] },
  { canonical: 'Bhilai', state: 'Chhattisgarh', aliases: ['durg'] },
  { canonical: 'Bilaspur', state: 'Chhattisgarh', aliases: ['kosa silk', 'champa'] },

  // --- Himachal Pradesh ---
  { canonical: 'Shimla', state: 'Himachal Pradesh', aliases: ['simla'] },
  { canonical: 'Dharamshala', state: 'Himachal Pradesh', aliases: ['mcleodganj'] },
  { canonical: 'Kullu', state: 'Himachal Pradesh', aliases: ['manali', 'kullu-manali'] },

  // --- Jammu & Kashmir / Ladakh ---
  { canonical: 'Srinagar', state: 'Jammu and Kashmir', aliases: ['pashmina', 'kashmiri silk', 'kani'] },
  { canonical: 'Jammu', state: 'Jammu and Kashmir', aliases: [] },
  { canonical: 'Leh', state: 'Ladakh', aliases: ['ladakh'] },

  // --- Union Territories ---
  { canonical: 'Chandigarh', state: 'Chandigarh', aliases: [] },
  { canonical: 'Puducherry', state: 'Puducherry', aliases: ['pondicherry', 'pondicherri'] },
];

/**
 * Converts a CityItem to an AutocompleteOption
 */
function toCityOption(item: CityItem): AutocompleteOption {
  const notableAliases = item.aliases.filter(
    (a) => a.toLowerCase() !== item.canonical.toLowerCase()
  );
  
  let subtitle = item.state;
  if (notableAliases.length > 0) {
    const aliasDisplay = notableAliases[0].replace(/\b\w/g, (c) => c.toUpperCase());
    subtitle = `(aka ${aliasDisplay}) • ${item.state}`;
  }

  return {
    value: item.canonical,
    label: item.canonical,
    subtitle,
    state: item.state,
    matchTerms: [item.canonical, item.state, ...item.aliases],
  };
}

/**
 * Intelligent City Search with Alias & Cross-State Matching:
 * 1. Matches canonical name, aliases (e.g. "bangalore" -> "Bengaluru"), state, or matchTerms.
 * 2. If a preferred state is provided, matching cities from that state appear first, but
 *    cities from ALL other states are still searched so typing a city from another state immediately resolves!
 */
export function searchStandardCities(query: string, preferredState?: string | null): AutocompleteOption[] {
  const q = query.trim().toLowerCase();
  
  if (!q) {
    if (preferredState) {
      const stateMatches = STANDARDIZED_CITIES.filter(
        (c) => c.state.toLowerCase() === preferredState.trim().toLowerCase()
      );
      if (stateMatches.length > 0) {
        return stateMatches.map(toCityOption);
      }
    }
    return STANDARDIZED_CITIES.slice(0, 40).map(toCityOption);
  }

  const exactStartsPreferred: AutocompleteOption[] = [];
  const exactStartsOther: AutocompleteOption[] = [];
  const containsPreferred: AutocompleteOption[] = [];
  const containsOther: AutocompleteOption[] = [];

  for (const item of STANDARDIZED_CITIES) {
    const isPrefState = preferredState
      ? item.state.toLowerCase() === preferredState.trim().toLowerCase()
      : false;

    const canonicalLower = item.canonical.toLowerCase();
    const aliasExactStarts = item.aliases.some((a) => a.toLowerCase().startsWith(q));
    const aliasMatches = item.aliases.some((a) => a.toLowerCase().includes(q));

    const isExactStart = canonicalLower.startsWith(q) || aliasExactStarts;
    const isContained = canonicalLower.includes(q) || aliasMatches;

    const opt = toCityOption(item);

    if (isExactStart) {
      if (isPrefState) exactStartsPreferred.push(opt);
      else exactStartsOther.push(opt);
    } else if (isContained) {
      if (isPrefState) containsPreferred.push(opt);
      else containsOther.push(opt);
    }
  }

  return [...exactStartsPreferred, ...exactStartsOther, ...containsPreferred, ...containsOther].slice(0, 30);
}

/**
 * Returns list of cities for a given state (or all cities if state not selected).
 */
export function getCitiesForState(stateName?: string | null): AutocompleteOption[] {
  if (!stateName || !stateName.trim()) {
    return STANDARDIZED_CITIES.map(toCityOption);
  }
  const filtered = STANDARDIZED_CITIES.filter(
    (c) => c.state.toLowerCase() === stateName.trim().toLowerCase()
  );
  return filtered.length > 0 ? filtered.map(toCityOption) : STANDARDIZED_CITIES.map(toCityOption);
}

/**
 * Standardizes a typed city string to its national official canonical name.
 * e.g. "Bangalore" -> "Bengaluru", "Bombay" -> "Mumbai", "Madras" -> "Chennai", "Allahabad" -> "Prayagraj"
 */
export function standardizeCityName(rawInput: string): { canonical: string; state: string } | null {
  const q = rawInput.trim().toLowerCase();
  if (!q) return null;

  for (const item of STANDARDIZED_CITIES) {
    if (
      item.canonical.toLowerCase() === q ||
      item.aliases.some((a) => a.toLowerCase() === q)
    ) {
      return { canonical: item.canonical, state: item.state };
    }
  }

  // Prefix match
  for (const item of STANDARDIZED_CITIES) {
    if (
      item.canonical.toLowerCase().startsWith(q) ||
      item.aliases.some((a) => a.toLowerCase().startsWith(q))
    ) {
      return { canonical: item.canonical, state: item.state };
    }
  }

  return null;
}

/**
 * Returns matching state for a given city input
 */
export function getStateForCity(cityName: string): string | null {
  const resolved = standardizeCityName(cityName);
  return resolved ? resolved.state : null;
}
