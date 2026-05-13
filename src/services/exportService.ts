/**
 * Utility to convert an array of objects into a CSV string and trigger a download.
 */
export const exportToCSV = (data: any[], filename: string, headers: string[], metadata?: string[]) => {
  if (!data || !data.length) return;

  const csvRows = [];
  
  // Add metadata if provided
  if (metadata && metadata.length > 0) {
    metadata.forEach(meta => {
      // Escape metadata to prevent CSV injection or breaking format
      const escaped = meta.replace(/"/g, '""');
      csvRows.push(`"${escaped}"`);
    });
    csvRows.push(''); // Empty row for spacing before the table
  }

  // Add headers
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header.toLowerCase()];
      if (val === undefined || val === null) {
        val = row[header];
      }
      if (val === undefined || val === null) {
        val = '';
      }
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // Add BOM for UTF-8 to ensure Excel reads characters correctly
  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactions = (transactions: any[], userName: string = 'User', getCategoryName: (id: string) => string = (id) => id, t: any = (k: string) => k) => {
  const headers = [t('date'), t('description'), t('amount'), t('type'), t('category'), t('notes')];
  const data = transactions.map(tx => ({
    [t('date')]: tx.date,
    [t('description')]: tx.description,
    [t('amount')]: tx.amount,
    [t('type')]: t(tx.type),
    [t('category')]: getCategoryName(tx.category),
    [t('notes')]: tx.notes || ''
  }));
  
  const metadata = [
    `LifeFlow - ${t('analytics')}`,
    `${t('userAccount')}: ${userName}`,
    `${t('date')}: ${new Date().toLocaleDateString()}`
  ];

  exportToCSV(data, `lifeflow_transactions_${new Date().toISOString().split('T')[0]}`, headers, metadata);
};

export const exportTasks = (tasks: any[], userName: string = 'User', t: any = (k: string) => k) => {
  const headers = [t('date'), t('activity'), t('startTime'), t('endTime'), t('completedTasks')];
  const data = tasks.map(task => ({
    [t('date')]: task.date,
    [t('activity')]: task.title,
    [t('startTime')]: task.startTime,
    [t('endTime')]: task.endTime,
    [t('completedTasks')]: task.completed ? 'Yes' : 'No'
  }));

  const metadata = [
    `LifeFlow - ${t('schedule')}`,
    `${t('userAccount')}: ${userName}`,
    `${t('date')}: ${new Date().toLocaleDateString()}`
  ];

  exportToCSV(data, `lifeflow_tasks_${new Date().toISOString().split('T')[0]}`, headers, metadata);
};
