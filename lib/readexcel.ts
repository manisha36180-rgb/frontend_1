import * as XLSX from 'xlsx';

/**
 * Utility to read an Excel file from a URL or File object and convert it to JSON.
 * This can be used for dynamic data flow from uploaded reports.
 */
export async function readExcelToJson<T = any>(source: string | File): Promise<T[]> {
  try {
    let arrayBuffer: ArrayBuffer;

    if (typeof source === 'string') {
      // Fetch from URL
      const response = await fetch(source);
      arrayBuffer = await response.arrayBuffer();
    } else {
      // Read from File object
      arrayBuffer = await source.arrayBuffer();
    }

    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as T[];
    
    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw new Error('Failed to parse Excel file');
  }
}

/**
 * Specifically maps the SEPERATE.xlsx format to our Report structure
 */
export function mapExcelToReports(data: any[]): any[] {
  return data.map((item, index) => ({
    id: `excel-${index}`,
    title: item['CERTIFICATE'] || item['CERTIFICATE OF REGISTRY'] || `Report ${index + 1}`,
    vesselId: 'vessel-1', // Default or dynamic
    inspectionDate: new Date().toISOString(),
    status: 'PENDING',
    description: `S.NO: ${item['S.NO']}. Comments: ${item['COMMENTS'] || 'None'}`,
    attachments: [],
    createdBy: 'user-1',
  }));
}
