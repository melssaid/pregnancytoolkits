import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Realistic blinking eye using pure canvas animation + floating heart bubbles.
 * Draws a natural eye that blinks periodically, with hearts bubbling out.
 */

function drawEye(ctx: CanvasRenderingContext2D, w: number, h: number, blink: number) {
  const cx = w / 2;
  const cy = h / 2;
  const eyeW = w * 0.46;
  const eyeH = h * 0.28;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);

  // ── Sclera (white of the eye) ──
  const openH = eyeH * (1 - blink);

  ctx.save();
  ctx.beginPath();
  // Upper lid curve
  ctx.moveTo(-eyeW, 0);
  ctx.quadraticCurveTo(0, -openH * 2, eyeW, 0);
  // Lower lid curve
  ctx.quadraticCurveTo(0, openH * 2, -eyeW, 0);
  ctx.closePath();
  ctx.clip();

  // White fill
  const scleraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeW * 0.9);
  scleraGrad.addColorStop(0, "#ffffff");
  scleraGrad.addColorStop(1, "#e8e0dc");
  ctx.fillStyle = scleraGrad;
  ctx.fill();

  // ── Iris ──
  const irisR = eyeH * 1;
  const irisGrad = ctx.createRadialGradient(0, 0, irisR * 0.15, 0, 0, irisR);
  irisGrad.addColorStop(0, "#6b4226");
  irisGrad.addColorStop(0.5, "#8b5e3c");
  irisGrad.addColorStop(0.8, "#5a3520");
  irisGrad.addColorStop(1, "#3e2012");
  ctx.beginPath();
  ctx.arc(0, 0, irisR, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // Iris texture lines
  ctx.strokeStyle = "rgba(40, 20, 5, 0.15)";
  ctx.lineWidth = 0.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * irisR * 0.3, Math.sin(a) * irisR * 0.3);
    ctx.lineTo(Math.cos(a) * irisR * 0.95, Math.sin(a) * irisR * 0.95);
    ctx.stroke();
  }

  // ── Pupil ──
  const pupilR = irisR * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0604";
  ctx.fill();

  // ── Shine reflections ──
  ctx.beginPath();
  ctx.arc(-irisR * 0.28, -irisR * 0.32, pupilR * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(irisR * 0.18, irisR * 0.22, pupilR * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fill();

  ctx.restore();

  // ── Eyelid outlines ──
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  // Upper lid
  ctx.beginPath();
  ctx.moveTo(-eyeW, 0);
  ctx.quadraticCurveTo(0, -openH * 2, eyeW, 0);
  ctx.stroke();

  // Lower lid
  ctx.beginPath();
  ctx.moveTo(-eyeW, 0);
  ctx.quadraticCurveTo(0, openH * 2, eyeW, 0);
  ctx.stroke();

  // ── Eyelashes (upper) ──
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  const lashCount = 7;
  for (let i = 0; i < lashCount; i++) {
    const t = (i + 1) / (lashCount + 1);
    const lx = -eyeW + t * eyeW * 2;
    const ly = -openH * 2 * (1 - Math.pow(2 * t - 1, 2)) * (1 - blink * 0.8);
    const angle = -Math.PI / 2 + (t - 0.5) * 0.6;
    const lashLen = 4 + Math.sin(t * Math.PI) * 4;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(
      lx + Math.cos(angle) * lashLen * (1 - blink),
      ly + Math.sin(angle) * lashLen * (1 - blink)
    );
    ctx.stroke();
  }

  ctx.restore();
}

const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;

    let startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Realistic blink: slow close, pause, slow open — every ~4s
      const blinkCycle = elapsed % 4.5;
      let blink = 0;
      if (blinkCycle > 3.8 && blinkCycle <= 4.1) {
        // Closing phase (0.3s) — smooth ease-in
        const t = (blinkCycle - 3.8) / 0.3;
        blink = t * t; // ease-in (accelerate)
      } else if (blinkCycle > 4.1 && blinkCycle <= 4.15) {
        // Closed pause (0.05s)
        blink = 1;
      } else if (blinkCycle > 4.15 && blinkCycle <= 4.5) {
        // Opening phase (0.35s) — smooth ease-out (slower open)
        const t = 1 - (blinkCycle - 4.15) / 0.35;
        blink = t * t; // ease-out (decelerate)
      }

      drawEye(ctx, size, size, blink);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Heart bubble configs
  const hearts = [
    { delay: 0.0, size: 45, startX: 2, driftX: -12, duration: 3.2 },
    { delay: 1.0, size: 32, startX: -4, driftX: 10, duration: 2.8 },
    { delay: 1.8, size: 38, startX: 5, driftX: -16, duration: 3.5 },
    { delay: 2.5, size: 28, startX: -6, driftX: 14, duration: 3.0 },
    { delay: 0.5, size: 35, startX: 0, driftX: -8, duration: 3.8 },
  ];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />

      {/* Floating heart bubbles */}
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: `${h.size}%`,
            height: `${h.size}%`,
            left: `calc(50% + ${h.startX}px)`,
            top: "25%",
          }}
          animate={{
            y: [0, -20, -48],
            x: [0, h.driftX * 0.4, h.driftX],
            opacity: [0, 0.95, 0],
            scale: [0.3, 1.15, 0.5],
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: "easeOut",
          }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
            <path
              d="M12 6 C10 2 5 2 5 6 C5 10 12 16 12 18 C12 16 19 10 19 6 C19 2 14 2 12 6Z"
              fill="white"
              fillOpacity="0.9"
            />
            <circle cx="8.5" cy="5.5" r="1" fill="white" opacity="0.6" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default DreamEyeIcon;
