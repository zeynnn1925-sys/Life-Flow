export interface CareerLink {
  id: string;
  name: string;
  url: string;
  category: string;
  categoryEn: string;
}

export const originalCareerLinks: CareerLink[] = [
  // Sektor Kuliner dan Management Trainee
  {
    id: "kfc-indonesia",
    name: "KFC Indonesia",
    url: "https://kfcku.com/career",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "mie-gacoan",
    name: "Mie Gacoan",
    url: "https://tinyurl.com/JAKARTA-EXIST",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "roti-o",
    name: "Roti O",
    url: "https://www.rotio.id/Career",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "rindu-mu-coffee",
    name: "Rindu Mu Coffee",
    url: "https://instagram.com/rindumu.coffee",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "jago-coffee",
    name: "Jago Coffee",
    url: "https://jago.coffee/careers",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "sejuta-jiwa",
    name: "Sejuta Jiwa",
    url: "https://instagram.com/sejutajiwa",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "burger-king",
    name: "Burger King",
    url: "https://burgerking.co.id/careers",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "hokben",
    name: "HokBen",
    url: "https://hokben.co.id/career",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "richeese",
    name: "Richeese",
    url: "https://richeesefactory.com/id/career",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },
  {
    id: "astro-mt",
    name: "Astro Management Trainee",
    url: "https://bit.ly/AstroMTOps",
    category: "Sektor Kuliner & MT",
    categoryEn: "Culinary & Management Trainee"
  },

  // Sektor Manufaktur dan Otomotif Umum
  {
    id: "astra-international",
    name: "Astra International",
    url: "https://career.astra.co.id",
    category: "Manufaktur & Otomotif",
    categoryEn: "Manufacturing & Automotive"
  },
  {
    id: "yamaha-motor",
    name: "Yamaha Motor",
    url: "https://yamaha-motor.co.id/corporate/career/",
    category: "Manufaktur & Otomotif",
    categoryEn: "Manufacturing & Automotive"
  },
  {
    id: "kao-indonesia",
    name: "Kao Indonesia",
    url: "https://kao.com/id/id/careers",
    category: "Manufaktur & Otomotif",
    categoryEn: "Manufacturing & Automotive"
  },
  {
    id: "honda-astra",
    name: "Honda Astra Honda Motor",
    url: "https://recruitment.astra-honda.com",
    category: "Manufaktur & Otomotif",
    categoryEn: "Manufacturing & Automotive"
  },

  // Sektor Ritel dan FMCG
  {
    id: "wings-group",
    name: "Wings Group",
    url: "https://wingscareer.com",
    category: "Ritel & FMCG",
    categoryEn: "Retail & FMCG"
  },
  {
    id: "alfamart",
    name: "Alfamart",
    url: "https://alfakarir.alfamart.co.id",
    category: "Ritel & FMCG",
    categoryEn: "Retail & FMCG"
  },
  {
    id: "matahari",
    name: "Matahari Department Store",
    url: "https://matahari.com/pages/career",
    category: "Ritel & FMCG",
    categoryEn: "Retail & FMCG"
  },
  {
    id: "garudafood",
    name: "Garudafood",
    url: "https://career.garudafood.co.id",
    category: "Ritel & FMCG",
    categoryEn: "Retail & FMCG"
  },

  // Sektor Logistik, Transportasi, dan Finansial
  {
    id: "jne-express",
    name: "JNE Express",
    url: "https://recruitment.jne.co.id",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },
  {
    id: "bluebird-group",
    name: "Bluebird Group",
    url: "https://bluebirdgroup.com/career",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },
  {
    id: "bank-mandiri",
    name: "Bank Mandiri",
    url: "https://bankmandiri.co.id/mandiri-career",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },
  {
    id: "vidio",
    name: "Vidio",
    url: "https://careers.vidio.com",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },
  {
    id: "xl-axiata",
    name: "XL Axiata",
    url: "https://careers.xlsmart.co.id",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },
  {
    id: "sinarmas-land",
    name: "Sinarmas Land",
    url: "https://career.sinarmasland.com",
    category: "Logistik, Transportasi & Finansial",
    categoryEn: "Logistics, Transport & Finance"
  },

  // Kawasan Industri Jababeka Bekasi
  {
    id: "samsung-indonesia",
    name: "PT Samsung Electronics Indonesia",
    url: "https://samsung.com/id/about-us/careers/",
    category: "Industri Jababeka Bekasi",
    categoryEn: "Jababeka Industrial Zone Bekasi"
  },
  {
    id: "unilever-indonesia",
    name: "PT Unilever Indonesia Tbk",
    url: "https://unilever.co.id/careers/",
    category: "Industri Jababeka Bekasi",
    categoryEn: "Jababeka Industrial Zone Bekasi"
  },
  {
    id: "united-tractors",
    name: "PT United Tractors Tbk",
    url: "https://unitedtractors.com/career/",
    category: "Industri Jababeka Bekasi",
    categoryEn: "Jababeka Industrial Zone Bekasi"
  },

  // Kawasan Industri Karawang dan Suryacipta
  {
    id: "toyota-motor",
    name: "PT Toyota Motor Manufacturing Indonesia",
    url: "https://toyota.co.id/career",
    category: "Industri Karawang & Suryacipta",
    categoryEn: "Karawang & Suryacipta Industrial Zone"
  },
  {
    id: "astra-daihatsu",
    name: "PT Astra Daihatsu Motor",
    url: "https://daihatsu.co.id/career",
    category: "Industri Karawang & Suryacipta",
    categoryEn: "Karawang & Suryacipta Industrial Zone"
  },
  {
    id: "yamaha-west-java",
    name: "PT Yamaha Motor Manufacturing West Java",
    url: "https://yamaha-motor.co.id/career",
    category: "Industri Karawang & Suryacipta",
    categoryEn: "Karawang & Suryacipta Industrial Zone"
  },
  {
    id: "bridgestone-indonesia",
    name: "PT Bridgestone Tire Indonesia",
    url: "https://bridgestone.co.id/id/about/career",
    category: "Industri Karawang & Suryacipta",
    categoryEn: "Karawang & Suryacipta Industrial Zone"
  },

  // Kawasan Industri MM2100 dan EJIP Bekasi
  {
    id: "astra-otoparts",
    name: "PT Astra Otoparts Tbk",
    url: "https://astra-otoparts.com/career",
    category: "Industri MM2100 & EJIP",
    categoryEn: "MM2100 & EJIP Industrial Zone"
  },
  {
    id: "epson-indonesia",
    name: "PT Epson Indonesia",
    url: "https://epson.co.id/careers",
    category: "Industri MM2100 & EJIP",
    categoryEn: "MM2100 & EJIP Industrial Zone"
  },
  {
    id: "kalbe-farma",
    name: "PT Kalbe Farma Tbk",
    url: "https://kalbe.co.id/careers",
    category: "Industri MM2100 & EJIP",
    categoryEn: "MM2100 & EJIP Industrial Zone"
  },

  // Kawasan Industri Lain di Jawa Barat
  {
    id: "bio-farma",
    name: "PT Bio Farma Bandung",
    url: "https://biofarma.co.id/id/karir",
    category: "Industri Jabar Lainnya",
    categoryEn: "Other Jabar Industrial Zone"
  },
  {
    id: "pindad-bandung",
    name: "PT Pindad Bandung",
    url: "https://pindad.com/karir",
    category: "Industri Jabar Lainnya",
    categoryEn: "Other Jabar Industrial Zone"
  },
  {
    id: "indo-bharat",
    name: "PT Indo Bharat Rayon Purwakarta",
    url: "https://indobharatrayon.com",
    category: "Industri Jabar Lainnya",
    categoryEn: "Other Jabar Industrial Zone"
  },

  // Situs Karir PT KAI Group
  {
    id: "kai-persero",
    name: "PT KAI Persero",
    url: "https://e-recruitment.kai.id",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-services",
    name: "KAI Services",
    url: "https://karir.reska.id/lowongan",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-commuter",
    name: "KAI Commuter",
    url: "https://kci.id/karir",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-properti",
    name: "KAI Properti",
    url: "https://kaiproperti.id/career",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-logistik",
    name: "KAI Logistik",
    url: "https://kailogistik.id/karir",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-wisata",
    name: "KAI Wisata",
    url: "https://recruitment.kawisata.id",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  },
  {
    id: "kai-bandara",
    name: "KAI Bandara",
    url: "https://railink.co.id/id/career",
    category: "PT KAI Group",
    categoryEn: "PT KAI Group"
  }
];
