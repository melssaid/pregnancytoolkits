import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldAlert, Sparkles } from "lucide-react";

type AppLink = {
  name: string;
  description: string;
  url: string;
};

const apps: AppLink[] = [
  {
    name: "Pregnancy AI",
    description: "AI assistant + weekly pregnancy tracking and checklists.",
    url: "https://play.google.com/store/apps/details?id=com.babyworld.pregnancyai&hl=en",
  },
  {
    name: "ChatMom: AI Pregnancy & Baby",
    description: "AI chat for pregnancy questions and baby care guidance.",
    url: "https://play.google.com/store/apps/details?id=kr.co.samtaelabs.chatmoms",
  },
  {
    name: "Wysa: Mental Wellbeing AI",
    description: "AI mental wellbeing support (useful during pregnancy and postpartum).",
    url: "https://play.google.com/store/apps/details?id=bot.touchkin&hl=en",
  },
  {
    name: "Flo",
    description: "Cycle/pregnancy tracking with an in-app health assistant.",
    url: "https://play.google.com/store/apps/details?id=org.iggymedia.periodtracker&hl=en",
  },
  {
    name: "Ovia Cycle & Pregnancy Tracker",
    description: "Cycle and pregnancy tracker with tools like kick counter and contraction timer.",
    url: "https://play.google.com/store/apps/details?id=com.ovuline.fertility&hl=en",
  },
];

export default function AIMaternityApps() {
  const { t } = useTranslation();

  return (
    <Layout title={t("tools.aiMaternityApps.title")} showBack>
      <div className="container max-w-2xl py-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("tools.aiMaternityApps.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("tools.aiMaternityApps.description")}
            </p>
            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <ShieldAlert className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                External apps can be helpful, but they are not a substitute for professional medical advice. Always consult your healthcare provider.
              </p>
            </div>
          </CardContent>
        </Card>

        {apps.map((app) => (
          <Card key={app.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{app.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{app.description}</p>
              <Button asChild className="w-full" variant="outline">
                <a href={app.url} target="_blank" rel="noopener noreferrer">
                  Open on Google Play
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
