import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { useAIUsageLimit } from "@/hooks/useAIUsageLimit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Progress } from "@/components/ui/progress";
import {
  Baby, Heart, Footprints, Scale, Pill, Calendar,
  Brain, Sparkles, Camera, Moon, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MyPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { stats, toolSummaries } = useTrackingStats();
  const { used, limit, remaining } = useAIUsageLimit();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const trimester = profile.pregnancyWeek <= 13 ? 1 : profile.pregnancyWeek <= 26 ? 2 : 3;
  const progressPercent = Math.round((profile.pregnancyWeek / 42) * 100);
  const aiUsagePercent = Math.round((used / limit) * 100);

  const quickStats = [
    {
      icon: <Footprints className="h-4 w-4" />,
      label: t("toolsInternal.myPage.kicks", "ركلات اليوم"),
      value: stats.dailyTracking.todayKicks,
      path: "/tools/kick-counter",
      color: "text-pink-500",
    },
    {
      icon: <Scale className="h-4 w-4" />,
      label: t("toolsInternal.myPage.weight", "الوزن"),
      value: stats.dailyTracking.lastWeight || "—",
      path: "/tools/weight-gain",
      color: "text-blue-500",
    },
    {
      icon: <Pill className="h-4 w-4" />,
      label: t("toolsInternal.myPage.vitamins", "فيتامينات اليوم"),
      value: stats.dailyTracking.vitaminsTaken,
      path: "/tools/vitamin-tracker",
      color: "text-green-500",
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: t("toolsInternal.myPage.appointments", "مواعيد قادمة"),
      value: stats.planning.upcomingAppointments,
      path: "/tools/smart-appointment-reminder",
      color: "text-purple-500",
    },
  ];

  const activityItems = [
    { icon: <Camera className="h-4 w-4" />, label: t("toolsInternal.myPage.photos", "صور البطن"), value: stats.growth.photosCount, show: stats.growth.photosCount > 0 },
    { icon: <Moon className="h-4 w-4" />, label: t("toolsInternal.myPage.babySleep", "ساعات نوم الطفل"), value: `${stats.postpartum.sleepHoursToday}h`, show: stats.postpartum.sleepHoursToday > 0 },
    { icon: <Baby className="h-4 w-4" />, label: t("toolsInternal.myPage.diapers", "حفاضات اليوم"), value: stats.postpartum.diapersToday, show: stats.postpartum.diapersToday > 0 },
  ].filter(i => i.show);

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-lg font-bold text-foreground flex-1">
            {t("toolsInternal.myPage.title", "صفحتي")}
          </h1>
        </div>

        {/* Pregnancy Progress */}
        {profile.isPregnant && profile.pregnancyWeek > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="font-semibold text-foreground">
                      {t("toolsInternal.myPage.week", "الأسبوع")} {profile.pregnancyWeek}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                    {t("toolsInternal.myPage.trimester", "الثلث")} {trimester}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{progressPercent}%</span>
                  <span>{42 - profile.pregnancyWeek} {t("toolsInternal.myPage.weeksLeft", "أسبوع متبقي")}</span>
                </div>
                {profile.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    {t("toolsInternal.myPage.dueDate", "الموعد المتوقع")}: {new Date(profile.dueDate).toLocaleDateString(i18n.language)}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(stat.path)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex flex-col gap-1">
                  <div className={`flex items-center gap-1.5 ${stat.color}`}>
                    {stat.icon}
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Usage */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {t("toolsInternal.myPage.aiUsage", "استخدام الذكاء الاصطناعي اليوم")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{used} / {limit}</span>
                <span>{remaining} {t("toolsInternal.myPage.remaining", "متبقي")}</span>
              </div>
              <Progress value={aiUsagePercent} className="h-2" />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                {t("toolsInternal.myPage.resetsDaily", "يتم التجديد يومياً عند منتصف الليل")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Summary */}
        {activityItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-2 p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {t("toolsInternal.myPage.activity", "نشاطك")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {activityItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("toolsInternal.myPage.profileInfo", "معلوماتك")}
                </span>
                <button
                  onClick={() => navigate("/settings")}
                  className="text-xs text-primary hover:underline"
                >
                  {t("toolsInternal.myPage.edit", "تعديل")}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {profile.weight && (
                  <div><span className="font-medium text-foreground">{profile.weight} kg</span> — {t("toolsInternal.myPage.weight", "الوزن")}</div>
                )}
                {profile.height && (
                  <div><span className="font-medium text-foreground">{profile.height} cm</span> — {t("toolsInternal.myPage.height", "الطول")}</div>
                )}
                {profile.bloodType && (
                  <div><span className="font-medium text-foreground">{profile.bloodType}</span> — {t("toolsInternal.myPage.bloodType", "فصيلة الدم")}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
