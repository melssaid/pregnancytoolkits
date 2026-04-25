/**
 * Local PDF history — stores generated reports (base64) in IndexedDB
 * so users can re-download past PDFs (e.g. sonar bump-photo analyses)
 * without re-running the AI analysis.
 */
import { useCallback, useEffect, useState } from 'react';
import { idbGet, idbSet } from '@/lib/indexedDBStore';

export interface PdfHistoryEntry {
  id: string;
  title: string;
  /** Pregnancy week at time of save, if known */
  week: number | null;
  /** ISO date string */
  createdAt: string;
  /** A4 orientation used for the PDF */
  orientation: 'portrait' | 'landscape';
  /** Tool/category bucket (e.g. "sonar", "smart-plan") */
  bucket: string;
  /** Full printable HTML (re-opens native print dialog on re-download) */
  html: string;
  /** byte size of the html payload, for quota awareness */
  size: number;
}

const KEY = (bucket: string) => `pdf_history__${bucket}_v1`;
const MAX_ENTRIES = 12;

export function usePdfHistory(bucket: string) {
  const [entries, setEntries] = useState<PdfHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await idbGet<PdfHistoryEntry[]>(KEY(bucket));
      if (!cancelled) {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bucket]);

  const add = useCallback(async (entry: Omit<PdfHistoryEntry, 'id' | 'createdAt' | 'size'>) => {
    const newEntry: PdfHistoryEntry = {
      ...entry,
      id: `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      size: entry.dataUrl.length,
    };
    setEntries(prev => {
      const next = [newEntry, ...prev].slice(0, MAX_ENTRIES);
      idbSet(KEY(bucket), next);
      return next;
    });
    return newEntry;
  }, [bucket]);

  const remove = useCallback(async (id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      idbSet(KEY(bucket), next);
      return next;
    });
  }, [bucket]);

  const clear = useCallback(async () => {
    setEntries([]);
    await idbSet(KEY(bucket), []);
  }, [bucket]);

  return { entries, loading, add, remove, clear };
}
