import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Bell, MapPin, User, Clock, Trash2, Edit2, Loader2, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AppointmentService, UserProfileService } from '@/services/supabaseServices';
import { AIService } from '@/services/aiService';
import { TimePicker } from '@/components/ui/time-picker';

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

const SmartAppointmentReminder: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
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
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      const data = await AppointmentService.getAll();
      setAppointments(data);
      
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast({
        title: 'Loading Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.appointment_date) {
      toast({
        title: 'Error',
        description: 'Please fill in the required fields',
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
        toast({ title: 'Updated! ✅' });
      } else {
        const newAppointment = await AppointmentService.add(appointmentData);
        setAppointments(prev => [...prev, newAppointment]);
        toast({ title: 'Added! ✅' });
      }

      resetForm();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await AppointmentService.delete(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Deleted' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    const date = new Date(appointment.appointment_date);
    setFormData({
      title: appointment.title,
      doctor_name: appointment.doctor_name || '',
      location: appointment.location || '',
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: date.toTimeString().slice(0, 5),
      notes: appointment.notes || '',
      questions: appointment.questions || []
    });
    setEditingId(appointment.id);
    setShowForm(true);
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
  };

  const generateQuestions = async () => {
    try {
      setIsGeneratingQuestions(true);
      
      const response = await AIService.ask(
        `I am in week ${currentWeek} of pregnancy and I have a doctor's appointment titled: ${formData.title}. 
        Suggest 5 important questions I should ask my doctor. Write each question on a separate line.`,
        'pregnancy-assistant'
      );
      
      const questions = response.content
        .split('\n')
        .filter(q => q.trim().length > 5)
        .slice(0, 5);
      
      setSuggestedQuestions(questions);
      
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Passed';
    return `In ${diff} days`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  const upcoming = getUpcomingAppointments();
  const past = getPastAppointments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Calendar className="w-8 h-8" />
              📅 My Medical Appointments
            </CardTitle>
            <p className="text-blue-100">
              Week {currentWeek} - Organize your appointments with AI-suggested questions
            </p>
          </CardHeader>
        </Card>

        {/* Add Button */}
        {!showForm && (
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 text-lg"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            Add New Appointment
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Appointment' : 'New Appointment'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Appointment Type *</label>
                  <Input
                    placeholder="e.g., Regular checkup, Ultrasound..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date *</label>
                    <Input
                      type="date"
                      value={formData.appointment_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <TimePicker
                      value={formData.appointment_time}
                      onChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}
                      placeholder="Select time"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Doctor's Name</label>
                  <Input
                    placeholder="Dr. ..."
                    value={formData.doctor_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    placeholder="Hospital or clinic name"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* AI Questions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Questions for Doctor
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateQuestions}
                      disabled={isGeneratingQuestions || !formData.title}
                    >
                      {isGeneratingQuestions ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        '✨'
                      )}
                      AI Suggestions
                    </Button>
                  </div>

                  {/* Selected Questions */}
                  {formData.questions.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.questions.map((q, i) => (
                        <div key={i} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm flex-1">{q}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeQuestion(i)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Questions */}
                  {suggestedQuestions.length > 0 && (
                    <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">🤖 Suggestions:</p>
                      {suggestedQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-purple-100 p-2 rounded transition-colors"
                          onClick={() => addQuestion(q)}
                        >
                          <Plus className="w-4 h-4 text-purple-500" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingId ? 'Save Changes' : 'Add Appointment'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Appointments */}
        {upcoming.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Upcoming Appointments ({upcoming.length})
            </h2>
            {upcoming.map(appointment => (
              <Card key={appointment.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{appointment.title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {getDaysUntil(appointment.appointment_date)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(appointment.appointment_date)}
                        </p>
                        {appointment.doctor_name && (
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {appointment.doctor_name}
                          </p>
                        )}
                        {appointment.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {appointment.location}
                          </p>
                        )}
                      </div>

                      {appointment.questions && appointment.questions.length > 0 && (
                        <div className="mt-3 bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 mb-1">Your Questions:</p>
                          <ul className="text-sm space-y-1">
                            {appointment.questions.slice(0, 3).map((q: string, i: number) => (
                              <li key={i} className="text-gray-700">• {q}</li>
                            ))}
                            {appointment.questions.length > 3 && (
                              <li className="text-gray-400">+{appointment.questions.length - 3} more questions</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Past Appointments */}
        {past.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-500 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Past Appointments ({past.length})
            </h2>
            {past.slice(0, 3).map(appointment => (
              <Card key={appointment.id} className="shadow opacity-70">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{appointment.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(appointment.appointment_date)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(appointment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {appointments.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No appointments scheduled</p>
            <p className="text-sm">Add your next appointment now!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAppointmentReminder;
