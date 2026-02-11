import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, HeartPulse, Thermometer, Scale, Activity } from 'lucide-react';

export default function AIHealthMonitor() {
  const { t } = useTranslation();
  const [weightTrend, setWeightTrend] = useState(28);
  const [bpTrend, setBpTrend] = useState({ sys: 115, dia: 75 });
  const [symptoms, setSymptoms] = useState(['Mild fatigue', 'Morning sickness']);

  return (
    <ToolFrame
      title={t('toolsInternal.healthMonitor.title')}
      subtitle={t('toolsInternal.healthMonitor.subtitle')}
      toolId="ai-health-monitor"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Scale />
              {t('toolsInternal.healthMonitor.weight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{weightTrend}kg</div>
            <Progress value={75} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {t('toolsInternal.healthMonitor.normalForWeek', { week: 28 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HeartPulse />
              {t('toolsInternal.healthMonitor.bloodPressure')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{bpTrend.sys}/{bpTrend.dia}</div>
            <Badge className="mt-2">{t('toolsInternal.healthMonitor.normal')}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              {t('toolsInternal.healthMonitor.risks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Badge variant="outline">{t('toolsInternal.healthMonitor.pretermBirth')}: {t('toolsInternal.healthMonitor.low')} (12%)</Badge>
              <Badge variant="outline">{t('toolsInternal.healthMonitor.preeclampsia')}: {t('toolsInternal.healthMonitor.medium')} (28%)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
