import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Bell, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { format, isBefore, isToday, addDays } from 'date-fns';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    type: 'prenatal',
    notes: '',
    questions: [] as string[],
  });

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

  const upcomingAppointments = appointments.filter(a => !a.completed && !isBefore(new Date(a.date), new Date()));
  const pastAppointments = appointments.filter(a => a.completed || isBefore(new Date(a.date), new Date()));

  return (
    <ToolFrame
      title="Smart Appointment Reminder"
      subtitle="Never miss a prenatal appointment with AI-powered preparation"
      icon={Calendar}
      mood="calm"
      toolId="smart-appointment-reminder"
    >
      <div className="space-y-6">
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
              
              <div className="grid grid-cols-2 gap-3">
                {appointmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewAppointment(prev => ({ ...prev, type: type.id }))}
                    className={`p-3 rounded-lg text-left transition-all ${
                      newAppointment.type === type.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm ml-2">{type.label}</span>
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
                        <div className="flex gap-2">
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
