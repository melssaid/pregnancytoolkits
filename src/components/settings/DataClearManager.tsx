import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
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

export const DataClearManager: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Get confirm word based on language
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
      // Collect keys to delete (excluding preserved keys)
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !PRESERVE_KEYS.includes(key)) {
          keysToDelete.push(key);
        }
      }

      // Delete all collected keys
      keysToDelete.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: t('settings.clearData.deleteSuccess'),
        description: t('settings.clearData.deleteSuccessDesc', { count: keysToDelete.length }),
      });

      setDialogOpen(false);
      setConfirmText('');

      // Reload to reset app state
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

  return (
    <Card className="border-2 border-destructive/30 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-destructive">
          <Trash2 className="w-5 h-5" />
          {t('settings.clearData.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.clearData.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current data count */}
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <span className="text-sm text-muted-foreground">{t('settings.clearData.currentData')}</span>
          <span className="font-semibold text-lg">{itemCount} {t('settings.clearData.items')}</span>
        </div>

        {/* Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>{t('settings.clearData.warning')}</strong> {t('settings.clearData.warningText')}
          </AlertDescription>
        </Alert>

        {/* What will be deleted */}
        <div className="text-sm space-y-1">
          <p className="font-medium mb-2">{t('settings.clearData.willBeDeleted')}</p>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground">
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.pregnancyData')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.appointments')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.healthRecords')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.pregnancyPhotos')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.birthPlans')}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>{t('settings.clearData.allSettings')}</span>
            </div>
          </div>
        </div>

        {/* Delete Button with Confirmation */}
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
                <p>
                  {t('settings.clearData.confirmDesc')} <strong>{itemCount}</strong> {t('settings.clearData.confirmDescItems')}
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ {t('settings.clearData.confirmWarning')}
                </p>
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

        {/* Recommendation */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
          <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <span>
            <strong>{t('settings.clearData.tip')}</strong> {t('settings.clearData.tipText')}
          </span>
        </div>

      </CardContent>
    </Card>
  );
};

export default DataClearManager;
