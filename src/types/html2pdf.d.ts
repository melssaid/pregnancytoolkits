// src/types/html2pdf.d.ts
declare module 'html2pdf.js' {
  export interface Html2PdfOptions {
    filename?: string;
    margin?: number | [number, number, number, number];
    jsPDF?: unknown;
    html2canvas?: unknown;
    pagebreak?: {
      mode?: 'css' | 'legacy';
      before?: string;
      after?: string;
    };
    // أضف خيارات إضافية إذا استخدمت خيارات خاصة
  }

  export default function html2pdf(element: HTMLElement | Element, options?: Html2PdfOptions): Promise<void>;
}
