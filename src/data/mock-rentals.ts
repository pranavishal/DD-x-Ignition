import { RentalListing, BuildingCluster, RentalSource, RentalType, PriceUnit } from "@/types/rentals";

type BuildingKind = "hotel" | "airbnb" | "student";

interface Building {
  name: string;
  address: string;
  lat: number;
  lng: number;
  kind: BuildingKind;
}

// ─── REAL NYC HOTELS ────────────────────────────────────────────────
const NYC_HOTELS: Building[] = [
  { name: "The Plaza Hotel", address: "768 5th Ave, Midtown", lat: 40.7645, lng: -73.9744, kind: "hotel" },
  { name: "Waldorf Astoria New York", address: "301 Park Ave, Midtown", lat: 40.7564, lng: -73.9735, kind: "hotel" },
  { name: "The Standard High Line", address: "848 Washington St, Meatpacking", lat: 40.7408, lng: -74.0080, kind: "hotel" },
  { name: "Ace Hotel New York", address: "20 W 29th St, NoMad", lat: 40.7455, lng: -73.9883, kind: "hotel" },
  { name: "The Bowery Hotel", address: "335 Bowery, East Village", lat: 40.7260, lng: -73.9929, kind: "hotel" },
  { name: "1 Hotel Brooklyn Bridge", address: "60 Furman St, Brooklyn Heights", lat: 40.7000, lng: -73.9970, kind: "hotel" },
  { name: "Wythe Hotel", address: "80 Wythe Ave, Williamsburg", lat: 40.7217, lng: -73.9591, kind: "hotel" },
  { name: "citizenM Times Square", address: "218 W 50th St, Times Square", lat: 40.7612, lng: -73.9843, kind: "hotel" },
  { name: "Moxy NYC Times Square", address: "485 7th Ave, Times Square", lat: 40.7559, lng: -73.9889, kind: "hotel" },
  { name: "YOTEL New York", address: "570 10th Ave, Hell's Kitchen", lat: 40.7603, lng: -73.9938, kind: "hotel" },
  { name: "The William Vale", address: "111 N 12th St, Williamsburg", lat: 40.7226, lng: -73.9576, kind: "hotel" },
  { name: "Arlo NoMad", address: "11 E 31st St, NoMad", lat: 40.7468, lng: -73.9871, kind: "hotel" },
  { name: "Public Hotel", address: "215 Chrystie St, LES", lat: 40.7243, lng: -73.9919, kind: "hotel" },
  { name: "The Mark Hotel", address: "25 E 77th St, UES", lat: 40.7747, lng: -73.9628, kind: "hotel" },
  { name: "The Pierre", address: "2 E 61st St, UES", lat: 40.7646, lng: -73.9726, kind: "hotel" },
  { name: "Park Hyatt New York", address: "153 W 57th St, Midtown", lat: 40.7654, lng: -73.9789, kind: "hotel" },
  { name: "Mandarin Oriental NYC", address: "80 Columbus Cir, UWS", lat: 40.7698, lng: -73.9832, kind: "hotel" },
  { name: "Four Seasons Downtown", address: "27 Barclay St, FiDi", lat: 40.7131, lng: -74.0079, kind: "hotel" },
  { name: "W New York Union Square", address: "201 Park Ave S, Union Sq", lat: 40.7361, lng: -73.9876, kind: "hotel" },
  { name: "Hilton Midtown", address: "1335 6th Ave, Midtown", lat: 40.7628, lng: -73.9795, kind: "hotel" },
  { name: "Marriott Marquis", address: "1535 Broadway, Times Square", lat: 40.7585, lng: -73.9858, kind: "hotel" },
  { name: "InterContinental Barclay", address: "111 E 48th St, Midtown", lat: 40.7548, lng: -73.9718, kind: "hotel" },
  { name: "Pod 51", address: "230 E 51st St, Midtown", lat: 40.7548, lng: -73.9696, kind: "hotel" },
  { name: "Pod 39", address: "145 E 39th St, Murray Hill", lat: 40.7490, lng: -73.9785, kind: "hotel" },
  { name: "Hotel Indigo LES", address: "171 Ludlow St, LES", lat: 40.7210, lng: -73.9873, kind: "hotel" },
  { name: "Freehand New York", address: "23 Lexington Ave, Gramercy", lat: 40.7413, lng: -73.9831, kind: "hotel" },
  { name: "The Jane Hotel", address: "113 Jane St, West Village", lat: 40.7374, lng: -74.0093, kind: "hotel" },
  { name: "TWA Hotel at JFK", address: "1 Idlewild Dr, JFK Airport", lat: 40.6455, lng: -73.7844, kind: "hotel" },
  { name: "The Ned NoMad", address: "1170 Broadway, NoMad", lat: 40.7446, lng: -73.9881, kind: "hotel" },
  { name: "Equinox Hotel Hudson Yards", address: "33 Hudson Yards, Hudson Yards", lat: 40.7536, lng: -74.0003, kind: "hotel" },
  { name: "The Beekman Hotel", address: "123 Nassau St, FiDi", lat: 40.7108, lng: -74.0070, kind: "hotel" },
  { name: "Lotte New York Palace", address: "455 Madison Ave, Midtown", lat: 40.7583, lng: -73.9743, kind: "hotel" },
  { name: "The Greenwich Hotel", address: "377 Greenwich St, TriBeCa", lat: 40.7204, lng: -74.0096, kind: "hotel" },
  { name: "Crosby Street Hotel", address: "79 Crosby St, SoHo", lat: 40.7230, lng: -73.9988, kind: "hotel" },
  { name: "The Ludlow Hotel", address: "180 Ludlow St, LES", lat: 40.7218, lng: -73.9870, kind: "hotel" },
  { name: "McCarren Hotel & Pool", address: "160 N 12th St, Williamsburg", lat: 40.7229, lng: -73.9563, kind: "hotel" },
  { name: "The Hoxton Williamsburg", address: "97 Wythe Ave, Williamsburg", lat: 40.7212, lng: -73.9587, kind: "hotel" },
  { name: "Boro Hotel", address: "38-28 27th St, Long Island City", lat: 40.7510, lng: -73.9428, kind: "hotel" },
  { name: "Paper Factory Hotel", address: "37-06 36th St, Long Island City", lat: 40.7499, lng: -73.9290, kind: "hotel" },
  { name: "Nu Hotel Brooklyn", address: "85 Smith St, Boerum Hill", lat: 40.6862, lng: -73.9893, kind: "hotel" },
  { name: "Even Hotel Brooklyn", address: "46 Nevins St, Downtown Brooklyn", lat: 40.6867, lng: -73.9815, kind: "hotel" },
  { name: "Renaissance New York Harlem", address: "2080 Frederick Douglass Blvd, Harlem", lat: 40.8064, lng: -73.9545, kind: "hotel" },
  { name: "Aloft Harlem", address: "2296 Frederick Douglass Blvd, Harlem", lat: 40.8156, lng: -73.9496, kind: "hotel" },
  { name: "citizenM Bowery", address: "189 Bowery, LES", lat: 40.7194, lng: -73.9943, kind: "hotel" },
  { name: "Moxy NYC Lower East Side", address: "145 Rivington St, LES", lat: 40.7198, lng: -73.9852, kind: "hotel" },
];

// ─── REAL NYC AIRBNB-STYLE BUILDINGS ────────────────────────────────
const NYC_AIRBNBS: Building[] = [
  { name: "Chelsea Market Lofts", address: "88 10th Ave, Chelsea", lat: 40.7425, lng: -74.0048, kind: "airbnb" },
  { name: "One Manhattan Square", address: "252 South St, LES", lat: 40.7102, lng: -73.9900, kind: "airbnb" },
  { name: "The Amberly", address: "223 W 28th St, Chelsea", lat: 40.7477, lng: -73.9953, kind: "airbnb" },
  { name: "The Ohm", address: "312 11th Ave, Hudson Yards", lat: 40.7528, lng: -74.0015, kind: "airbnb" },
  { name: "200 Water St", address: "200 Water St, FiDi", lat: 40.7075, lng: -74.0037, kind: "airbnb" },
  { name: "Avalon Fort Greene", address: "343 Gold St, Fort Greene", lat: 40.6900, lng: -73.9799, kind: "airbnb" },
  { name: "388 Bridge Street", address: "388 Bridge St, Downtown Brooklyn", lat: 40.6904, lng: -73.9834, kind: "airbnb" },
  { name: "DUMBO Heights Lofts", address: "81 Washington St, DUMBO", lat: 40.7023, lng: -73.9884, kind: "airbnb" },
  { name: "The Edge at Hudson Yards", address: "20 Hudson Yards, Hudson Yards", lat: 40.7536, lng: -74.0003, kind: "airbnb" },
  { name: "56 Leonard Street", address: "56 Leonard St, TriBeCa", lat: 40.7187, lng: -74.0060, kind: "airbnb" },
  { name: "The Boerum", address: "265 State St, Boerum Hill", lat: 40.6857, lng: -73.9878, kind: "airbnb" },
  { name: "Greenpoint Apartments", address: "21 India St, Greenpoint", lat: 40.7303, lng: -73.9579, kind: "airbnb" },
  { name: "The Jackson", address: "122 E 23rd St, Gramercy", lat: 40.7396, lng: -73.9852, kind: "airbnb" },
  { name: "One Brooklyn Bridge", address: "360 Furman St, Brooklyn Heights", lat: 40.6948, lng: -73.9992, kind: "airbnb" },
  { name: "Bushwick Living", address: "12 Wyckoff Ave, Bushwick", lat: 40.7046, lng: -73.9175, kind: "airbnb" },
  { name: "Crown Heights Brownstone", address: "814 Eastern Pkwy, Crown Heights", lat: 40.6697, lng: -73.9508, kind: "airbnb" },
  { name: "Astoria Modern Apts", address: "28-10 Jackson Ave, LIC", lat: 40.7475, lng: -73.9432, kind: "airbnb" },
  { name: "The Forge", address: "30-02 39th Ave, LIC", lat: 40.7562, lng: -73.9222, kind: "airbnb" },
  { name: "Prospect Park Residence", address: "1 Grand Army Plz, Prospect Heights", lat: 40.6739, lng: -73.9712, kind: "airbnb" },
  { name: "Park Slope Brownstone", address: "378 5th Ave, Park Slope", lat: 40.6695, lng: -73.9819, kind: "airbnb" },
  { name: "Harlem Renaissance Walk-Up", address: "137 W 138th St, Harlem", lat: 40.8170, lng: -73.9420, kind: "airbnb" },
  { name: "UWS Pre-War Classic", address: "225 W 86th St, UWS", lat: 40.7883, lng: -73.9747, kind: "airbnb" },
  { name: "UES Townhouse", address: "167 E 82nd St, UES", lat: 40.7761, lng: -73.9578, kind: "airbnb" },
  { name: "Morningside Heights Walk-Up", address: "414 W 121st St, Morningside Heights", lat: 40.8085, lng: -73.9588, kind: "airbnb" },
  { name: "East Village Walk-Up", address: "94 St Marks Pl, East Village", lat: 40.7280, lng: -73.9854, kind: "airbnb" },
  { name: "NoLIta Loft", address: "40 Prince St, NoLIta", lat: 40.7236, lng: -73.9950, kind: "airbnb" },
  { name: "West Village Townhouse", address: "15 Barrow St, West Village", lat: 40.7337, lng: -74.0023, kind: "airbnb" },
  { name: "SoHo Cast-Iron Loft", address: "72 Greene St, SoHo", lat: 40.7232, lng: -73.9998, kind: "airbnb" },
  { name: "Roosevelt Island Riverwalk", address: "445 Main St, Roosevelt Island", lat: 40.7616, lng: -73.9509, kind: "airbnb" },
  { name: "Stuyvesant Town Apt", address: "330 E 14th St, Stuy Town", lat: 40.7310, lng: -73.9788, kind: "airbnb" },
];

// ─── REAL NYC STUDENT HOUSING ───────────────────────────────────────
const NYC_STUDENT: Building[] = [
  { name: "NYU Founders Hall", address: "137 E 12th St, East Village", lat: 40.7326, lng: -73.9897, kind: "student" },
  { name: "Columbia Schapiro Hall", address: "605 W 115th St, Morningside Hts", lat: 40.8073, lng: -73.9640, kind: "student" },
  { name: "The New School University Ctr", address: "63 5th Ave, Greenwich Village", lat: 40.7354, lng: -73.9942, kind: "student" },
  { name: "EHS 1760 Third Avenue", address: "1760 3rd Ave, UES", lat: 40.7835, lng: -73.9490, kind: "student" },
  { name: "92Y Residence", address: "1395 Lexington Ave, UES", lat: 40.7848, lng: -73.9518, kind: "student" },
  { name: "Outpost Club Bushwick", address: "30 Suydam St, Bushwick", lat: 40.7025, lng: -73.9186, kind: "student" },
  { name: "Student Housing Harlem", address: "250 W 127th St, Harlem", lat: 40.8110, lng: -73.9515, kind: "student" },
  { name: "Cooper Square Student Suites", address: "25 Cooper Sq, East Village", lat: 40.7287, lng: -73.9905, kind: "student" },
  { name: "Brooklyn Student Living", address: "180 Livingston St, Downtown Brooklyn", lat: 40.6896, lng: -73.9843, kind: "student" },
  { name: "Washington Heights Rooms", address: "610 W 178th St, Washington Heights", lat: 40.8481, lng: -73.9330, kind: "student" },
];

// ─── REAL TORONTO HOTELS ────────────────────────────────────────────
const TOR_HOTELS: Building[] = [
  { name: "Fairmont Royal York", address: "100 Front St W, Financial District", lat: 43.6456, lng: -79.3812, kind: "hotel" },
  { name: "The Ritz-Carlton Toronto", address: "181 Wellington St W, Entertainment District", lat: 43.6467, lng: -79.3866, kind: "hotel" },
  { name: "Shangri-La Toronto", address: "188 University Ave, Entertainment District", lat: 43.6479, lng: -79.3879, kind: "hotel" },
  { name: "The Drake Hotel", address: "1150 Queen St W, Parkdale", lat: 43.6432, lng: -79.4274, kind: "hotel" },
  { name: "Gladstone Hotel", address: "1214 Queen St W, Parkdale", lat: 43.6424, lng: -79.4291, kind: "hotel" },
  { name: "Hotel X Toronto", address: "111 Princes' Blvd, Exhibition Place", lat: 43.6292, lng: -79.4143, kind: "hotel" },
  { name: "The Broadview Hotel", address: "106 Broadview Ave, Riverside", lat: 43.6583, lng: -79.3521, kind: "hotel" },
  { name: "The Annex Hotel", address: "296 Brunswick Ave, The Annex", lat: 43.6676, lng: -79.4071, kind: "hotel" },
  { name: "Bisha Hotel Toronto", address: "80 Blue Jays Way, Entertainment District", lat: 43.6455, lng: -79.3916, kind: "hotel" },
  { name: "1 Hotel Toronto", address: "550 Wellington St W, King West", lat: 43.6420, lng: -79.4011, kind: "hotel" },
  { name: "Park Hyatt Toronto", address: "4 Avenue Rd, Yorkville", lat: 43.6699, lng: -79.3926, kind: "hotel" },
  { name: "Four Seasons Toronto", address: "60 Yorkville Ave, Yorkville", lat: 43.6702, lng: -79.3924, kind: "hotel" },
  { name: "InterContinental Toronto", address: "225 Front St W, Entertainment District", lat: 43.6440, lng: -79.3854, kind: "hotel" },
  { name: "Chelsea Hotel Toronto", address: "33 Gerrard St W, Garden District", lat: 43.6577, lng: -79.3833, kind: "hotel" },
  { name: "Marriott Downtown CF Centre", address: "525 Bay St, Downtown", lat: 43.6542, lng: -79.3830, kind: "hotel" },
  { name: "Hilton Toronto", address: "145 Richmond St W, Financial District", lat: 43.6508, lng: -79.3844, kind: "hotel" },
  { name: "Westin Harbour Castle", address: "1 Harbour Sq, Waterfront", lat: 43.6387, lng: -79.3776, kind: "hotel" },
  { name: "Delta Hotels Toronto", address: "75 Lower Simcoe St, Waterfront", lat: 43.6410, lng: -79.3837, kind: "hotel" },
  { name: "The Ivy at Verity", address: "111 Queen St E, Garden District", lat: 43.6534, lng: -79.3730, kind: "hotel" },
  { name: "Kimpton Saint George", address: "280 Bloor St W, The Annex", lat: 43.6686, lng: -79.3977, kind: "hotel" },
  { name: "The Hazelton Hotel", address: "118 Yorkville Ave, Yorkville", lat: 43.6716, lng: -79.3944, kind: "hotel" },
  { name: "Pantages Hotel", address: "200 Victoria St, Downtown", lat: 43.6553, lng: -79.3794, kind: "hotel" },
  { name: "Novotel Toronto Centre", address: "45 The Esplanade, St Lawrence", lat: 43.6500, lng: -79.3743, kind: "hotel" },
  { name: "Hotel Ocho", address: "195 Spadina Ave, Chinatown", lat: 43.6502, lng: -79.3957, kind: "hotel" },
  { name: "The Omni King Edward", address: "37 King St E, St Lawrence", lat: 43.6498, lng: -79.3746, kind: "hotel" },
  { name: "Hyatt Regency Toronto", address: "370 King St W, Entertainment District", lat: 43.6455, lng: -79.3911, kind: "hotel" },
  { name: "Radisson Blu Downtown", address: "249 Queen's Quay W, Waterfront", lat: 43.6386, lng: -79.3833, kind: "hotel" },
  { name: "DoubleTree by Hilton", address: "108 Chestnut St, Nathan Phillips", lat: 43.6535, lng: -79.3868, kind: "hotel" },
  { name: "Residence Inn Toronto Downtown", address: "255 Wellington St W, King West", lat: 43.6464, lng: -79.3892, kind: "hotel" },
  { name: "Hotel Victoria Toronto", address: "56 Yonge St, Financial District", lat: 43.6480, lng: -79.3779, kind: "hotel" },
  { name: "The Strathcona Hotel", address: "60 York St, Financial District", lat: 43.6458, lng: -79.3821, kind: "hotel" },
  { name: "Bond Place Hotel", address: "65 Dundas St E, Yonge-Dundas", lat: 43.6561, lng: -79.3787, kind: "hotel" },
  { name: "HI Toronto Hostel", address: "76 Church St, St Lawrence", lat: 43.6515, lng: -79.3742, kind: "hotel" },
  { name: "Planet Traveler Hostel", address: "357 College St, Little Italy", lat: 43.6572, lng: -79.4073, kind: "hotel" },
  { name: "The Rex Hotel Jazz Bar", address: "194 Queen St W, Queen West", lat: 43.6511, lng: -79.3878, kind: "hotel" },
  { name: "Le Germain Hotel", address: "30 Mercer St, Entertainment District", lat: 43.6473, lng: -79.3893, kind: "hotel" },
  { name: "Cambridge Suites Toronto", address: "15 Richmond St E, Downtown", lat: 43.6519, lng: -79.3783, kind: "hotel" },
  { name: "The Yorkville Royal Sonesta", address: "220 Bloor St W, Yorkville", lat: 43.6690, lng: -79.3953, kind: "hotel" },
  { name: "Ace Hotel Toronto", address: "51 Camden St, Fashion District", lat: 43.6461, lng: -79.3931, kind: "hotel" },
  { name: "Eaton Chelsea", address: "33 Gerrard St W, Downtown", lat: 43.6580, lng: -79.3827, kind: "hotel" },
];

// ─── REAL TORONTO AIRBNB-STYLE BUILDINGS ────────────────────────────
const TOR_AIRBNBS: Building[] = [
  { name: "Maple Leaf Square Condos", address: "15 York St, Financial District", lat: 43.6423, lng: -79.3804, kind: "airbnb" },
  { name: "CityPlace I", address: "220 Fort York Blvd, CityPlace", lat: 43.6395, lng: -79.3892, kind: "airbnb" },
  { name: "CityPlace II", address: "397 Front St W, CityPlace", lat: 43.6404, lng: -79.3951, kind: "airbnb" },
  { name: "ICE Condos", address: "12 York St, Financial District", lat: 43.6412, lng: -79.3806, kind: "airbnb" },
  { name: "Harbour Plaza Residences", address: "100 Harbour St, Waterfront", lat: 43.6391, lng: -79.3774, kind: "airbnb" },
  { name: "The Selby", address: "592 Sherbourne St, Rosedale", lat: 43.6680, lng: -79.3717, kind: "airbnb" },
  { name: "Canary District Condos", address: "397 Front St E, Canary District", lat: 43.6541, lng: -79.3510, kind: "airbnb" },
  { name: "King Blue Condos", address: "355 King St W, Entertainment District", lat: 43.6457, lng: -79.3917, kind: "airbnb" },
  { name: "Theatre Park Condos", address: "224 King St W, Entertainment District", lat: 43.6469, lng: -79.3888, kind: "airbnb" },
  { name: "The Well Condos", address: "410 Front St W, King West", lat: 43.6414, lng: -79.3950, kind: "airbnb" },
  { name: "Queen & Portland Lofts", address: "533 Richmond St W, Queen West", lat: 43.6472, lng: -79.4010, kind: "airbnb" },
  { name: "Liberty Village Condos", address: "55 East Liberty St, Liberty Village", lat: 43.6379, lng: -79.4209, kind: "airbnb" },
  { name: "Distillery Loft Condos", address: "38 The Esplanade, Distillery", lat: 43.6503, lng: -79.3700, kind: "airbnb" },
  { name: "King Charlotte Condos", address: "11 Charlotte St, King West", lat: 43.6447, lng: -79.3958, kind: "airbnb" },
  { name: "Peter & Adelaide Condos", address: "70 Peter St, Entertainment District", lat: 43.6481, lng: -79.3925, kind: "airbnb" },
  { name: "Spadina Lofts", address: "282 Spadina Ave, Chinatown", lat: 43.6525, lng: -79.3970, kind: "airbnb" },
  { name: "Annex Heritage Flat", address: "480 Bloor St W, The Annex", lat: 43.6654, lng: -79.4082, kind: "airbnb" },
  { name: "Kensington Market Flat", address: "28 Kensington Ave, Kensington", lat: 43.6549, lng: -79.4005, kind: "airbnb" },
  { name: "Ossington Loft", address: "95 Ossington Ave, Ossington", lat: 43.6497, lng: -79.4204, kind: "airbnb" },
  { name: "Church-Wellesley Flat", address: "502 Church St, Church-Wellesley", lat: 43.6642, lng: -79.3808, kind: "airbnb" },
  { name: "Leslieville Row House", address: "1044 Queen St E, Leslieville", lat: 43.6625, lng: -79.3356, kind: "airbnb" },
  { name: "Junction Triangle Loft", address: "58 Wade Ave, Junction Triangle", lat: 43.6610, lng: -79.4530, kind: "airbnb" },
  { name: "Corktown Victorian", address: "510 King St E, Corktown", lat: 43.6536, lng: -79.3604, kind: "airbnb" },
  { name: "Regent Park Condo", address: "610 Dundas St E, Regent Park", lat: 43.6590, lng: -79.3620, kind: "airbnb" },
  { name: "Danforth Village Flat", address: "710 Danforth Ave, The Danforth", lat: 43.6779, lng: -79.3507, kind: "airbnb" },
  { name: "Roncesvalles Victorian", address: "310 Roncesvalles Ave, Roncy", lat: 43.6500, lng: -79.4512, kind: "airbnb" },
  { name: "Cabbagetown Heritage Home", address: "18 Metcalfe St, Cabbagetown", lat: 43.6665, lng: -79.3660, kind: "airbnb" },
  { name: "Bathurst-College Walk-Up", address: "585 College St, Little Italy", lat: 43.6566, lng: -79.4170, kind: "airbnb" },
  { name: "North York Condo Tower", address: "5410 Yonge St, North York", lat: 43.7676, lng: -79.4137, kind: "airbnb" },
  { name: "Yonge-Eglinton Condo", address: "2310 Yonge St, Midtown", lat: 43.7064, lng: -79.3986, kind: "airbnb" },
];

// ─── REAL TORONTO STUDENT HOUSING ───────────────────────────────────
const TOR_STUDENT: Building[] = [
  { name: "Chestnut Residence (U of T)", address: "89 Chestnut St, Garden District", lat: 43.6530, lng: -79.3861, kind: "student" },
  { name: "Campus One Student Res", address: "300 Borough Dr, Scarborough", lat: 43.7842, lng: -79.1873, kind: "student" },
  { name: "Tartu College", address: "310 Bloor St W, The Annex", lat: 43.6676, lng: -79.4044, kind: "student" },
  { name: "Neill-Wycik Residence", address: "96 Gerrard St E, Ryerson Area", lat: 43.6593, lng: -79.3764, kind: "student" },
  { name: "HOEM Student Living", address: "75 St Nicholas St, Yonge-Bloor", lat: 43.6680, lng: -79.3868, kind: "student" },
  { name: "Parkside Student Res", address: "111 Carlton St, Garden District", lat: 43.6610, lng: -79.3735, kind: "student" },
  { name: "Pitman Hall (TMU)", address: "160 Mutual St, Ryerson Area", lat: 43.6575, lng: -79.3752, kind: "student" },
  { name: "York University Housing", address: "4700 Keele St, York U Area", lat: 43.7735, lng: -79.5019, kind: "student" },
  { name: "U of T Woodsworth Res", address: "321 Bloor St W, The Annex", lat: 43.6670, lng: -79.4050, kind: "student" },
  { name: "Humber College Res", address: "205 Humber College Blvd, Etobicoke", lat: 43.7285, lng: -79.6065, kind: "student" },
];

// ─── IMAGES ─────────────────────────────────────────────────────────
const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600",
  "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600",
];

const AIRBNB_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600",
];

const STUDENT_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600",
  "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
];

// ─── TEMPLATES PER KIND ─────────────────────────────────────────────

interface ListingTemplate {
  titlePrefix: string;
  desc: string;
  source: RentalSource;
  type: RentalType;
  priceUnit: PriceUnit;
  priceRange: [number, number];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  tags: string[];
  ratingRange: [number, number];
}

const HOTEL_TEMPLATES: ListingTemplate[] = [
  { titlePrefix: "Standard Room", desc: "Comfortable room with city views. Complimentary wifi, fitness center access, and daily housekeeping.", source: "hotels", type: "hotel", priceUnit: "night", priceRange: [160, 480], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "gym", "room-service", "tv", "safe"], tags: [], ratingRange: [4.0, 4.9] },
  { titlePrefix: "Deluxe King", desc: "Spacious king room with premium linens, minibar, and panoramic views. Club lounge access included.", source: "hotels", type: "hotel", priceUnit: "night", priceRange: [220, 650], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "gym", "minibar", "room-service", "spa", "lounge-access"], tags: [], ratingRange: [4.2, 4.9] },
  { titlePrefix: "Suite", desc: "One-bedroom suite with separate living area, kitchenette, and premium amenities.", source: "hotels", type: "hotel", priceUnit: "night", priceRange: [350, 900], bedrooms: 1, bathrooms: 1, maxGuests: 3, amenities: ["wifi", "gym", "kitchen", "minibar", "room-service", "spa"], tags: ["luxury"], ratingRange: [4.4, 5.0] },
  { titlePrefix: "Executive Room", desc: "Business-friendly room with work desk, high-speed wifi, and complimentary breakfast.", source: "booking", type: "hotel", priceUnit: "night", priceRange: [180, 420], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "breakfast", "gym", "work-desk"], tags: [], ratingRange: [4.0, 4.8] },
  { titlePrefix: "Economy Room", desc: "Clean and affordable room in a great location. Perfect for budget-conscious travelers.", source: "booking", type: "hotel", priceUnit: "night", priceRange: [95, 200], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "tv"], tags: ["budget"], ratingRange: [3.7, 4.5] },
  { titlePrefix: "Boutique Room", desc: "Uniquely designed room with local art, artisan toiletries, and curated minibar.", source: "hotels", type: "hotel", priceUnit: "night", priceRange: [200, 520], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "minibar", "air-conditioning", "room-service"], tags: ["boutique"], ratingRange: [4.3, 4.9] },
  { titlePrefix: "Hostel Dorm Bed", desc: "Bed in a mixed dorm with lockers, common kitchen, and social events. Great for meeting fellow travelers.", source: "booking", type: "hostel", priceUnit: "night", priceRange: [30, 65], bedrooms: 1, bathrooms: 1, maxGuests: 1, amenities: ["wifi", "lockers", "common-room", "kitchen"], tags: ["budget", "social"], ratingRange: [3.8, 4.4] },
  { titlePrefix: "Private Hostel Room", desc: "Private room in a social hostel. Shared kitchen and lounge. Events every night.", source: "booking", type: "hostel", priceUnit: "night", priceRange: [55, 120], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "lockers", "common-room", "kitchen"], tags: ["budget", "social"], ratingRange: [3.9, 4.5] },
];

const AIRBNB_TEMPLATES: ListingTemplate[] = [
  { titlePrefix: "Entire Apartment", desc: "Stylish apartment with full kitchen, in-unit laundry, and fast wifi. Self check-in.", source: "airbnb", type: "apartment", priceUnit: "night", priceRange: [110, 300], bedrooms: 1, bathrooms: 1, maxGuests: 3, amenities: ["wifi", "kitchen", "washer", "air-conditioning", "self-checkin"], tags: ["superhost", "furnished"], ratingRange: [4.3, 5.0] },
  { titlePrefix: "Cozy Studio", desc: "Bright studio in the heart of the neighbourhood. Keypad entry, smart TV, and Nespresso machine.", source: "airbnb", type: "studio", priceUnit: "night", priceRange: [80, 190], bedrooms: 0, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "kitchen", "tv", "air-conditioning"], tags: ["superhost", "furnished"], ratingRange: [4.4, 5.0] },
  { titlePrefix: "Spacious 2BR", desc: "Two-bedroom apartment perfect for families or groups. Full kitchen, washer/dryer, and balcony.", source: "airbnb", type: "apartment", priceUnit: "night", priceRange: [170, 400], bedrooms: 2, bathrooms: 1, maxGuests: 5, amenities: ["wifi", "kitchen", "washer", "balcony", "air-conditioning"], tags: ["superhost", "furnished", "family-friendly"], ratingRange: [4.5, 5.0] },
  { titlePrefix: "Private Room", desc: "Private room in a shared home. Shared kitchen and bathroom. Great host, local tips provided.", source: "airbnb", type: "room", priceUnit: "night", priceRange: [50, 120], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "kitchen"], tags: ["furnished"], ratingRange: [4.2, 4.9] },
  { titlePrefix: "Luxury Loft", desc: "Designer loft with exposed brick, high ceilings, and floor-to-ceiling windows. Premium location.", source: "airbnb", type: "apartment", priceUnit: "night", priceRange: [250, 550], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "kitchen", "washer", "gym", "doorman"], tags: ["superhost", "luxury", "furnished"], ratingRange: [4.6, 5.0] },
  { titlePrefix: "Monthly Furnished Apt", desc: "Available for 30+ day stays at a steep discount. Perfect for remote workers and relocations.", source: "airbnb", type: "apartment", priceUnit: "month", priceRange: [2200, 5500], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "kitchen", "washer", "gym"], tags: ["long-term", "furnished", "pet-friendly"], ratingRange: [4.4, 5.0] },
  { titlePrefix: "Furnished Room — No Fee", desc: "Private room in a shared apartment. Close to subway, laundry in building.", source: "craigslist", type: "room", priceUnit: "month", priceRange: [800, 1700], bedrooms: 1, bathrooms: 1, maxGuests: 1, amenities: ["wifi", "kitchen", "laundry"], tags: ["budget", "no-fee", "furnished"], ratingRange: [3.8, 4.5] },
  { titlePrefix: "Rental — Month-to-Month", desc: "Unfurnished apartment. Month-to-month lease. Close to transit, pet-friendly building.", source: "zillow", type: "apartment", priceUnit: "month", priceRange: [1800, 4800], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["kitchen", "washer", "gym", "doorman"], tags: ["long-term", "pet-friendly"], ratingRange: [4.0, 4.7] },
];

const STUDENT_TEMPLATES: ListingTemplate[] = [
  { titlePrefix: "Furnished Studio — 4-Month Lease", desc: "All-inclusive managed student studio. Wifi, utilities, gym, and study lounge included.", source: "bamboo", type: "studio", priceUnit: "month", priceRange: [1200, 2200], bedrooms: 0, bathrooms: 1, maxGuests: 1, amenities: ["wifi", "gym", "furnished", "utilities-included", "study-room", "laundry"], tags: ["student-friendly", "furnished", "all-inclusive", "4-month-lease"], ratingRange: [4.0, 4.8] },
  { titlePrefix: "Shared Room — 8-Month Lease", desc: "Private room in a shared student suite. Full academic year lease. All utilities included.", source: "bamboo", type: "room", priceUnit: "month", priceRange: [900, 1500], bedrooms: 1, bathrooms: 1, maxGuests: 1, amenities: ["wifi", "furnished", "utilities-included", "laundry"], tags: ["student-friendly", "budget", "furnished", "all-inclusive", "8-month-lease"], ratingRange: [4.0, 4.6] },
  { titlePrefix: "Co-op Term Housing", desc: "Managed housing for co-op and internship students. Includes networking events and study space.", source: "bamboo", type: "apartment", priceUnit: "month", priceRange: [1400, 2600], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "gym", "furnished", "utilities-included", "social-events"], tags: ["student-friendly", "furnished", "all-inclusive", "4-month-lease", "co-op"], ratingRange: [4.2, 4.9] },
  { titlePrefix: "Summer Sublet", desc: "Subletting while on exchange. Fully furnished, ready to move in.", source: "places4students", type: "apartment", priceUnit: "month", priceRange: [800, 1800], bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["wifi", "kitchen", "furnished"], tags: ["student-friendly", "sublet", "furnished", "4-month-lease"], ratingRange: [3.8, 4.5] },
  { titlePrefix: "Budget Room Sublet", desc: "Private room in a student house share. Shared kitchen and bathroom. Near transit.", source: "places4students", type: "room", priceUnit: "month", priceRange: [650, 1200], bedrooms: 1, bathrooms: 1, maxGuests: 1, amenities: ["wifi", "kitchen", "furnished"], tags: ["student-friendly", "budget", "sublet", "4-month-lease"], ratingRange: [3.5, 4.3] },
];

// ─── DETERMINISTIC GENERATOR ────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateFromBuildings(
  buildings: Building[],
  templates: ListingTemplate[],
  idPrefix: string,
  currency: string,
  images: string[],
  startIdx: number,
  listingsPerBuilding: number,
  rand: () => number,
): RentalListing[] {
  const listings: RentalListing[] = [];

  for (const building of buildings) {
    const count = Math.max(1, listingsPerBuilding + Math.floor((rand() - 0.5) * 3));
    for (let j = 0; j < count; j++) {
      const t = pick(templates, rand);
      const price = Math.round(t.priceRange[0] + rand() * (t.priceRange[1] - t.priceRange[0]));
      const rating = Math.round((t.ratingRange[0] + rand() * (t.ratingRange[1] - t.ratingRange[0])) * 10) / 10;
      const reviewCount = Math.round(10 + rand() * 900);
      const jLat = (rand() - 0.5) * 0.002;
      const jLng = (rand() - 0.5) * 0.002;
      const imgStart = Math.floor(rand() * images.length);
      const imgCount = 2 + Math.floor(rand() * 2);
      const imgs = Array.from({ length: imgCount }, (_, k) => images[(imgStart + k) % images.length]);

      listings.push({
        id: `${idPrefix}-${startIdx + listings.length}`,
        source: t.source,
        title: `${t.titlePrefix} — ${building.name}`,
        description: t.desc,
        price,
        priceUnit: t.priceUnit,
        currency,
        coordinates: { lat: building.lat + jLat, lng: building.lng + jLng },
        address: building.address,
        buildingName: building.name,
        images: imgs,
        amenities: t.amenities,
        rating,
        reviewCount,
        listingUrl: `https://${t.source === "bamboo" ? "bamboohousing.com" : t.source === "places4students" ? "places4students.com" : t.source + ".com"}/listing/${idPrefix}-${startIdx + listings.length}`,
        type: t.type,
        bedrooms: t.bedrooms,
        bathrooms: t.bathrooms,
        maxGuests: t.maxGuests,
        availableFrom: "2026-05-01",
        availableTo: t.tags.includes("8-month-lease") ? "2027-04-30" : "2026-08-31",
        tags: t.tags,
      });
    }
  }

  return listings;
}

// ─── BUILD ALL LISTINGS ─────────────────────────────────────────────

const rand1 = seededRandom(42);
const rand2 = seededRandom(137);

const nycHotelListings = generateFromBuildings(NYC_HOTELS, HOTEL_TEMPLATES, "nyc", "USD", HOTEL_IMAGES, 0, 3, rand1);
const nycAirbnbListings = generateFromBuildings(NYC_AIRBNBS, AIRBNB_TEMPLATES, "nyc", "USD", AIRBNB_IMAGES, 500, 3, rand1);
const nycStudentListings = generateFromBuildings(NYC_STUDENT, STUDENT_TEMPLATES, "nyc", "USD", STUDENT_IMAGES, 800, 3, rand1);

const torHotelListings = generateFromBuildings(TOR_HOTELS, HOTEL_TEMPLATES, "tor", "CAD", HOTEL_IMAGES, 0, 3, rand2);
const torAirbnbListings = generateFromBuildings(TOR_AIRBNBS, AIRBNB_TEMPLATES, "tor", "CAD", AIRBNB_IMAGES, 500, 3, rand2);
const torStudentListings = generateFromBuildings(TOR_STUDENT, STUDENT_TEMPLATES, "tor", "CAD", STUDENT_IMAGES, 800, 3, rand2);

export const MOCK_LISTINGS: RentalListing[] = [
  ...nycHotelListings,
  ...nycAirbnbListings,
  ...nycStudentListings,
  ...torHotelListings,
  ...torAirbnbListings,
  ...torStudentListings,
];

// ─── CLUSTERING ─────────────────────────────────────────────────────

export function clusterListings(listings: RentalListing[]): BuildingCluster[] {
  const map = new Map<string, RentalListing[]>();

  for (const listing of listings) {
    const key = listing.buildingName ?? listing.address;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(listing);
  }

  return Array.from(map.entries()).map(([name, items]) => {
    const prices = items.map((l) => l.price);
    const center = {
      lat: items.reduce((s, l) => s + l.coordinates.lat, 0) / items.length,
      lng: items.reduce((s, l) => s + l.coordinates.lng, 0) / items.length,
    };

    return {
      buildingId: items[0].id.split("-")[0] + "-" + name.replace(/\s/g, "").slice(0, 12),
      buildingName: name,
      coordinates: center,
      listingCount: items.length,
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
      listings: items,
    };
  });
}
