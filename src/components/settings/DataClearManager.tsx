import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
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

  const CONFIRM_WORD = 'حذف';

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
        title: 'خطأ في التأكيد',
        description: `يرجى كتابة "${CONFIRM_WORD}" للتأكيد`,
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
        title: 'تم الحذف بنجاح ✅',
        description: `تم حذف ${keysToDelete.length} عنصر من البيانات المحلية`,
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
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء حذف البيانات',
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
          حذف جميع البيانات
        </CardTitle>
        <CardDescription>
          إزالة جميع البيانات المحفوظة على هذا الجهاز
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current data count */}
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <span className="text-sm text-muted-foreground">البيانات المحفوظة حالياً:</span>
          <span className="font-semibold text-lg">{itemCount} عنصر</span>
        </div>

        {/* Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه! سيتم حذف جميع سجلات الحمل، المواعيد، الصور، والإعدادات.
          </AlertDescription>
        </Alert>

        {/* What will be deleted */}
        <div className="text-sm space-y-1">
          <p className="font-medium mb-2">سيتم حذف:</p>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground">
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>بيانات الحمل</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>المواعيد والتذكيرات</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>سجلات الصحة</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>صور الحمل</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>خطط الولادة</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-destructive" />
              <span>جميع الإعدادات</span>
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
              {itemCount === 0 ? 'لا توجد بيانات للحذف' : 'حذف جميع البيانات'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                تأكيد حذف البيانات
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  أنت على وشك حذف <strong>{itemCount} عنصر</strong> من البيانات المحلية.
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ هذا الإجراء نهائي ولا يمكن التراجع عنه!
                </p>
                <div className="pt-2">
                  <p className="text-sm mb-2">
                    اكتب "<strong>{CONFIRM_WORD}</strong>" للتأكيد:
                  </p>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={`اكتب "${CONFIRM_WORD}" هنا`}
                    className="text-center"
                    dir="rtl"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row-reverse gap-2">
              <AlertDialogCancel onClick={() => setConfirmText('')}>
                إلغاء
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
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    تأكيد الحذف
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
            <strong>نصيحة:</strong> قم بتصدير نسخة احتياطية قبل الحذف لحفظ بياناتك
          </span>
        </div>

      </CardContent>
    </Card>
  );
};

export default DataClearManager;
