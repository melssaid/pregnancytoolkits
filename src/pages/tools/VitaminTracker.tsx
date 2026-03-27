// src/pages/tools/VitaminTracker.tsx
import React, { useCallback, useEffect, useState, ChangeEvent, FormEvent } from 'react';
import type { VitaminEntry } from '../../types';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../../services/localStorageServices';

const STORAGE_KEY = 'vitamin-tracker-entries';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const initialForm = {
  vitaminName: '',
  dose: '',
  takenAt: new Date().toISOString().slice(0, 16), // yyyy-mm-ddThh:mm for input[type=datetime-local]
  notes: '',
};

const VitaminTracker: React.FC = () => {
  const [entries, setEntries] = useState<VitaminEntry[]>([]);
  const [form, setForm] = useState(() => ({ ...initialForm }));

  // Load stored entries from localStorage
  const loadData = useCallback(() => {
    try {
      const stored = loadFromLocalStorage<VitaminEntry[]>(STORAGE_KEY);
      setEntries(stored ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('VitaminTracker loadData error:', err);
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save the full entries array to storage
  const persistEntries = useCallback((next: VitaminEntry[]) => {
    try {
      saveToLocalStorage<VitaminEntry[]>(STORAGE_KEY, next);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('VitaminTracker persistEntries error:', err);
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAdd = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const entry: VitaminEntry = {
          id: makeId(),
          userId: 'local', // placeholder; replace with real user id when available
          vitaminName: form.vitaminName.trim() || 'Unnamed vitamin',
          dose: form.dose.trim() || '',
          takenAt: new Date(form.takenAt).toISOString(),
          notes: form.notes?.trim() || undefined,
        };

        setEntries((prev) => {
          const next = [...prev, entry];
          persistEntries(next);
          return next;
        });

        setForm({ ...initialForm, takenAt: new Date().toISOString().slice(0, 16) });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('VitaminTracker handleAdd error:', err);
      }
    },
    [form, persistEntries],
  );

  const handleDelete = useCallback(
    (id: string) => {
      try {
        setEntries((prev) => {
          const next = prev.filter((p) => p.id !== id);
          persistEntries(next);
          return next;
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('VitaminTracker handleDelete error:', err);
      }
    },
    [persistEntries],
  );

  const handleClearAll = useCallback(() => {
    try {
      setEntries([]);
      removeFromLocalStorage(STORAGE_KEY);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('VitaminTracker handleClearAll error:', err);
    }
  }, []);

  return (
    <section aria-label="vitamin-tracker" className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Vitamin Tracker</h2>

      <form onSubmit={handleAdd} className="space-y-2 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            name="vitaminName"
            value={form.vitaminName}
            onChange={handleChange}
            placeholder="Vitamin name"
            className="border rounded p-2"
            aria-label="vitamin-name"
          />

          <input
            name="dose"
            value={form.dose}
            onChange={handleChange}
            placeholder="Dose (e.g., 10mg)"
            className="border rounded p-2"
            aria-label="dose"
          />

          <input
            name="takenAt"
            value={form.takenAt}
            onChange={handleChange}
            type="datetime-local"
            className="border rounded p-2"
            aria-label="taken-at"
          />
        </div>

        <div>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes (optional)"
            className="w-full border rounded p-2"
            rows={2}
            aria-label="notes"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
            Add
          </button>
          <button type="button" onClick={handleClearAll} className="px-3 py-1 bg-red-600 text-white rounded">
            Clear All
          </button>
        </div>
      </form>

      <div>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-600">No vitamin entries yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries
              .slice()
              .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())
              .map((e) => (
                <li key={e.id} className="border rounded p-2 flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {e.vitaminName} {e.dose ? <span className="text-sm text-gray-500">— {e.dose}</span> : null}
                    </div>
                    <div className="text-xs text-gray-600">{new Date(e.takenAt).toLocaleString()}</div>
                    {e.notes ? <div className="mt-1 text-sm">{e.notes}</div> : null}
                  </div>

                  <div className="ml-4 flex flex-col items-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="text-xs text-red-600 hover:underline"
                      aria-label={`delete-${e.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default VitaminTracker;
