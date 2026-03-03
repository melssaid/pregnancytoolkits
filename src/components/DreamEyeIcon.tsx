import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Feminine blinking eye with eyeliner, long curved lashes, eyeshadow & heart bubbles.
 */

function drawFeminineEye(ctx: CanvasRenderingContext2D, w: number, h: number, blink: number) {
  const cx = w / 2;
  const cy = h / 2;
  const eyeW = w * 0.44;
  const eyeH = h * 0.26;
  const openH = eyeH * (1 - blink);

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);

  // ── Eyeshadow glow (behind the eye) ──
  if (blink < 0.8) {
    const shadowGrad = ctx.createRadialGradient(0, -openH * 0.6, 0, 0, -openH * 0.4, eyeW * 1.2);
    shadowGrad.addColorStop(0, "rgba(180, 120, 160, 0.25)");
    shadowGrad.addColorStop(0.5, "rgba(140, 90, 130, 0.12)");
    shadowGrad.addColorStop(1, "rgba(140, 90, 130, 0)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(0, -openH * 0.5, eyeW * 1.1, openH * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Eye shape clip ──
  ctx.save();
  ctx.beginPath();
  // Almond shape — slightly lifted outer corner (feminine cat-eye)
  ctx.moveTo(-eyeW, 2);
  ctx.bezierCurveTo(-eyeW * 0.5, -openH * 2.2, eyeW * 0.5, -openH * 2.4, eyeW + 2, -3);
  // Lower lid — softer curve
  ctx.bezierCurveTo(eyeW * 0.5, openH * 1.6, -eyeW * 0.5, openH * 1.8, -eyeW, 2);
  ctx.closePath();
  ctx.clip();

  // Sclera
  const scleraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, eyeW * 0.85);
  scleraGrad.addColorStop(0, "#fffaf8");
  scleraGrad.addColorStop(0.8, "#f0e6e0");
  scleraGrad.addColorStop(1, "#e0d4cc");
  ctx.fillStyle = scleraGrad;
  ctx.fillRect(-eyeW - 5, -eyeH * 3, eyeW * 2 + 10, eyeH * 6);

  // ── Iris — dark brown ──
  const irisR = eyeH * 0.95;

  // Iris outer circle border for roundness
  ctx.beginPath();
  ctx.arc(0, 0, irisR + 0.8, 0, Math.PI * 2);
  ctx.fillStyle = "#1a0e08";
  ctx.fill();

  // Iris — dark brown gradient
  const irisGrad = ctx.createRadialGradient(0, 0, irisR * 0.08, 0, 0, irisR);
  irisGrad.addColorStop(0, "#5c3a1e");
  irisGrad.addColorStop(0.25, "#4a2c14");
  irisGrad.addColorStop(0.5, "#3d2210");
  irisGrad.addColorStop(0.75, "#2e1a0c");
  irisGrad.addColorStop(1, "#1a0e08");
  ctx.beginPath();
  ctx.arc(0, 0, irisR, 0, Math.PI * 2);
  ctx.fillStyle = irisGrad;
  ctx.fill();

  // Iris ring — strong dark border
  ctx.strokeStyle = "rgba(10, 5, 2, 0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Iris texture — fine radial lines
  ctx.strokeStyle = "rgba(80, 50, 25, 0.12)";
  ctx.lineWidth = 0.4;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * irisR * 0.22, Math.sin(a) * irisR * 0.22);
    ctx.lineTo(Math.cos(a) * irisR * 0.9, Math.sin(a) * irisR * 0.9);
    ctx.stroke();
  }

  // Inner iris warm glow
  const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, irisR * 0.4);
  innerGlow.addColorStop(0, "rgba(140, 90, 40, 0.2)");
  innerGlow.addColorStop(1, "rgba(140, 90, 40, 0)");
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, irisR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // ── Pupil ──
  const pupilR = irisR * 0.32;
  ctx.beginPath();
  ctx.arc(0, 0, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = "#080604";
  ctx.fill();

  // ── Shine reflections (larger, more glossy — feminine) ──
  ctx.beginPath();
  ctx.arc(-irisR * 0.25, -irisR * 0.3, pupilR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(irisR * 0.2, irisR * 0.18, pupilR * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fill();

  // Tiny sparkle
  ctx.beginPath();
  ctx.arc(-irisR * 0.1, -irisR * 0.45, pupilR * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();

  ctx.restore();

  // ── Eyeliner — thick upper lid (cat-eye wing) ──
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Upper eyeliner (thick, dramatic)
  ctx.beginPath();
  ctx.moveTo(-eyeW, 2);
  ctx.bezierCurveTo(-eyeW * 0.5, -openH * 2.2, eyeW * 0.5, -openH * 2.4, eyeW + 2, -3);
  // Wing extension
  ctx.lineTo(eyeW + 5, -6);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Lower lid — thinner, softer
  ctx.beginPath();
  ctx.moveTo(-eyeW, 2);
  ctx.bezierCurveTo(-eyeW * 0.5, openH * 1.8, eyeW * 0.5, openH * 1.6, eyeW + 2, -3);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // ── Eyelashes — long, curved, feminine ──
  const drawLash = (startX: number, startY: number, angle: number, len: number, curve: number, thickness: number) => {
    const openFactor = 1 - blink;
    const effLen = len * openFactor;
    if (effLen < 1) return;

    const endX = startX + Math.cos(angle) * effLen;
    const endY = startY + Math.sin(angle) * effLen;
    const cpX = startX + Math.cos(angle + curve) * effLen * 0.6;
    const cpY = startY + Math.sin(angle + curve) * effLen * 0.6;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = thickness;
    ctx.stroke();
  };

  // Upper lashes — long and curved
  const upperLashCount = 9;
  for (let i = 0; i < upperLashCount; i++) {
    const t = (i + 0.5) / upperLashCount;
    const x = -eyeW + t * (eyeW * 2 + 2);
    const y = -openH * 2 * (1 - Math.pow(2 * t - 1, 2)) * (1 - blink * 0.9) + (t > 0.8 ? -2 : 0);
    const baseAngle = -Math.PI / 2 + (t - 0.5) * 0.7;
    const len = 5 + Math.sin(t * Math.PI) * 5 + (t > 0.7 ? 3 : 0); // longer outer lashes
    const curve = t < 0.5 ? 0.4 : -0.4; // curl direction
    const thickness = 0.8 + Math.sin(t * Math.PI) * 0.4;
    drawLash(x, y, baseAngle, len, curve, thickness);
  }

  // Lower lashes — shorter, delicate
  const lowerLashCount = 5;
  for (let i = 0; i < lowerLashCount; i++) {
    const t = (i + 1) / (lowerLashCount + 1);
    const x = -eyeW * 0.7 + t * eyeW * 1.4;
    const y = openH * 1.7 * (1 - Math.pow(2 * t - 1, 2)) * (1 - blink * 0.8);
    const angle = Math.PI / 2 + (t - 0.5) * 0.4;
    drawLash(x, y, angle, 3 + Math.sin(t * Math.PI) * 2, t < 0.5 ? -0.3 : 0.3, 0.6);
  }

  // ── Eyebrow hint — soft arch ──
  if (blink < 0.5) {
    ctx.beginPath();
    ctx.moveTo(-eyeW * 0.8, -eyeH * 2.2);
    ctx.quadraticCurveTo(0, -eyeH * 3.0, eyeW * 0.9, -eyeH * 2.0);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
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

    const animate = (time: number) => {
      const elapsed = time / 1000;
      const blinkCycle = elapsed % 4.5;
      let blink = 0;
      if (blinkCycle > 3.8 && blinkCycle <= 4.1) {
        const t = (blinkCycle - 3.8) / 0.3;
        blink = t * t;
      } else if (blinkCycle > 4.1 && blinkCycle <= 4.15) {
        blink = 1;
      } else if (blinkCycle > 4.15 && blinkCycle <= 4.5) {
        const t = 1 - (blinkCycle - 4.15) / 0.35;
        blink = t * t;
      }
      drawFeminineEye(ctx, size, size, blink);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const hearts = [
    { delay: 0.0, size: 42, startX: 2, driftX: -12, duration: 3.2 },
    { delay: 1.0, size: 30, startX: -4, driftX: 10, duration: 2.8 },
    { delay: 1.8, size: 36, startX: 5, driftX: -16, duration: 3.5 },
    { delay: 2.5, size: 26, startX: -6, driftX: 14, duration: 3.0 },
    { delay: 0.5, size: 32, startX: 0, driftX: -8, duration: 3.8 },
  ];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "auto" }}
      />

      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            width: `${h.size}%`,
            height: `${h.size}%`,
            left: `calc(50% + ${h.startX}px)`,
            top: "20%",
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
