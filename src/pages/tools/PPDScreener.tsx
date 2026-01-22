import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle, Info, Phone } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const questions = [
  {
    id: 1,
    text: "I have been able to laugh and see the funny side of things",
    options: [
      { value: 0, label: "As much as I always could" },
      { value: 1, label: "Not quite so much now" },
      { value: 2, label: "Definitely not so much now" },
      { value: 3, label: "Not at all" },
    ],
  },
  {
    id: 2,
    text: "I have looked forward with enjoyment to things",
    options: [
      { value: 0, label: "As much as I ever did" },
      { value: 1, label: "Rather less than I used to" },
      { value: 2, label: "Definitely less than I used to" },
      { value: 3, label: "Hardly at all" },
    ],
  },
  {
    id: 3,
    text: "I have blamed myself unnecessarily when things went wrong",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, some of the time" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: 4,
    text: "I have been anxious or worried for no good reason",
    options: [
      { value: 0, label: "No, not at all" },
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Yes, sometimes" },
      { value: 3, label: "Yes, very often" },
    ],
  },
  {
    id: 5,
    text: "I have felt scared or panicky for no very good reason",
    options: [
      { value: 3, label: "Yes, quite a lot" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "No, not much" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: 6,
    text: "Things have been getting on top of me",
    options: [
      { value: 3, label: "Yes, most of the time I haven't been able to cope at all" },
      { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
      { value: 1, label: "No, most of the time I have coped quite well" },
      { value: 0, label: "No, I have been coping as well as ever" },
    ],
  },
  {
    id: 7,
    text: "I have been so unhappy that I have had difficulty sleeping",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: 8,
    text: "I have felt sad or miserable",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" },
    ],
  },
  {
    id: 9,
    text: "I have been so unhappy that I have been crying",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Only occasionally" },
      { value: 0, label: "No, never" },
    ],
  },
  {
    id: 10,
    text: "The thought of harming myself has occurred to me",
    options: [
      { value: 3, label: "Yes, quite often" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Hardly ever" },
      { value: 0, label: "Never" },
    ],
  },
];

export default function PPDScreener() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const getResults = () => {
    const score = calculateScore();
    if (score <= 8) {
      return {
        level: "low",
        title: "Low likelihood of depression",
        description: "Your responses suggest you are coping well. Continue to monitor your mood and reach out if anything changes.",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
      };
    } else if (score <= 12) {
      return {
        level: "moderate",
        title: "Possible depression",
        description: "Your score suggests possible depression. Consider discussing these feelings with your healthcare provider.",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
      };
    } else {
      return {
        level: "high",
        title: "Likely depression",
        description: "Your score indicates likely depression. Please speak with your healthcare provider as soon as possible for proper evaluation and support.",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20",
      };
    }
  };

  const allAnswered = Object.keys(answers).length === 10;
  const score = calculateScore();
  const results = getResults();

  // Check for self-harm concern
  const selfHarmConcern = answers[10] !== undefined && answers[10] >= 2;

  return (
    <Layout title="Postpartum Depression Screener" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {selfHarmConcern && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Please Reach Out for Support</p>
                    <p className="text-sm text-foreground mt-1">
                      If you're having thoughts of harming yourself, please contact:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• National Suicide Prevention Lifeline: <strong>988</strong></li>
                      <li>• Postpartum Support International: <strong>1-800-944-4773</strong></li>
                      <li>• Your healthcare provider or local emergency services</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Edinburgh Postnatal Depression Scale (EPDS)
                </CardTitle>
                <CardDescription>
                  Please select the answer that comes closest to how you have felt in the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showResults ? (
                  <div className="space-y-8">
                    {questions.map((q, index) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="space-y-3"
                      >
                        <p className="font-medium text-foreground">
                          {index + 1}. {q.text}
                        </p>
                        <RadioGroup
                          value={answers[q.id]?.toString()}
                          onValueChange={(val) => handleAnswer(q.id, parseInt(val))}
                        >
                          {q.options.map((option) => (
                            <div key={option.value} className="flex items-center space-x-3">
                              <RadioGroupItem
                                value={option.value.toString()}
                                id={`q${q.id}-${option.value}`}
                              />
                              <Label
                                htmlFor={`q${q.id}-${option.value}`}
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </motion.div>
                    ))}

                    <Button
                      onClick={() => setShowResults(true)}
                      disabled={!allAnswered}
                      className="w-full"
                    >
                      View Results
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                      <p className="text-5xl font-bold text-foreground">{score}</p>
                      <p className="text-sm text-muted-foreground mt-1">out of 30</p>
                    </div>

                    <div className={`rounded-lg p-4 ${results.bgColor} border ${results.borderColor}`}>
                      <div className="flex items-start gap-3">
                        {results.level === "low" ? (
                          <CheckCircle className={`h-5 w-5 ${results.color} flex-shrink-0 mt-0.5`} />
                        ) : (
                          <AlertTriangle className={`h-5 w-5 ${results.color} flex-shrink-0 mt-0.5`} />
                        )}
                        <div>
                          <p className={`font-semibold ${results.color}`}>{results.title}</p>
                          <p className="text-sm text-foreground mt-1">{results.description}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowResults(false);
                        setAnswers({});
                      }}
                      className="w-full"
                    >
                      Take Again
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This screening tool is not a diagnostic instrument. A high score does not 
                mean you have depression, and a low score doesn't mean you don't. Always 
                discuss your feelings with a healthcare professional.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
