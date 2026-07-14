/**
 * Smart Utility to automatically categorize financial transactions (both income and expense)
 * using advanced multi-lingual keyword heuristic matching for Indonesian and English.
 */

export interface MatchedCategoryResult {
  categoryId: string;
  type: 'income' | 'expense';
}

const CATEGORY_RULES = [
  // === INCOME ===
  {
    id: 'i1',
    type: 'income' as const,
    keywords: [
      'gaji', 'salary', 'upah', 'paycheck', 'gajian', 'bulanan', 'payroll', 'base salary', 'gaji pokok'
    ]
  },
  {
    id: 'i3',
    type: 'income' as const,
    keywords: [
      'dividen', 'bunga', 'reksadana profit', 'saham profit', 'sewa masuk', 'passive', 'pasif',
      'dividend', 'interest', 'rental income', 'royalti', 'royalty', 'kupon', 'coupon'
    ]
  },
  {
    id: 'i2',
    type: 'income' as const,
    keywords: [
      'bonus', 'hadiah', 'angpao', 'thr', 'cashback', 'untung', 'sampingan', 'freelance', 'proyek',
      'project', 'tips', 'selling', 'penjualan', 'jual', 'hibah', 'gift', 'refund', 'pengembalian'
    ]
  },

  // === EXPENSES - Needs ===
  {
    id: 'e3',
    type: 'expense' as const,
    keywords: [
      // ID
      'makan', 'bakso', 'kuliner', 'kopi', 'warung', 'restoran', 'indomaret', 'alfamart', 'supermarket',
      'mart', 'pasar', 'belanja', 'roti', 'susu', 'snack', 'cemilan', 'teh', 'cafe', 'kafe', 'resto',
      'mie', 'nasi', 'kantin', 'dapur', 'sayur', 'buah', 'daging', 'beras', 'sembako', 'gula', 'garam',
      'gofood', 'grabfood', 'shopeefood', 'jajan', 'bubur', 'sate', 'soto', 'warteg', 'angkringan',
      // EN
      'food', 'lunch', 'breakfast', 'dinner', 'restaurant', 'grocery', 'groceries', 'mcd', 'kfc',
      'starbucks', 'coffee', 'snack', 'beverage', 'drink', 'bakery', 'deli', 'market', 'hypermarket',
      'minimarket', 'ice cream', 'juice'
    ]
  },
  {
    id: 'e4',
    type: 'expense' as const,
    keywords: [
      // ID
      'bensin', 'pertamina', 'pertamax', 'shell', 'gojek', 'grab', 'gocar', 'goride', 'ojek', 'taxi',
      'taksi', 'kereta', 'mrt', 'lrt', 'bus', 'transjakarta', 'tol', 'parkir', 'motor', 'mobil',
      'bengkel', 'service', 'oli', 'ban', 'helm', 'krl', 'kai', 'tiket pesawat', 'travel', 'bluebird',
      // EN
      'transport', 'petrol', 'fuel', 'diesel', 'subway', 'train', 'uber', 'lyft', 'cab', 'parking',
      'highway', 'toll', 'garage', 'mechanic', 'flight', 'airline', 'car wash', 'cuci mobil', 'cuci motor'
    ]
  },
  {
    id: 'e2',
    type: 'expense' as const,
    keywords: [
      // ID
      'listrik', 'pln', 'air', 'pdam', 'wifi', 'internet', 'indihome', 'biznet', 'pulsa', 'telkomsel',
      'indosat', 'xl', 'axis', 'smartfren', 'token', 'tagihan', 'langganan', 'bpjs', 'gas', 'elpiji',
      'speedy', 'firstmedia', 'myrepublic',
      // EN
      'utilities', 'electricity', 'water', 'bill', 'subscription', 'cellular', 'phone bill', 'gas bill'
    ]
  },
  {
    id: 'e5',
    type: 'expense' as const,
    keywords: [
      // ID
      'dokter', 'sakit', 'obat', 'apotek', 'kimia farma', 'klinik', 'puskesmas', 'rs', 'rumah sakit',
      'vitamin', 'suplemen', 'asuransi', 'gigi', 'mata', 'optik', 'halodoc', 'alodokter',
      // EN
      'health', 'doctor', 'hospital', 'clinic', 'pharmacy', 'medicine', 'dentist', 'wellness',
      'insurance', 'medical', 'optician', 'physio', 'therapy'
    ]
  },
  {
    id: 'e1',
    type: 'expense' as const,
    keywords: [
      // ID
      'kos', 'kontrakan', 'sewa', 'apartemen', 'perumahan', 'renovasi', 'furnitur', 'kasur', 'meja',
      'kursi', 'lemari', 'semen', 'cat rumah', 'genteng', 'bata',
      // EN
      'housing', 'rent', 'apartment', 'mortgage', 'furniture', 'maintenance', 'landlord', 'room rent'
    ]
  },

  // === EXPENSES - Wants ===
  {
    id: 'e6',
    type: 'expense' as const,
    keywords: [
      // ID
      'bioskop', 'film', 'nonton', 'netflix', 'youtube', 'spotify', 'game', 'steam', 'playstation',
      'ps5', 'ps4', 'main', 'hiburan', 'karoke', 'wisata', 'rekreasi', 'konser', 'tiket', 'staycation',
      'hotel', 'liburan', 'rekreasi', 'museum', 'dufan', 'ancol', 'kebun binatang',
      // EN
      'entertainment', 'cinema', 'movie', 'gaming', 'ticket', 'concert', 'theme park', 'holiday',
      'vacation', 'xbox', 'nintendo', 'disney', 'prime video', 'booking.com', 'agoda', 'traveloka'
    ]
  },
  {
    id: 'e7',
    type: 'expense' as const,
    keywords: [
      // ID
      'kado', 'hadiah', 'donasi', 'sedekah', 'zakat', 'kondangan', 'pernikahan', 'traktir', 'patungan',
      'arisan', 'sumbangan', 'bantu', 'amal', 'kitabisa', 'tip', 'melayat',
      // EN
      'social', 'gift', 'charity', 'donation', 'treat', 'wedding', 'party', 'dinner with friends'
    ]
  },
  {
    id: 'e8',
    type: 'expense' as const,
    keywords: [
      // ID
      'baju', 'celana', 'sepatu', 'jaket', 'kaos', 'potong rambut', 'barbershop', 'salon', 'skincare',
      'kosmetik', 'belanjaan', 'h&m', 'uniqlo', 'zara', 'mall', 'mal', 'shopee', 'tokopedia', 'lazada',
      'fashion', 'tas', 'dompet', 'jam tangan', 'perhiasan', 'makeup', 'parfum', 'laundry', 'cuci baju',
      // EN
      'personal care', 'clothing', 'clothes', 'shoes', 'barber', 'makeup', 'cosmetics', 'shopping',
      'apparel', 'laundry', 'jeans', 't-shirt', 'sneakers', 'perfume', 'spa', 'massage', 'lulur'
    ]
  },

  // === EXPENSES - Savings, Investment & Debt ===
  {
    id: 'e10',
    type: 'expense' as const,
    keywords: [
      // ID
      'investasi', 'saham', 'reksadana', 'crypto', 'bitcoin', 'ethereum', 'binance', 'bibit', 'ajaib',
      'emas', 'logam mulia', 'reksa dana', 'pluang', 'pintu', 'tokocrypto',
      // EN
      'investment', 'invest', 'stocks', 'mutual fund', 'gold', 'cryptocurrency', 'equity'
    ]
  },
  {
    id: 'e11',
    type: 'expense' as const,
    keywords: [
      // ID
      'utang', 'hutang', 'cicilan', 'pinjaman', 'kartu kredit', 'paylater', 'gopaylater', 'shopeepaylater',
      'bunga pinjaman', 'denda', 'spaylater', 'kredivo', 'akulaku',
      // EN
      'debt', 'loan', 'credit card', 'mortgage payment', 'installments', 'interest payment', 'fine'
    ]
  },
  {
    id: 'e9',
    type: 'expense' as const,
    keywords: [
      // ID
      'darurat', 'tabungan darurat', 'dana darurat', 'cadangan',
      // EN
      'emergency', 'emergency fund', 'contingency fund'
    ]
  }
];

export function matchCategoryByKeywords(description: string, categories: any[]): MatchedCategoryResult {
  const cleanDesc = description.toLowerCase().trim();

  // 1. Try keyword list matching
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (cleanDesc.includes(keyword)) {
        // Double check if the custom categories contain this ID, or falls back gracefully
        const exists = categories.find(c => c.id === rule.id);
        if (exists) {
          return { categoryId: rule.id, type: rule.type };
        }
      }
    }
  }

  // 2. Try exact name match from user's custom categories
  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    if (cleanDesc.includes(catName) || catName.includes(cleanDesc)) {
      return { categoryId: cat.id, type: (cat.type as 'income' | 'expense') || 'expense' };
    }
  }

  // 3. Fallback: if "gaji", "income", "masuk", etc. is in the string, mark as income (i1)
  const isIncomeKeyword = cleanDesc.includes('gaji') || cleanDesc.includes('masuk') || cleanDesc.includes('income') || cleanDesc.includes('salary') || cleanDesc.includes('bonus') || cleanDesc.includes('untung');
  if (isIncomeKeyword) {
    const defaultIncome = categories.find(c => c.type === 'income');
    return { categoryId: defaultIncome?.id || 'i1', type: 'income' };
  }

  // Default Fallback: Expense category "Food" (e3) or "Personal Care" (e8) or first expense category
  const foodCat = categories.find(c => c.id === 'e3' && c.type === 'expense');
  if (foodCat) return { categoryId: foodCat.id, type: 'expense' };

  const personalCat = categories.find(c => c.id === 'e8' && c.type === 'expense');
  if (personalCat) return { categoryId: personalCat.id, type: 'expense' };

  const firstExpense = categories.find(c => c.type === 'expense');
  if (firstExpense) return { categoryId: firstExpense.id, type: 'expense' };

  return { categoryId: categories[0]?.id || '', type: 'expense' };
}
