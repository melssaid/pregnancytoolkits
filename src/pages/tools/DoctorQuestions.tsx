import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Plus, Trash2, Check, Stethoscope, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { format } from "date-fns";

interface Question {
  id: string;
  text: string;
  answered: boolean;
  answer?: string;
  category: string;
  priority: "high" | "medium" | "low";
}

interface Visit {
  id: string;
  date: string;
  week: number;
  questions: Question[];
  notes?: string;
}

const STORAGE_KEY = "doctor-questions-data";

const suggestedQuestions = [
  { text: "What tests are needed at this stage?", category: "checkups", priority: "high" as const },
  { text: "Is baby's growth on track?", category: "development", priority: "high" as const },
  { text: "What symptoms require immediate attention?", category: "warning", priority: "high" as const },
  { text: "Can I continue exercising?", category: "lifestyle", priority: "medium" as const },
  { text: "What foods should I avoid?", category: "nutrition", priority: "medium" as const },
  { text: "Are my medications safe during pregnancy?", category: "medications", priority: "high" as const },
  { text: "When should I register for birth classes?", category: "preparation", priority: "low" as const },
  { text: "What are signs of early labor?", category: "warning", priority: "high" as const },
];

const categoryLabels = {
  checkups: { label: "Checkups", icon: "🔬" },
  development: { label: "Baby Growth", icon: "👶" },
  warning: { label: "Warning Signs", icon: "⚠️" },
  lifestyle: { label: "Lifestyle", icon: "🏃" },
  nutrition: { label: "Nutrition", icon: "🥗" },
  medications: { label: "Medications", icon: "💊" },
  preparation: { label: "Preparation", icon: "📋" },
  other: { label: "Other", icon: "❓" },
};

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const DoctorQuestions = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("doctor-questions");
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setVisits(data.visits || []);
      if (data.currentVisit) {
        setCurrentVisit(data.currentVisit);
      }
    }
  }, []);

  const saveData = (newVisits: Visit[], current: Visit | null) => {
    setVisits(newVisits);
    setCurrentVisit(current);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: newVisits, currentVisit: current }));
  };

  const startNewVisit = () => {
    const visit: Visit = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: 20,
      questions: [],
    };
    setCurrentVisit(visit);
    saveData(visits, visit);
    trackAction("visit_started");
  };

  const addQuestion = (text: string, category: string, priority: "high" | "medium" | "low") => {
    if (!currentVisit || !text.trim()) return;
    
    const question: Question = {
      id: Date.now().toString(),
      text: text.trim(),
      answered: false,
      category,
      priority,
    };
    
    const updatedVisit = {
      ...currentVisit,
      questions: [...currentVisit.questions, question],
    };
    
    saveData(visits, updatedVisit);
    setNewQuestion("");
    trackAction("question_added", { category, priority });
  };

  const toggleAnswered = (questionId: string) => {
    if (!currentVisit) return;
    
    const updatedQuestions = currentVisit.questions.map(q =>
      q.id === questionId ? { ...q, answered: !q.answered } : q
    );
    
    saveData(visits, { ...currentVisit, questions: updatedQuestions });
  };

  const deleteQuestion = (questionId: string) => {
    if (!currentVisit) return;
    
    const updatedQuestions = currentVisit.questions.filter(q => q.id !== questionId);
    saveData(visits, { ...currentVisit, questions: updatedQuestions });
  };

  const completeVisit = () => {
    if (!currentVisit) return;
    
    const completedVisit = { ...currentVisit, date: new Date().toISOString() };
    saveData([completedVisit, ...visits], null);
    trackAction("visit_completed", { questionsCount: currentVisit.questions.length });
  };

  const unansweredCount = currentVisit?.questions.filter(q => !q.answered).length || 0;

  return (
    <ToolFrame
      title={t('tools.doctorQuestions.title')}
      subtitle={t('tools.doctorQuestions.description')}
      icon={MessageCircle}
      mood="calm"
    >
      <div className="space-y-6">
        {!currentVisit ? (
          <>
            {/* Start New Visit */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={startNewVisit}
                size="lg"
                className="w-full py-8 text-lg bg-gradient-to-r from-primary to-pink-500"
              >
                <Calendar className="h-6 w-6 mr-3" />
                Start New Visit
              </Button>
            </motion.div>

            {/* Suggested Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a new visit to add these questions to your list
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 5).map((q, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 text-sm">
                      {q.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Past Visits */}
            {visits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Past Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {visits.slice(0, 5).map((visit) => (
                      <div key={visit.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div>
                          <p className="font-medium">Week {visit.week}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(visit.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className="text-sm text-primary">
                          {visit.questions.length} questions
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Current Visit Header */}
            <Card className="bg-gradient-to-r from-primary/10 to-pink-100/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Doctor Visit</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Week:</span>
                      <Input
                        type="number"
                        value={currentVisit.week}
                        onChange={(e) => saveData(visits, { ...currentVisit, week: Number(e.target.value) })}
                        className="w-16 h-8"
                        min={1}
                        max={42}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">{unansweredCount}</span>
                    <p className="text-xs text-muted-foreground">questions left</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Question */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion(newQuestion, selectedCategory, selectedPriority)}
                />
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryLabels).slice(0, 4).map(([key, { label, icon }]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                    >
                      {icon} {label}
                    </Button>
                  ))}
                </div>
                <Button 
                  onClick={() => addQuestion(newQuestion, selectedCategory, selectedPriority)}
                  disabled={!newQuestion.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Suggested Questions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Suggested - Tap to add</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions
                    .filter(sq => !currentVisit.questions.some(q => q.text === sq.text))
                    .slice(0, 4)
                    .map((sq, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => addQuestion(sq.text, sq.category, sq.priority)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {sq.text.slice(0, 30)}...
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            {currentVisit.questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Questions ({currentVisit.questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {currentVisit.questions.map((question, index) => {
                      const catInfo = categoryLabels[question.category as keyof typeof categoryLabels] || categoryLabels.other;
                      
                      return (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-xl border-2 ${
                            question.answered 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-muted'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={question.answered}
                              onCheckedChange={() => toggleAnswered(question.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={question.answered ? 'line-through text-muted-foreground' : ''}>
                                {question.text}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                  {catInfo.icon} {catInfo.label}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[question.priority]}`}>
                                  {question.priority === 'high' ? 'Important' : question.priority === 'medium' ? 'Medium' : 'Normal'}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Complete Visit */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => saveData(visits, null)}
                className="flex-1"
              >
                Cancel Visit
              </Button>
              <Button
                onClick={completeVisit}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Complete Visit
              </Button>
            </div>
          </>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Doctor Visit Tips</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Prepare your questions before the visit</li>
                  <li>Write down the doctor's answers immediately</li>
                  <li>Don't hesitate to ask for clarification</li>
                  <li>Bring your partner if possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default DoctorQuestions;
