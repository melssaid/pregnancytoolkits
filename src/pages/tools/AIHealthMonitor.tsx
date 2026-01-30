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
  const [symptoms, setSymptoms] = useState(['تعب خفيف', 'غثيان صباحي']);

  return (
    <ToolFrame
      title="نظام المراقبة الصحية"
      subtitle="لوحة تحكم شاملة مع تحليلات تنبؤية"
      toolId="ai-health-monitor"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Scale />
              الوزن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weightTrend}kg</div>
            <Progress value={75} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">طبيعي للأسبوع 28</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HeartPulse />
              ضغط الدم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bpTrend.sys}/{bpTrend.dia}</div>
            <Badge className="mt-2">طبيعي</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle />
              مخاطر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Badge variant="outline">ولادة مبكرة: منخفض (12%)</Badge>
              <Badge variant="outline">تسمم الحمل: متوسط (28%)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}