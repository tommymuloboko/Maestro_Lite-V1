import { useCallback, useState } from 'react';
import { printElement, printHtml, type PrintOptions } from '@/lib/utils/print';

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printById = useCallback(
    async (elementId: string, options?: PrintOptions) => {
      setIsPrinting(true);
      try {
        await printElement(elementId, options);
      } finally {
        setIsPrinting(false);
      }
    },
    []
  );

  const printContent = useCallback(async (html: string, options?: PrintOptions) => {
    setIsPrinting(true);
    try {
      await printHtml(html, options);
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    isPrinting,
    printById,
    printContent,
  };
}
