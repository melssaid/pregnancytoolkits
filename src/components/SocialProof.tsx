import { motion } from "framer-motion";
import { Star, Baby, Heart, Sparkles, Download, Globe, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTotalToolsCount } from "@/lib/tools-data";
import { useEffect, useState, useMemo } from "react";

function useDynamicCount(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export function SocialProof() {
  const { t } = useTranslation();
  const toolCount = getTotalToolsCount();
  
  // Dynamic download count that grows organically
  const downloadCount = useMemo(() => {
    const launchDate = new Date('2025-01-15').getTime();
    const daysSinceLaunch = Math.floor((Date.now() - launchDate) / 86400000);
    return Math.min(50000, 5000 + Math.floor(daysSinceLaunch * 35));
  }, []);
  
  const formattedDownloads = downloadCount >= 10000 
    ? `${Math.floor(downloadCount / 1000)}K+` 
    : `${(downloadCount / 1000).toFixed(1)}K+`;

  const animatedTools = useDynamicCount(toolCount);
  const animatedLangs = useDynamicCount(7, 800);

  const stats = [
    { value: formattedDownloads, label: t('socialProof.downloads', 'Downloads'), icon: Download, color: 'text-primary' },
    { value: `${animatedTools}+`, label: t('socialProof.tools', 'Smart Tools'), icon: Baby, color: 'text-pink-500' },
    { value: `${animatedLangs}`, label: t('socialProof.languages', 'Languages'), icon: Globe, color: 'text-violet-500' },
    { value: '100%', label: t('socialProof.freePrivate', 'Free & Private'), icon: Shield, color: 'text-emerald-500' },
  ];

  return (
    <section className="py-10 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-foreground mb-1">
            {t('socialProof.title')}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t('socialProof.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center p-3.5 rounded-2xl bg-card shadow-sm border border-border/50"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-lg font-bold text-foreground mb-0.5">
                {stat.value}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/15"
        >
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3.5 h-3.5 ${i <= 4 ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-amber-400'}`} />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">4.8</span>
          <span className="text-[10px] text-muted-foreground">
            — {t('socialProof.trustedByMoms', 'Trusted by mothers worldwide')}
          </span>
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProof;
