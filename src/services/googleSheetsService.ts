import { Transaction, Category } from '../types';

export interface GoogleSheetsExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Creates a Google Spreadsheet and populates it with LifeFlow financial report data.
 */
export async function exportFinanceToGoogleSheets(
  accessToken: string,
  transactions: Transaction[],
  categories: Category[],
  userEmail: string = 'User',
  language: string = 'en'
): Promise<GoogleSheetsExportResult> {
  const isId = language === 'id';
  
  // Calculate Summary Metrics
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(tx => {
    if (tx.type === 'income') totalIncome += tx.amount;
    else if (tx.type === 'expense') totalExpense += tx.amount;
  });
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Helper to translate default categories if needed
  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId || c.name === catId);
    return cat ? cat.name : catId;
  };

  // Prepare cell grid
  const titleText = isId ? 'LAPORAN KEUANGAN LIFEFLOW' : 'LIFEFLOW FINANCIAL REPORT';
  const subtitleText = isId ? 'Ekspor Otomatis Cerdas Keuangan' : 'Automated Smart Wealth Analytics';
  const userLabel = isId ? 'Akun Pengguna' : 'User Account';
  const dateLabel = isId ? 'Tanggal Pembuatan' : 'Date Generated';
  const metricsTitle = isId ? 'Ringkasan Keuangan' : 'Financial Summary';
  
  const totalIncomeLabel = isId ? 'Total Pendapatan' : 'Total Income';
  const totalExpenseLabel = isId ? 'Total Pengeluaran' : 'Total Expense';
  const netSavingsLabel = isId ? 'Tabungan Bersih' : 'Net Savings';
  const savingsRateLabel = isId ? 'Tingkat Tabungan' : 'Savings Rate';
  
  const transactionTableTitle = isId ? 'Arus Kas Detil' : 'Detailed Cash Flow';
  
  const headers = [
    isId ? 'Tanggal' : 'Date',
    isId ? 'Deskripsi' : 'Description',
    isId ? 'Jumlah' : 'Amount',
    isId ? 'Tipe' : 'Type',
    isId ? 'Kategori' : 'Category',
    isId ? 'Catatan' : 'Notes'
  ];

  const rows: any[][] = [
    [titleText],
    [subtitleText],
    [],
    [userLabel, userEmail],
    [dateLabel, new Date().toLocaleString()],
    [],
    [metricsTitle],
    [totalIncomeLabel, totalIncome],
    [totalExpenseLabel, totalExpense],
    [netSavingsLabel, netSavings],
    [savingsRateLabel, `${savingsRate.toFixed(1)}%`],
    [],
    [],
    [transactionTableTitle],
    headers,
  ];

  // Append transaction rows
  transactions.forEach(tx => {
    rows.push([
      tx.date,
      tx.description,
      tx.amount,
      isId ? (tx.type === 'income' ? 'Pendapatan' : 'Pengeluaran') : (tx.type === 'income' ? 'Income' : 'Expense'),
      getCategoryName(tx.category),
      tx.notes || ''
    ]);
  });

  const createTitle = isId 
    ? `LifeFlow - Laporan Keuangan (${new Date().toLocaleDateString('id-ID')})`
    : `LifeFlow - Financial Report (${new Date().toLocaleDateString()})`;

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: createTitle
      }
    })
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    console.error('Failed to create spreadsheet:', errorBody);
    throw new Error(isId ? 'Gagal membuat spreadsheet di akun Google Anda.' : 'Failed to create spreadsheet on your Google account.');
  }

  const spreadsheetData = await createRes.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = spreadsheetData.spreadsheetUrl;

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!updateRes.ok) {
    const errorBody = await updateRes.text();
    console.error('Failed to update spreadsheet cells:', errorBody);
    throw new Error(isId ? 'Gagal mengisi data ke Google Sheets.' : 'Failed to populate Google Sheets data.');
  }

  return {
    spreadsheetId,
    spreadsheetUrl
  };
}
