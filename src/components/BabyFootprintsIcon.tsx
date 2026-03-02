import { motion } from "framer-motion";
import babyFootprints from "@/assets/baby-footprints.png";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <motion.img
      src={babyFootprints}
      alt="Baby footprints"
      className={className}
      style={{ objectFit: "contain" }}
      animate={{
        scale: [1, 1.06, 1],
        rotate: [0, -3, 3, 0],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    />
  );
};

export default BabyFootprintsIcon;
