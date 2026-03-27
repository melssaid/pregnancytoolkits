// src/types/index.ts
// واجهات Types الأساسية المستخدمة في المشروع.
// عدّل/أضف الحقول حسب الحاجة الفعلية للتطبيق.

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  created_at?: string;
  // أضف الحقول المستخدمة فعلياً في قاعدة البيانات
}

export interface Settings {
  darkMode?: boolean;
  notificationsEnabled?: boolean;
  language?: string;
  // أضف أي إعدادات تحتاجها
}

export interface VitaminEntry {
  id: string;
  userId: string;
  vitaminName: string;
  dose: string; // أو رقم إذا كان رقمياً
  takenAt: string; // ISO date string
  notes?: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // ISO date string
  weightKg: number;
}

export interface LocalStored<T = unknown> {
  value: T;
  savedAt?: string;
}
