import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, HeartPulse, Thermometer, Scale, Activity } from 'lucide-react';

export default function AIHealthMonitor() {
  const [weightTrend, setWeightTrend] = useState(28);
  const [bpTrend, setBpTrend] = useState({ sys: 115, dia: 75 });
  const [symptoms, setSymptoms] = useState(['Mild fatigue', 'Morning sickness']);

  return (
    <ToolFrame
      title="Health Monitoring System"
      subtitle="Comprehensive dashboard with predictive analytics"
      toolId="ai-health-monitor"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Scale />
              Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weightTrend}kg</div>
            <Progress value={75} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">Normal for week 28</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HeartPulse />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bpTrend.sys}/{bpTrend.dia}</div>
            <Badge className="mt-2">Normal</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Badge variant="outline">Preterm birth: Low (12%)</Badge>
              <Badge variant="outline">Preeclampsia: Medium (28%)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
