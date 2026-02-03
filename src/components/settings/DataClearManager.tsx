import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

// Keys that should NOT be deleted (system keys, cookies consent, etc.)
const PRESERVE_KEYS = [
  'cookie_consent',
  'theme',
  'i18nextLng',
];

interface DataClearManagerProps {
  compact?: boolean;
}

export const DataClearManager: React.FC<DataClearManagerProps> = ({ compact = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const CONFIRM_WORD = t('settings.clearData.confirmWord');

  const countStoredItems = (): number => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !PRESERVE_KEYS.includes(key)) {
        count++;
      }
    }
    return count;
  };

  const handleClearAllData = async () => {
    if (confirmText !== CONFIRM_WORD) {
      toast({
        title: t('settings.clearData.confirmError'),
        description: t('settings.clearData.confirmErrorDesc', { word: CONFIRM_WORD }),
        variant: 'destructive'
      });
      return;
    }

    setIsDeleting(true);

    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !PRESERVE_KEYS.includes(key)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: t('settings.clearData.deleteSuccess'),
        description: t('settings.clearData.deleteSuccessDesc', { count: keysToDelete.length }),
      });

      setDialogOpen(false);
      setConfirmText('');

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Clear data error:', error);
      toast({
        title: t('settings.clearData.deleteError'),
        description: t('settings.clearData.deleteErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const itemCount = countStoredItems();

  if (compact) {
    return (
      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{t('settings.clearData.title')}</span>
          </div>
          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
            {itemCount} {t('settings.clearData.items')}
          </span>
        </div>
        
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full gap-1.5 h-8 text-xs"
              disabled={itemCount === 0}
            >
              <Trash2 className="w-3 h-3" />
              {itemCount === 0 ? t('settings.clearData.noDataToDelete') : t('settings.clearData.deleteAllData')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertTriangle className="w-4 h-4" />
                {t('settings.clearData.confirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2 text-sm">
                <p>{t('settings.clearData.confirmDesc')} <strong>{itemCount}</strong> {t('settings.clearData.confirmDescItems')}</p>
                <p className="text-destructive font-medium text-xs">⚠️ {t('settings.clearData.confirmWarning')}</p>
                <div className="pt-2">
                  <p className="text-xs mb-1.5">
                    {t('settings.clearData.typeToConfirm')} "<strong>{CONFIRM_WORD}</strong>"
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={t('settings.clearData.typePlaceholder')}
                    className="text-center h-9"
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel onClick={() => setConfirmText('')} className="h-8 text-xs">
                {t('settings.clearData.cancel')}
              </AlertDialogCancel>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAllData}
                disabled={confirmText !== CONFIRM_WORD || isDeleting}
                className="gap-1.5 h-8 text-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('settings.clearData.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    {t('settings.clearData.confirmDelete')}
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Full version
  return (
    <div className="border-2 border-destructive/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trash2 className="w-5 h-5 text-destructive" />
        <span className="font-medium text-destructive">{t('settings.clearData.title')}</span>
      </div>

      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg mb-3">
        <span className="text-sm text-muted-foreground">{t('settings.clearData.currentData')}</span>
        <span className="font-semibold">{itemCount} {t('settings.clearData.items')}</span>
      </div>

      <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive mb-3">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <span><strong>{t('settings.clearData.warning')}</strong> {t('settings.clearData.warningText')}</span>
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            className="w-full gap-2"
            disabled={itemCount === 0}
          >
            <Trash2 className="w-4 h-4" />
            {itemCount === 0 ? t('settings.clearData.noDataToDelete') : t('settings.clearData.deleteAllData')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t('settings.clearData.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{t('settings.clearData.confirmDesc')} <strong>{itemCount}</strong> {t('settings.clearData.confirmDescItems')}</p>
              <p className="text-destructive font-medium">⚠️ {t('settings.clearData.confirmWarning')}</p>
              <div className="pt-2">
                <p className="text-sm mb-2">
                  {t('settings.clearData.typeToConfirm')} "<strong>{CONFIRM_WORD}</strong>" {t('settings.clearData.toConfirm')}
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t('settings.clearData.typePlaceholder')}
                  className="text-center"
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setConfirmText('')}>
              {t('settings.clearData.cancel')}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
              disabled={confirmText !== CONFIRM_WORD || isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('settings.clearData.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t('settings.clearData.confirmDelete')}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataClearManager;
