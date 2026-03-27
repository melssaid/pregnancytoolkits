// src/services/supabaseServices.ts
import { supabase } from '@/integrations/supabase/client';

/* ======= Appointment Service (local storage based) ======= */

interface Appointment {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  doctor?: string;
  notes?: string;
  type?: string;
  reminder?: boolean;
  created_at: string;
  updated_at: string;
}

const getUserId = (): string => {
  let userId = localStorage.getItem('pregnancy_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('pregnancy_user_id', userId);
  }
  return userId;
};

const generateId = (): string => `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const AppointmentService = {
  async getAll(): Promise<Appointment[]> {
    try {
      const stored = localStorage.getItem(`appointments_${getUserId()}`);
      return stored ? (JSON.parse(stored) as Appointment[]) : [];
    } catch {
      return [];
    }
  },

  async create(data: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const now = new Date().toISOString();
    const appointment: Appointment = {
      ...data,
      id: generateId(),
      user_id: getUserId(),
      created_at: now,
      updated_at: now
    };
    const all = await this.getAll();
    all.push(appointment);
    localStorage.setItem(`appointments_${getUserId()}`, JSON.stringify(all));
    return appointment;
  },

  async update(id: string, data: Partial<Appointment>): Promise<Appointment | null> {
    const all = await this.getAll();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(`appointments_${getUserId()}`, JSON.stringify(all));
    return all[idx];
  },

  async delete(id: string): Promise<boolean> {
    const all = await this.getAll();
    const filtered = all.filter(a => a.id !== id);
    localStorage.setItem(`appointments_${getUserId()}`, JSON.stringify(filtered));
    return true;
  }
};

export default { AppointmentService };
