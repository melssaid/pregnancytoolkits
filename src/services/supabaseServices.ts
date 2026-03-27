// src/services/supabaseServices.ts
// تأكد من تعديل مسار استيراد العميل إذا كان مكانه مختلفاً في مشروعك.
// شائع: '../lib/supabaseClient' أو './supabaseClient' أو 'src/lib/supabase'
import { supabase } from '../lib/supabaseClient'; // <-- غيّر هذا المسار إذا لزم
import type { PostgrestError } from '@supabase/supabase-js';
import type { Profile, VitaminEntry, WeightEntry } from '../types';

/**
 * Generic helper: select all rows from a table with typed rows.
 */
export async function selectAllFromTable<T = unknown>(table: string): Promise<T[] | null> {
  try {
    const { data, error } = await supabase.from<T>(table).select('*');
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`selectAllFromTable(${table}) supabase error:`, error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`selectAllFromTable(${table}) unexpected error:`, err);
    return null;
  }
}

/**
 * Generic helper: select one row by a column (commonly id).
 */
export async function selectOneBy<T = unknown>(table: string, column: string, value: string): Promise<T | null> {
  try {
    const { data, error } = await supabase.from<T>(table).select('*').eq(column, value).limit(1).maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`selectOneBy ${table}.${column}=${value} supabase error:`, error);
      return null;
    }
    return (data as T) ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`selectOneBy ${table}.${column}=${value} unexpected error:`, err);
    return null;
  }
}

/**
 * Generic helper: insert a single item and return the inserted row (if selected).
 */
export async function insertItem<T = unknown>(table: string, item: T): Promise<T | null> {
  try {
    const { data, error } = await supabase.from<T>(table).insert(item).select().limit(1).maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`insertItem ${table} error:`, error);
      return null;
    }
    return (data as T) ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`insertItem ${table} unexpected error:`, err);
    return null;
  }
}

/**
 * Generic helper: update a row by a column and return the updated row.
 */
export async function updateItem<T = unknown>(table: string, column: string, value: string, patch: Partial<T>): Promise<T | null> {
  try {
    const { data, error } = await supabase.from<T>(table).update(patch).eq(column, value).select().limit(1).maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`updateItem ${table} ${column}=${value} error:`, error);
      return null;
    }
    return (data as T) ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`updateItem ${table} ${column}=${value} unexpected error:`, err);
    return null;
  }
}

/**
 * Generic helper: delete a row by a column.
 */
export async function deleteItem(table: string, column: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).delete().eq(column, value);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`deleteItem ${table} ${column}=${value} error:`, error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`deleteItem ${table} ${column}=${value} unexpected error:`, err);
    return false;
  }
}

/* === Application-specific helpers (typed) === */

/**
 * Get all profiles (typed).
 */
export async function getProfiles(): Promise<Profile[] | null> {
  return selectAllFromTable<Profile>('profiles');
}

/**
 * Get a single profile by id.
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  return selectOneBy<Profile>('profiles', 'id', id);
}

/**
 * Upsert a profile (insert or update) and return the resulting profile.
 */
export async function upsertProfile(profile: Profile): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from<Profile>('profiles').upsert(profile).select().limit(1).maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.error('upsertProfile supabase error:', error);
      return null;
    }
    return (data as Profile) ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('upsertProfile unexpected error:', err);
    return null;
  }
}

/**
 * Get vitamin entries for a user (example).
 */
export async function getVitaminEntriesForUser(userId: string): Promise<VitaminEntry[] | null> {
  try {
    const { data, error } = await supabase.from<VitaminEntry>('vitamin_entries').select('*').eq('user_id', userId);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('getVitaminEntriesForUser supabase error:', error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getVitaminEntriesForUser unexpected error:', err);
    return null;
  }
}

/**
 * Add a vitamin entry.
 */
export async function addVitaminEntry(entry: VitaminEntry): Promise<VitaminEntry | null> {
  return insertItem<VitaminEntry>('vitamin_entries', entry);
}

/**
 * Get weight entries for a user (example).
 */
export async function getWeightEntriesForUser(userId: string): Promise<WeightEntry[] | null> {
  try {
    const { data, error } = await supabase.from<WeightEntry>('weight_entries').select('*').eq('user_id', userId);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('getWeightEntriesForUser supabase error:', error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getWeightEntriesForUser unexpected error:', err);
    return null;
  }
}

/* Export an explicit default object for convenience (optional) */
const SupabaseService = {
  selectAllFromTable,
  selectOneBy,
  insertItem,
  updateItem,
  deleteItem,
  getProfiles,
  getProfileById,
  upsertProfile,
  getVitaminEntriesForUser,
  addVitaminEntry,
  getWeightEntriesForUser,
};

export default SupabaseService;
