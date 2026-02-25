import React, { useState } from 'react';
import { UserX, AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
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

interface AccountDeletionProps {
  compact?: boolean;
}

export const AccountDeletion: React.FC<AccountDeletionProps> = ({ compact = true }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const CONFIRM_WORD = t('settings.deleteAccount.confirmWord', 'DELETE');

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_WORD) {
      toast({
        title: t('settings.deleteAccount.confirmError'),
        description: t('settings.deleteAccount.confirmErrorDesc', { word: CONFIRM_WORD }),
        variant: 'destructive'
      });
      return;
    }

    setIsDeleting(true);

    try {
      // 1. Clear all localStorage
      const keysToKeep = ['cookie_consent', 'theme', 'i18nextLng'];
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) allKeys.push(key);
      }
      allKeys.forEach(k => localStorage.removeItem(k));

      // 2. Try to sign out from auth (clears anonymous session)
      try {
        await supabase.auth.signOut();
      } catch { /* ignore if no session */ }

      toast({
        title: t('settings.deleteAccount.success'),
        description: t('settings.deleteAccount.successDesc'),
      });

      setDialogOpen(false);
      setConfirmText('');

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: t('settings.deleteAccount.error'),
        description: t('settings.deleteAccount.errorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-2 mb-2">
        <UserX className="w-4 h-4 text-destructive" />
        <span className="text-sm font-medium text-destructive">{t('settings.deleteAccount.title')}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">
        {t('settings.deleteAccount.description')}
      </p>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="w-full gap-1.5 h-8 text-xs">
            <Trash2 className="w-3 h-3" />
            {t('settings.deleteAccount.button')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.deleteAccount.confirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <p>{t('settings.deleteAccount.confirmDesc')}</p>
              <p className="text-destructive font-medium text-xs">⚠️ {t('settings.deleteAccount.confirmWarning')}</p>
              <div className="pt-2">
                <p className="text-xs mb-1.5">
                  {t('settings.clearData.typeToConfirm')} "<strong>{CONFIRM_WORD}</strong>"
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_WORD}
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
              onClick={handleDeleteAccount}
              disabled={confirmText !== CONFIRM_WORD || isDeleting}
              className="gap-1.5 h-8 text-xs"
            >
              {isDeleting ? (
                <><Loader2 className="w-3 h-3 animate-spin" />{t('settings.clearData.deleting')}</>
              ) : (
                <><Trash2 className="w-3 h-3" />{t('settings.deleteAccount.confirmButton')}</>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountDeletion;
