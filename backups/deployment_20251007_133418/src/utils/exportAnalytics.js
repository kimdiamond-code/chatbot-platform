/**
 * Export Analytics Data Utility
 * Handles exporting analytics data in various formats
 */

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Download data as CSV
 */
export const downloadCSV = (data, filename = 'analytics-export') => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Download data as JSON
 */
export const downloadJSON = (data, filename = 'analytics-export') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prepare analytics data for export
 */
export const prepareAnalyticsExport = (analyticsData) => {
  // Flatten the data structure for CSV export
  const salesData = Object.entries(analyticsData.sales).map(([key, value]) => ({
    category: 'Sales',
    metric: key,
    value: value
  }));

  const engagementData = Object.entries(analyticsData.engagement)
    .filter(([key]) => typeof analyticsData.engagement[key] !== 'object')
    .map(([key, value]) => ({
      category: 'Engagement',
      metric: key,
      value: value
    }));

  const insightsData = [
    {
      category: 'Insights',
      metric: 'Total Visitors',
      value: analyticsData.insights.shoppersIntelligence.totalVisitors
    },
    {
      category: 'Insights',
      metric: 'Average Session Time',
      value: analyticsData.insights.shoppersIntelligence.averageSessionTime
    }
  ];

  return {
    summary: [...salesData, ...engagementData, ...insightsData],
    topProducts: analyticsData.insights.shoppersIntelligence.topProducts,
    missingInfo: analyticsData.insights.missingInfo,
    recommendations: analyticsData.insights.aiRecommendations,
    conversionFunnel: analyticsData.insights.shoppersIntelligence.conversionFunnel,
    customerTypes: Object.entries(analyticsData.engagement.conversationsByCustomerType).map(([type, count]) => ({
      customerType: type,
      count: count
    }))
  };
};

/**
 * Export complete analytics report
 */
export const exportCompleteReport = (analyticsData, format = 'csv') => {
  const exportData = prepareAnalyticsExport(analyticsData);
  
  if (format === 'csv') {
    // Export each section as separate CSV
    downloadCSV(exportData.summary, 'analytics-summary');
    if (exportData.topProducts.length > 0) {
      downloadCSV(exportData.topProducts, 'top-products');
    }
    if (exportData.missingInfo.length > 0) {
      downloadCSV(exportData.missingInfo, 'missing-information');
    }
    if (exportData.recommendations.length > 0) {
      downloadCSV(exportData.recommendations, 'ai-recommendations');
    }
    if (exportData.conversionFunnel.length > 0) {
      downloadCSV(exportData.conversionFunnel, 'conversion-funnel');
    }
    downloadCSV(exportData.customerTypes, 'customer-types');
  } else if (format === 'json') {
    // Export as single JSON file
    downloadJSON({
      exportDate: new Date().toISOString(),
      analytics: analyticsData,
      exportData: exportData
    }, 'complete-analytics-report');
  }
};

/**
 * Generate printable report
 */
export const generatePrintableReport = (analyticsData) => {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Analytics Report - ${new Date().toLocaleDateString()}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        h3 { color: #6b7280; margin-top: 20px; }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #f9fafb;
        }
        .metric-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
        .metric-value { color: #111827; font-size: 28px; font-weight: bold; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        th { background: #f3f4f6; font-weight: 600; color: #374151; }
        .print-date { color: #6b7280; font-size: 14px; margin-top: 40px; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>Analytics Report</h1>
      <div class="print-date">Generated on ${new Date().toLocaleString()}</div>
      
      <h2>Sales Performance</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Conversion Rate</div>
          <div class="metric-value">${analyticsData.sales.conversionRate}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">AI Generated Sales</div>
          <div class="metric-value">$${analyticsData.sales.aiGeneratedSales}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Orders</div>
          <div class="metric-value">${analyticsData.sales.aiGeneratedOrders}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Average Order Value</div>
          <div class="metric-value">$${analyticsData.sales.aov}</div>
        </div>
      </div>

      <h2>Engagement Metrics</h2>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Engagement Rate</div>
          <div class="metric-value">${analyticsData.engagement.engagementRate}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Proactive Engagement</div>
          <div class="metric-value">${analyticsData.engagement.proactiveEngagementRate}%</div>
        </div>
      </div>

      <h2>Top Products</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Discussions</th>
          </tr>
        </thead>
        <tbody>
          ${analyticsData.insights.shoppersIntelligence.topProducts?.slice(0, 10).map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.count}</td>
            </tr>
          `).join('') || '<tr><td colspan="2">No data available</td></tr>'}
        </tbody>
      </table>

      <h2>AI Recommendations</h2>
      ${analyticsData.insights.aiRecommendations.map(rec => `
        <div class="metric-card" style="margin-bottom: 15px;">
          <h3>${rec.title}</h3>
          <p>${rec.description}</p>
          <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
            Impact: ${rec.impact.toUpperCase()}
          </div>
        </div>
      `).join('')}

      <div class="no-print" style="margin-top: 40px;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Print Report
        </button>
        <button onclick="window.close()" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
};
