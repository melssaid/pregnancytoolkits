import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface KickSession {
  date: string;
  kicks: number;
  duration: number;
  startTime: string;
}

interface PatternVisualizerProps {
  sessions: KickSession[];
}

export const KickPatternVisualizer: React.FC<PatternVisualizerProps> = ({ sessions }) => {
  const { t, i18n } = useTranslation();
  const recentSessions = sessions.slice(0, 7).reverse();
  
  if (recentSessions.length < 2) {
    return (
      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('kickPattern.recordAtLeast')}
        </p>
      </div>
    );
  }

  const maxDuration = Math.max(...recentSessions.map(s => s.duration), 60);
  const avgDuration = recentSessions.reduce((acc, s) => acc + s.duration, 0) / recentSessions.length;
  
  const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
  const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));
  const firstAvg = firstHalf.reduce((acc, s) => acc + s.duration, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, s) => acc + s.duration, 0) / secondHalf.length;
  
  const trend = secondAvg < firstAvg ? 'improving' : secondAvg > firstAvg ? 'declining' : 'stable';
  const trendPercentage = Math.abs(((secondAvg - firstAvg) / firstAvg) * 100);

  const calculateHealthScore = () => {
    let score = 100;
    const avgPenalty = Math.max(0, (avgDuration - 30) * 1.5);
    score -= avgPenalty;
    const durations = recentSessions.map(s => s.duration);
    const variance = durations.reduce((acc, d) => acc + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < 10) score += 5;
    if (trend === 'improving') score += 5;
    if (trend === 'declining') score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBarColor = (duration: number) => {
    if (duration <= 20) return 'bg-gradient-to-t from-emerald-400 to-emerald-300';
    if (duration <= 40) return 'bg-gradient-to-t from-blue-400 to-blue-300';
    if (duration <= 60) return 'bg-gradient-to-t from-amber-400 to-amber-300';
    return 'bg-gradient-to-t from-red-400 to-red-300';
  };

  return (
    <div className="space-y-4">
      {/* Health Score Ring */}
      <div className="flex items-center justify-between bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
              <motion.circle
                cx="40" cy="40" r="35"
                stroke="url(#scoreGradient)"
                strokeWidth="6" fill="none" strokeLinecap="round"
                initial={{ strokeDashoffset: 220 }}
                animate={{ strokeDashoffset: 220 - (220 * healthScore) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeDasharray="220"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444'} />
                  <stop offset="100%" stopColor={healthScore >= 80 ? '#14b8a6' : healthScore >= 60 ? '#f97316' : '#f43f5e'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-xl font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}
              </motion.span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('kickPattern.movementScore')}</h3>
            <p className="text-sm text-muted-foreground">
              {healthScore >= 80 ? t('kickPattern.excellent') : healthScore >= 60 ? t('kickPattern.good') : t('kickPattern.needsAttention')}
            </p>
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            {trend === 'improving' ? (
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            ) : trend === 'declining' ? (
              <TrendingDown className="w-5 h-5 text-amber-500" />
            ) : (
              <Minus className="w-5 h-5 text-blue-500" />
            )}
            <span className={`text-sm font-medium ${
              trend === 'improving' ? 'text-emerald-600' : 
              trend === 'declining' ? 'text-amber-600' : 'text-blue-600'
            }`}>
              {trend === 'stable' ? t('kickPattern.stable') : `${trendPercentage.toFixed(0)}%`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {trend === 'improving' ? t('kickPattern.gettingFaster') : 
             trend === 'declining' ? t('kickPattern.slowingDown') : t('kickPattern.consistent')}
          </p>
        </div>
      </div>


      {/* Quick Insights */}
      {avgDuration > 60 && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t('kickPattern.extendedDuration')}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              {t('kickPattern.extendedDurationDesc', { avg: avgDuration.toFixed(0) })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KickPatternVisualizer;
