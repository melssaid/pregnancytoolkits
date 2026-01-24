import { useState, useEffect } from "react";

export function PelvicFloorCoach() {
  const [phase, setPhase] = useState<"squeeze" | "hold" | "relax">("squeeze");
  const [rep, setRep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || rep >= 10) return;

    const phases = [
      { name: "squeeze" as const, duration: 3000 },
      { name: "hold" as const, duration: 8000 },
      { name: "relax" as const, duration: 5000 },
    ];

    const currentPhase = phases.find(p => p.name === phase);
    if (!currentPhase) return;

    const timer = setTimeout(() => {
      const nextIndex = (phases.indexOf(currentPhase) + 1) % phases.length;
      const nextPhase = phases[nextIndex];
      
      if (nextPhase.name === "squeeze" && phase === "relax") {
        setRep(r => r + 1);
      }
      
      setPhase(nextPhase.name);
    }, currentPhase.duration);

    return () => clearTimeout(timer);
  }, [phase, isRunning, rep]);

  const startSession = () => {
    setRep(0);
    setPhase("squeeze");
    setIsRunning(true);
  };

  const stopSession = () => {
    setIsRunning(false);
  };

  return (
    <div dir="rtl" style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>مدرب تمارين الحوض</h2>
      <p>التكرار: {rep}/10</p>
      
      <div style={{ 
        padding: "30px", 
        background: phase === "squeeze" ? "#e3f2fd" : phase === "hold" ? "#fff3e0" : "#f3e5f5",
        borderRadius: "10px",
        textAlign: "center",
        margin: "20px 0",
        fontSize: "24px",
        fontWeight: "bold"
      }}>
        {phase === "squeeze" && "اعصري عضلات الحوض"}
        {phase === "hold" && "استمري في الضغط"}
        {phase === "relax" && "استرخي"}
      </div>

      {!isRunning ? (
        <button onClick={startSession} style={{ padding: "10px 20px", fontSize: "16px" }}>
          ابدئي الجلسة
        </button>
      ) : (
        <button onClick={stopSession} style={{ padding: "10px 20px", fontSize: "16px" }}>
          أوقفي الجلسة
        </button>
      )}

      <div style={{ fontSize: "12px", color: "gray", marginTop: "20px" }}>
        ⚠️ هذه التمارين للأغراض الإعلامية. استشيري طبيبك قبل البدء.
      </div>
    </div>
  );
}