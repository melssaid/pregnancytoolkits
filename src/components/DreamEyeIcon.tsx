import { useState, useEffect } from "react";
import eyeOpen from "@/assets/icons/feminine-eye-open.png";
import eyeClosed from "@/assets/icons/feminine-eye-closed.png";

/**
 * Beautiful feminine eye that blinks slowly and naturally.
 * Uses AI-generated realistic eye illustrations with CSS transitions.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      // Random interval between 3-5 seconds for natural feel
      const delay = 3000 + Math.random() * 2000;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        // Eye stays closed for 300ms
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 350);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}>
      {/* Open eye */}
      <img
        src={eyeOpen}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out"
        style={{ opacity: isBlinking ? 0 : 1 }}
        draggable={false}
      />
      {/* Closed eye */}
      <img
        src={eyeClosed}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ease-in-out"
        style={{ opacity: isBlinking ? 1 : 0 }}
        draggable={false}
      />
    </div>
  );
};

export default DreamEyeIcon;
