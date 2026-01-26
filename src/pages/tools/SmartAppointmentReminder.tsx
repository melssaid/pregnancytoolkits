import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Bell, Plus, Trash2, CheckCircle, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { format, isBefore, isToday, addDays } from 'date-fns';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  questions: string[];
  completed: boolean;
}

const appointmentTypes = [
  { id: 'prenatal', label: 'Prenatal Checkup', icon: '🏥' },
  { id: 'ultrasound', label: 'Ultrasound', icon: '📸' },
  { id: 'glucose', label: 'Glucose Test', icon: '🩸' },
  { id: 'specialist', label: 'Specialist Visit', icon: '👨‍⚕️' },
  { id: 'lab', label: 'Lab Work', icon: '🧪' },
  { id: 'other', label: 'Other', icon: '📋' },
];

const suggestedQuestions = [
  'What symptoms should I watch for?',
  'Are my weight and blood pressure normal?',
  'How is the baby developing?',
  'Should I adjust my diet or exercise?',
  'When should I schedule my next appointment?',
  'Are there any warning signs I should know about?',
];

export default function SmartAppointmentReminder() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [showAIPrep, setShowAIPrep] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    type: 'prenatal',
    notes: '',
    questions: [] as string[],
  });

  const { streamChat, isLoading, error } = usePregnancyAI();

  useEffect(() => {
    const saved = localStorage.getItem('pregnancyAppointments');
    if (saved) setAppointments(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('pregnancyAppointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = () => {
    if (!newAppointment.title || !newAppointment.date) return;
    
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...newAppointment,
      completed: false,
    };
    
    setAppointments([...appointments, appointment].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    setNewAppointment({ title: '', date: '', time: '', type: 'prenatal', notes: '', questions: [] });
    setShowForm(false);
  };

  const toggleQuestion = (question: string) => {
    setNewAppointment(prev => ({
      ...prev,
      questions: prev.questions.includes(question)
        ? prev.questions.filter(q => q !== question)
        : [...prev.questions, question],
    }));
  };

  const markComplete = (id: string) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, completed: true } : a
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const getAIAppointmentPrep = async (apt: Appointment) => {
    setSelectedAppointment(apt);
    setShowAIPrep(true);
    setAiResponse('');

    const aptType = appointmentTypes.find(t => t.id === apt.type);

    await streamChat({
      type: 'appointment-prep' as any,
      messages: [
        {
          role: 'user',
          content: `I have a ${aptType?.label || apt.type} appointment coming up on ${apt.date}. I'm currently at week ${currentWeek} of my pregnancy. The appointment is titled "${apt.title}". My prepared questions are: ${apt.questions.join(', ') || 'none yet'}. Please help me prepare for this appointment with personalized questions and tips.`
        }
      ],
      context: { week: currentWeek },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  const upcomingAppointments = appointments.filter(a => !a.completed && !isBefore(new Date(a.date), new Date()));
  const pastAppointments = appointments.filter(a => a.completed || isBefore(new Date(a.date), new Date()));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Smart Appointment Reminder"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Smart Appointment Reminder"
      subtitle="Never miss a prenatal appointment with AI-powered preparation"
      icon={Calendar}
      mood="calm"
      toolId="smart-appointment-reminder"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <Card>
          <CardContent className="p-4">
            <label className="block text-sm font-medium mb-2">Current Pregnancy Week</label>
            <Input
              type="number"
              min={1}
              max={42}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Add Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Appointment
          </Button>
        )}

        {/* New Appointment Form */}
        {showForm && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">New Appointment</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {appointmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewAppointment(prev => ({ ...prev, type: type.id }))}
                    className={`p-2 rounded-lg text-left transition-all text-sm ${
                      newAppointment.type === type.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span className="ml-1">{type.label}</span>
                  </button>
                ))}
              </div>

              <Input
                placeholder="Appointment Title"
                value={newAppointment.title}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Questions to Ask</label>
                <div className="space-y-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => toggleQuestion(q)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-all ${
                        newAppointment.questions.includes(q)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      {newAppointment.questions.includes(q) ? '✓ ' : '+ '}{q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={addAppointment} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Preparation */}
        {showAIPrep && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Appointment Prep</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAIPrep(false)}>
                  Close
                </Button>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                Upcoming Appointments
              </h3>
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => {
                  const aptType = appointmentTypes.find(t => t.id === apt.type);
                  const isUpcoming = isToday(new Date(apt.date)) || isBefore(new Date(apt.date), addDays(new Date(), 3));
                  
                  return (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-lg ${
                        isUpcoming ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{aptType?.icon}</span>
                          <div>
                            <p className="font-medium">{apt.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(apt.date), 'EEE, MMM d')} {apt.time && `at ${apt.time}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => getAIAppointmentPrep(apt)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            {isLoading && selectedAppointment?.id === apt.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            ) : (
                              <Brain className="w-4 h-4 text-primary" />
                            )}
                          </button>
                          <button
                            onClick={() => markComplete(apt.id)}
                            className="p-1.5 rounded-lg hover:bg-background transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => deleteAppointment(apt.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      
                      {apt.questions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Questions to Ask:</p>
                          <ul className="text-sm space-y-1">
                            {apt.questions.map((q, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {appointments.length === 0 && !showForm && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Appointments Yet</h3>
              <p className="text-sm text-muted-foreground">
                Add your prenatal appointments to stay organized and prepared.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                This tool helps you organize appointments but does not provide medical reminders. 
                Always follow your healthcare provider's schedule and recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
