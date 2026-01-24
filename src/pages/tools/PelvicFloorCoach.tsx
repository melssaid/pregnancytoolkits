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
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Pelvic Floor Coach</h2>
      <p>Reps: {rep}/10</p>
      
      <div style={{ 
        padding: "30px", 
        background: phase === "squeeze" ? "#e3f2fd" : phase === "hold" ? "#fff3e0" : "#f3e5f5",
        borderRadius: "10px",
        textAlign: "center",
        margin: "20px 0",
        fontSize: "24px",
        fontWeight: "bold"
      }}>
        {phase === "squeeze" && "Squeeze your pelvic floor"}
        {phase === "hold" && "Hold"}
        {phase === "relax" && "Relax"}
      </div>

      {!isRunning ? (
        <button onClick={startSession} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Start session
        </button>
      ) : (
        <button onClick={stopSession} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Stop session
        </button>
      )}

      <div style={{ fontSize: "12px", color: "gray", marginTop: "20px" }}>
        ⚠️ These exercises are for informational purposes only. Consult your healthcare provider before starting.
      </div>
    </div>
  );
}