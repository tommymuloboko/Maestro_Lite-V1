// Print helpers for UI -> IPC communication
// These will be implemented when Electron/Tauri IPC is set up

export interface PrintOptions {
  copies?: number;
  printerName?: string;
  silent?: boolean;
}

export async function printElement(
  elementId: string,
  options: PrintOptions = {}
): Promise<void> {
  void options;
  // For now, use browser print
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

export async function printHtml(
  html: string,
  options: PrintOptions = {}
): Promise<void> {
  void options;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window');
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

export async function getAvailablePrinters(): Promise<string[]> {
  // Will be implemented with IPC
  return [];
}
