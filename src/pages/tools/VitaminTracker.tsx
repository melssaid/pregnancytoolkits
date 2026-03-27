import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pill, Plus, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToolFrame } from '@/components/ToolFrame';
import { useToast } from '@/hooks/use-toast';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '@/services/localStorageServices';

interface VitaminEntry {
  id: string;
  vitaminName: string;
  dose: string;
  takenAt: string;
  notes?: string;
}

const STORAGE_KEY = 'vitamin-tracker-entries';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const VitaminTracker: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [entries, setEntries] = useState<VitaminEntry[]>([]);
  const [vitaminName, setVitaminName] = useState('');
  const [dose, setDose] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = loadFromLocalStorage<VitaminEntry[]>(STORAGE_KEY);
    setEntries(stored ?? []);
  }, []);

  const persistEntries = useCallback((next: VitaminEntry[]) => {
    saveToLocalStorage(STORAGE_KEY, next);
  }, []);

  const handleAdd = useCallback(() => {
    if (!vitaminName.trim()) {
      toast({ title: t('common.error'), description: t('toolsInternal.vitaminTracker.nameRequired', 'Please enter vitamin name'), variant: 'destructive' });
      return;
    }
    const entry: VitaminEntry = {
      id: makeId(),
      vitaminName: vitaminName.trim(),
      dose: dose.trim(),
      takenAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };
    const next = [...entries, entry];
    setEntries(next);
    persistEntries(next);
    setVitaminName('');
    setDose('');
    setNotes('');
    toast({ title: t('toolsInternal.vitaminTracker.added', 'Vitamin logged ✓') });
  }, [vitaminName, dose, notes, entries, persistEntries, toast, t]);

  const handleDelete = useCallback((id: string) => {
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    persistEntries(next);
  }, [entries, persistEntries]);

  const handleClearAll = useCallback(() => {
    setEntries([]);
    removeFromLocalStorage(STORAGE_KEY);
  }, []);

  return (
    <ToolFrame
      toolId="vitamin-tracker"
      title={t('tools.vitaminTracker.title', 'Vitamin Tracker')}
      subtitle={t('tools.vitaminTracker.subtitle', 'Log your daily vitamins & supplements')}
      icon={Pill}
    >
      <div className="space-y-4">
        {/* Add Entry */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('toolsInternal.vitaminTracker.addEntry', 'Log Vitamin')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('toolsInternal.vitaminTracker.vitaminName', 'Vitamin name')}
                value={vitaminName}
                onChange={(e) => setVitaminName(e.target.value)}
              />
              <Input
                placeholder={t('toolsInternal.vitaminTracker.dose', 'Dose (e.g. 10mg)')}
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </div>
            <Textarea
              placeholder={t('toolsInternal.vitaminTracker.notes', 'Notes (optional)')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <Button onClick={handleAdd} className="w-full">
              <Plus className="w-4 h-4 me-1" />
              {t('common.add', 'Add')}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {t('toolsInternal.vitaminTracker.history', 'Today\'s Log')}
              {entries.length > 0 && <span className="text-muted-foreground font-normal ms-2">({entries.length})</span>}
            </CardTitle>
            {entries.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-destructive">
                <Trash2 className="w-3.5 h-3.5 me-1" />
                {t('common.clearAll', 'Clear')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('toolsInternal.vitaminTracker.noEntries', 'No vitamins logged yet.')}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {[...entries].reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 px-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{entry.vitaminName}</span>
                        {entry.dose && <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{entry.dose}</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(entry.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;
