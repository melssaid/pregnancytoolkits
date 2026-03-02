import { motion } from "framer-motion";
import { Footprints } from "lucide-react";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.div
    className={className + " flex items-center justify-center"}
    animate={{ scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
  >
    <Footprints className="w-full h-full text-white" strokeWidth={1.75} />
  </motion.div>
);

export default BabyFootprintsIcon;
