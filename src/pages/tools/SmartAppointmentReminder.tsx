import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Bell, MapPin, User, Clock, Trash2, Edit2, Loader2, MessageSquare, Check, Sparkles, Stethoscope, TestTube, Baby, Activity, ChevronDown, ChevronUp, BellRing, FileText, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AppointmentService } from '@/services/supabaseServices';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { TimePicker } from '@/components/ui/time-picker';
import { AIResultDisclaimer } from '@/components/compliance/AIResultDisclaimer';
import { ToolFrame } from '@/components/ToolFrame';
import { WeekSlider } from '@/components/WeekSlider';
import { MedicalDisclaimer } from '@/components/compliance';
import { AIActionButton } from '@/components/ai/AIActionButton';

interface Appointment {
  id: string;
  title: string;
  doctor_name: string | null;
  location: string | null;
  appointment_date: string;
  notes: string | null;
  questions: any[];
  reminder_sent: boolean;
}

const APPOINTMENT_TYPES = [
  { key: 'checkup',     icon: Stethoscope, color: 'bg-primary/10 text-primary' },
  { key: 'checkup',  icon: Baby,        color: 'bg-accent/20 text-accent-foreground' },
  { key: 'bloodTest',   icon: TestTube,    color: 'bg-destructive/10 text-destructive' },
  { key: 'glucoseTest', icon: Activity,    color: 'bg-secondary text-secondary-foreground' },
  { key: 'other',       icon: Calendar,    color: 'bg-muted text-muted-foreground' },
];

/** Auto-enable appointment notifications after saving */
const enableAppointmentNotifications = () => {
  try {
    const raw = localStorage.getItem('notificationSettings');
    if (raw) {
      const settings = JSON.parse(raw);
      if (!settings.appointmentReminders || !settings.masterEnabled) {
        settings.appointmentReminders = true;
        settings.masterEnabled = true;
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
      }
    } else {
      // First time — create settings with appointment enabled
      localStorage.setItem('notificationSettings', JSON.stringify({
        masterEnabled: true,
        appointmentReminders: true,
        vitaminReminders: false,
        waterReminders: false,
        cycleReminders: false,
        weeklyTipReminders: false,
        kickReminders: false,
        milestoneReminders: false,
        diaperReminders: false,
      }));
    }
  } catch {}
};

const SmartAppointmentReminder: React.FC = () => {
  const { t } = useTranslation();
  const { profile: userProfile } = useUserProfile();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(userProfile.pregnancyWeek || 0);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [formStep, setFormStep] = useState(0); // 0: type+date, 1: details, 2: questions
  const { generate, error: aiError } = useSmartInsight({
    section: 'appointments',
    toolType: 'appointment-prep',
  });
  const abortRef = useRef(false);

  useEffect(() => {
    if (userProfile.pregnancyWeek) setCurrentWeek(userProfile.pregnancyWeek);
  }, [userProfile.pregnancyWeek]);

  const [formData, setFormData] = useState({
    title: '',
    doctor_name: '',
    location: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    questions: [] as string[]
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await AppointmentService.getAll();
      setAppointments(data);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title || !formData.appointment_date) {
      toast({
        title: t('common.error'),
        description: t('toolsInternal.appointmentReminder.fillRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const dateTime = formData.appointment_time 
        ? `${formData.appointment_date}T${formData.appointment_time}:00`
        : `${formData.appointment_date}T09:00:00`;
      
      const appointmentData = {
        title: formData.title,
        doctor_name: formData.doctor_name || null,
        location: formData.location || null,
        appointment_date: dateTime,
        notes: formData.notes || null,
        questions: formData.questions
      };

      if (editingId) {
        await AppointmentService.update(editingId, appointmentData);
        setAppointments(prev => prev.map(a => 
          a.id === editingId ? { ...a, ...appointmentData } : a
        ));
      } else {
        const newAppointment = await AppointmentService.add(appointmentData);
        setAppointments(prev => [...prev, newAppointment]);
      }

      // Auto-enable notifications
      enableAppointmentNotifications();

      toast({
        title: t('common.success') + ' ✅',
        description: formData.questions.length > 0
          ? t('toolsInternal.appointmentReminder.savedWithQuestions', {
              count: formData.questions.length,
              defaultValue: 'Saved with {{count}} questions for the doctor'
            })
          : undefined,
      });

      resetForm();
      
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('toolsInternal.appointmentReminder.confirmDelete'))) return;

    try {
      await AppointmentService.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast({ title: t('common.delete') });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    const date = new Date(appointment.appointment_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setFormData({
      title: appointment.title,
      doctor_name: appointment.doctor_name || '',
      location: appointment.location || '',
      appointment_date: `${year}-${month}-${day}`,
      appointment_time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      notes: appointment.notes || '',
      questions: appointment.questions || []
    });
    setEditingId(appointment.id);
    setShowForm(true);
    setFormStep(0);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      doctor_name: '',
      location: '',
      appointment_date: '',
      appointment_time: '',
      notes: '',
      questions: []
    });
    setEditingId(null);
    setShowForm(false);
    setSuggestedQuestions([]);
    setFormStep(0);
  };

  const generateQuestions = async () => {
    try {
      setIsGeneratingQuestions(true);
      setSuggestedQuestions([]);
      abortRef.current = false;
      
      let fullResponse = '';
      
      const prompt = `As a prenatal appointment preparation guide, suggest 5 important questions for a "${formData.title}" appointment at week ${currentWeek} of pregnancy.

Focus on:
- Questions specific to week ${currentWeek} developments
- Important topics to discuss with the provider
- Relevant screenings for this stage
- Practical guidance needed at this point

Format as a numbered list (1-5), one question per line. Be concise and relevant.`;

      await generate({
        prompt,
        context: { week: currentWeek },
        onDelta: (text) => {
          if (abortRef.current) return;
          fullResponse += text;
        },
      });

      if (!abortRef.current) {
        const lines = fullResponse.split('\n');
        const questions: string[] = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          const match = trimmed.match(/^(?:\d+[.)\-]|\*|\-)\s*(.+)/);
          if (match && match[1] && match[1].length > 10) {
            questions.push(match[1].trim());
          }
        }
        
        const finalQuestions = questions.slice(0, 5);
        setSuggestedQuestions(finalQuestions);
        
        setFormData(prev => {
          const existing = new Set(prev.questions);
          const newQuestions = finalQuestions.filter(q => !existing.has(q));
          return {
            ...prev,
            questions: [...prev.questions, ...newQuestions]
          };
        });
      }
      
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const addQuestion = (question: string) => {
    if (!formData.questions.includes(question)) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, question]
      }));
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(a => new Date(a.appointment_date) >= now)
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments
      .filter(a => new Date(a.appointment_date) < now)
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const date = new Date(dateStr);
    const appointmentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((appointmentDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return t('common.today');
    if (diff === 1) return t('toolsInternal.appointmentReminder.tomorrow');
    if (diff < 0) return t('toolsInternal.appointmentReminder.passed');
    return t('toolsInternal.appointmentReminder.inDays', { count: diff });
  };

  const getAppointmentIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('checkup') || lowerTitle.includes('فحص') || lowerTitle.includes('ultrason')) {
      return APPOINTMENT_TYPES[1];
    }
    if (lowerTitle.includes('blood') || lowerTitle.includes('دم') || lowerTitle.includes('blut')) {
      return APPOINTMENT_TYPES[2];
    }
    if (lowerTitle.includes('glucose') || lowerTitle.includes('سكر') || lowerTitle.includes('glukose')) {
      return APPOINTMENT_TYPES[3];
    }
    if (lowerTitle.includes('checkup') || lowerTitle.includes('فحص') || lowerTitle.includes('kontroll')) {
      return APPOINTMENT_TYPES[0];
    }
    return APPOINTMENT_TYPES[4];
  };

  const canProceedStep0 = formData.title && formData.appointment_date;

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.appointmentReminder.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <ToolFrame
        title={t('toolsInternal.appointmentReminder.title')}
        subtitle={t('toolsInternal.appointmentReminder.subtitle')}
        mood="calm"
        toolId="appointment-reminder"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ToolFrame>
    );
  }

  const upcoming = getUpcomingAppointments();
  const past = getPastAppointments();

  // Step indicators for form
  const steps = [
    { icon: Calendar, label: t('toolsInternal.appointmentReminder.appointmentType', 'Type & Date') },
    { icon: FileText, label: t('toolsInternal.appointmentReminder.details', 'Details') },
    { icon: MessageSquare, label: t('toolsInternal.appointmentReminder.questionsForDoctor', 'Questions') },
  ];

  return (
    <ToolFrame
      title={t('toolsInternal.appointmentReminder.title')}
      subtitle={t('toolsInternal.appointmentReminder.subtitle')}
      mood="calm"
      toolId="appointment-reminder"
    >
      <div className="space-y-5">
        <WeekSlider week={currentWeek} onChange={setCurrentWeek} />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-2.5 text-center">
              <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" />
              <p className="text-sm font-bold text-primary">{upcoming.length}</p>
              <p className="text-[9px] text-muted-foreground line-clamp-1" style={{ overflowWrap: 'anywhere' }}>{t('toolsInternal.appointmentReminder.upcoming')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-2.5 text-center">
              <Bell className="w-3.5 h-3.5 mx-auto mb-0.5 text-accent-foreground" />
              <p className="text-sm font-bold text-foreground">{currentWeek}</p>
              <p className="text-[9px] text-muted-foreground line-clamp-1">{t('common.week')}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border/50">
            <CardContent className="p-2.5 text-center">
              <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 text-muted-foreground" />
              <p className="text-sm font-bold text-muted-foreground">{past.length}</p>
              <p className="text-[9px] text-muted-foreground line-clamp-1" style={{ overflowWrap: 'anywhere' }}>{t('toolsInternal.appointmentReminder.past')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        {!showForm && (
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-5 gap-2 text-sm whitespace-normal" style={{ overflowWrap: 'anywhere' }}
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-5 h-5" />
            {t('toolsInternal.appointmentReminder.addAppointment')}
          </Button>
        )}

        {/* ─── Multi-Step Form ─── */}
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="shadow-lg border-primary/20 overflow-hidden">
                {/* Step Indicator */}
                <div className="flex items-center gap-0 border-b border-border/50 bg-muted/20">
                  {steps.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = formStep === i;
                    const isDone = formStep > i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormStep(i)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold transition-all relative ${
                          isActive
                            ? 'text-primary bg-primary/5'
                            : isDone
                              ? 'text-primary/60'
                              : 'text-muted-foreground'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isDone
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isDone ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className="hidden sm:inline">{step.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="stepIndicator"
                            className="absolute bottom-0 inset-x-0 h-[2px] bg-primary"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <CardContent className="p-4">
                  <form onSubmit={(e) => { e.preventDefault(); if (formStep < 2) { setFormStep(f => f + 1); } else { handleSubmit(); } }}>
                    <AnimatePresence mode="wait">
                      {/* ── Step 0: Type & Date ── */}
                      {formStep === 0 && (
                        <motion.div
                          key="step0"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-semibold mb-2.5 text-foreground">
                              {t('toolsInternal.appointmentReminder.appointmentType')} *
                            </label>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {APPOINTMENT_TYPES.map(type => {
                                const Icon = type.icon;
                                const typeName = t(`toolsInternal.appointmentReminder.${type.key}`);
                                const isSelected = formData.title === typeName;
                                return (
                                  <button
                                    key={type.key}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, title: typeName }))}
                                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all border ${
                                      isSelected
                                        ? 'bg-primary/10 border-primary/30 text-primary ring-2 ring-primary/20'
                                        : 'bg-card border-border/40 hover:border-primary/20 hover:bg-muted/30'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/15' : type.color}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-start leading-tight">{typeName}</span>
                                  </button>
                                );
                              })}
                            </div>
                            <Input
                              placeholder={t('toolsInternal.appointmentReminder.customType')}
                              value={formData.title}
                              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="text-sm"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold mb-1.5 text-foreground">
                                {t('toolsInternal.appointmentReminder.date')} *
                              </label>
                              <Input
                                type="date"
                                value={formData.appointment_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                                className="text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1.5 text-foreground">
                                {t('toolsInternal.appointmentReminder.time')}
                              </label>
                              <TimePicker
                                value={formData.appointment_time}
                                onChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
                                placeholder={t('toolsInternal.appointmentReminder.selectTime')}
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            className="w-full"
                            disabled={!canProceedStep0}
                            onClick={() => setFormStep(1)}
                          >
                            {t('common.next', 'Next')}
                          </Button>
                        </motion.div>
                      )}

                      {/* ── Step 1: Details ── */}
                      {formStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-primary" />
                              {t('toolsInternal.appointmentReminder.doctorName')}
                            </label>
                            <Input
                              placeholder="Dr. ..."
                              value={formData.doctor_name}
                              onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {t('toolsInternal.appointmentReminder.location')}
                            </label>
                            <Input
                              placeholder={t('toolsInternal.appointmentReminder.locationPlaceholder')}
                              value={formData.location}
                              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                              className="text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground flex items-center gap-1.5">
                              <Clipboard className="w-3.5 h-3.5 text-primary" />
                              {t('toolsInternal.appointmentReminder.notes')}
                            </label>
                            <Textarea
                              placeholder={t('toolsInternal.appointmentReminder.notesPlaceholder')}
                              value={formData.notes}
                              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              rows={2}
                              className="text-sm"
                            />
                          </div>

                          {/* Notification hint */}
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                            <BellRing className="w-4 h-4 text-primary shrink-0" />
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {t('toolsInternal.appointmentReminder.notificationHint', 'Reminders will be sent automatically: 1 day before, the morning of, and 2 hours before your appointment.')}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setFormStep(0)}>
                              {t('common.back', 'Back')}
                            </Button>
                            <Button type="button" className="flex-1" onClick={() => setFormStep(2)}>
                              {t('common.next', 'Next')}
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Step 2: AI Questions ── */}
                      {formStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="text-center py-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                              <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              {t('toolsInternal.appointmentReminder.questionsForDoctor')}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {t('toolsInternal.appointmentReminder.questionsHint', 'AI can suggest relevant questions for week {{week}}', { week: currentWeek })}
                            </p>
                          </div>

                          {/* Generate button */}
                          <AIActionButton
                            onClick={generateQuestions}
                            isLoading={isGeneratingQuestions}
                            label={t('toolsInternal.appointmentReminder.aiSuggestions')}
                            loadingLabel={t('common.analyzing', 'Analyzing...')}
                            disabled={!formData.title}
                            icon={Sparkles}
                            variant="compact"
                            showUsage={true}
                            toolType="appointment-prep"
                            section="appointments"
                          />

                          {/* Selected Questions */}
                          {formData.questions.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold text-foreground/70 px-1">
                                {t('toolsInternal.appointmentReminder.yourQuestions', 'Your questions')} ({formData.questions.length})
                              </p>
                              {formData.questions.map((q, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-2 bg-primary/5 border border-primary/15 p-2.5 rounded-xl"
                                >
                                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span className="text-xs flex-1 leading-relaxed">{q}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => removeQuestion(i)}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* AI Disclaimer after generation */}
                          {suggestedQuestions.length > 0 && (
                            <AIResultDisclaimer />
                          )}
                          
                          {aiError && (
                            <div className="bg-destructive/10 text-destructive p-2.5 rounded-xl text-xs">
                              ⚠️ {aiError}
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setFormStep(1)}>
                              {t('common.back', 'Back')}
                            </Button>
                            <Button
                              type="button"
                              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                              disabled={isSaving}
                              onClick={() => handleSubmit()}
                            >
                              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                              {editingId ? t('common.save') : t('common.add')}
                              {formData.questions.length > 0 && (
                                <Badge variant="secondary" className="ms-1.5 text-[9px] h-4 px-1.5">
                                  {formData.questions.length}
                                </Badge>
                              )}
                            </Button>
                          </div>

                          {/* Skip questions option */}
                          {formData.questions.length === 0 && suggestedQuestions.length === 0 && !isGeneratingQuestions && (
                            <button
                              type="button"
                              onClick={() => handleSubmit()}
                              className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground py-1 transition-colors"
                            >
                              {t('toolsInternal.appointmentReminder.skipQuestions', 'Skip — save without questions')}
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-center text-[11px] text-muted-foreground hover:text-destructive mt-3 py-1 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Appointments */}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-foreground/70 flex items-center gap-1.5 px-1">
              <Bell className="w-3.5 h-3.5 text-primary" />
              {t('toolsInternal.appointmentReminder.upcoming')} ({upcoming.length})
            </h3>
            <div className="space-y-2">
              {upcoming.map(appointment => {
                const typeInfo = getAppointmentIcon(appointment.title);
                const Icon = typeInfo.icon;
                return (
                  <Card key={appointment.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-sm">{appointment.title}</h4>
                              <Badge variant="secondary" className="text-[10px] mt-0.5">
                                {getDaysUntil(appointment.appointment_date)}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(appointment)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(appointment.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {formatDate(appointment.appointment_date)}
                            </p>
                            {appointment.doctor_name && (
                              <p className="flex items-center gap-1.5">
                                <User className="w-3 h-3" />
                                {appointment.doctor_name}
                              </p>
                            )}
                            {appointment.location && (
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />
                                {appointment.location}
                              </p>
                            )}
                          </div>

                          {/* Questions saved with appointment */}
                          {appointment.questions && appointment.questions.length > 0 && (
                            <div className="mt-2.5 bg-primary/5 border border-primary/10 p-2.5 rounded-xl">
                              <p className="text-[10px] font-semibold text-primary mb-1.5 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {t('toolsInternal.appointmentReminder.yourQuestions')} ({appointment.questions.length})
                              </p>
                              <ul className="text-xs space-y-1">
                                {appointment.questions.map((q: string, i: number) => (
                                  <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {past.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowAllPast(prev => !prev)}
              className="w-full flex items-center justify-between px-1 group"
            >
              <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {t('toolsInternal.appointmentReminder.past')} ({past.length})
              </h3>
              {showAllPast ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {showAllPast && (
              <div className="space-y-1.5">
                {past.map(appointment => {
                  const typeInfo = getAppointmentIcon(appointment.title);
                  const Icon = typeInfo.icon;
                  return (
                    <Card key={appointment.id} className="shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-sm">{appointment.title}</h4>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatDate(appointment.appointment_date)}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(appointment)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(appointment.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            {appointment.doctor_name && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                <User className="w-2.5 h-2.5" />
                                {appointment.doctor_name}
                              </p>
                            )}
                            {appointment.questions && appointment.questions.length > 0 && (
                              <div className="mt-1.5 bg-muted/50 p-2 rounded-lg">
                                <ul className="text-[10px] space-y-0.5">
                                  {appointment.questions.map((q: string, i: number) => (
                                    <li key={i} className="text-foreground/70">• {q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && !showForm && (
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t('toolsInternal.appointmentReminder.noAppointments')}</p>
            <p className="text-xs text-muted-foreground/70">{t('toolsInternal.appointmentReminder.addFirst')}</p>
          </div>
        )}
      </div>
    </ToolFrame>
  );
};

export default SmartAppointmentReminder;
