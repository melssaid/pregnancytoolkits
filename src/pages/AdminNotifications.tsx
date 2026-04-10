import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Send, Users, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  total_sent: number;
  total_failed: number;
}

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [language, setLanguage] = useState("all");
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    fetchSubscriberCount();
    loadLogs();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-push-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "count" }),
        }
      );
      const data = await res.json();
      if (data.count !== undefined) setSubscriberCount(data.count);
    } catch {
      // ignore
    }
  };

  const loadLogs = () => {
    try {
      const stored = localStorage.getItem("pt_notification_logs");
      if (stored) setLogs(JSON.parse(stored));
    } catch {}
  };

  const saveLog = (log: NotificationLog) => {
    const updated = [log, ...logs].slice(0, 50);
    setLogs(updated);
    localStorage.setItem("pt_notification_logs", JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("يرجى ملء العنوان والرسالة");
      return;
    }

    setSending(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-push-notification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            title: title.trim(),
            body: body.trim(),
            language: language === "all" ? undefined : language,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send");

      saveLog({
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim(),
        sent_at: new Date().toISOString(),
        total_sent: data.sent || 0,
        total_failed: data.failed || 0,
      });

      toast.success(`✅ تم إرسال ${data.sent} إشعار بنجاح`);
      setTitle("");
      setBody("");
    } catch (err: any) {
      toast.error(`فشل الإرسال: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const templates = [
    { label: "📖 ملخص أسبوعي", title: "ملخصك الأسبوعي جاهز!", body: "اكتشفي تطورات طفلك هذا الأسبوع ونصائح مهمة لصحتك 💕" },
    { label: "💪 تحفيز", title: "أنتِ رائعة! 🌟", body: "تذكري أن كل يوم يقربك من لقاء طفلك. استمري بالاهتمام بصحتك!" },
    { label: "🍎 تغذية", title: "نصيحة غذائية مهمة", body: "اكتشفي أفضل الأطعمة لهذا الأسبوع من الحمل وفوائدها لك ولطفلك." },
    { label: "🏃 حركة", title: "وقت التمارين! 🧘", body: "تمارين خفيفة مناسبة لمرحلتك جاهزة في التطبيق. ابدئي الآن!" },
  ];

  return (
    <Layout showBack>
      <SEOHead title="Admin - Notifications" description="Send push notifications to app users" />
      <div className="container py-4 pb-24 max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">إدارة الإشعارات</h1>
            <p className="text-xs text-muted-foreground">إرسال إشعارات مخصصة لجميع المستخدمين</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{subscriberCount ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground">مشترك نشط</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-lg font-bold">{logs.length}</p>
                <p className="text-[10px] text-muted-foreground">إشعار مُرسل</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Templates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">قوالب جاهزة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => { setTitle(t.title); setBody(t.body); }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compose */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">إنشاء إشعار جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">اللغة المستهدفة</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 جميع اللغات</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">العنوان</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإشعار..."
                className="h-9 text-sm"
                maxLength={100}
                dir="auto"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">الرسالة</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="محتوى الإشعار..."
                className="text-sm min-h-[80px]"
                maxLength={300}
                dir="auto"
              />
              <p className="text-[10px] text-muted-foreground text-end mt-1">{body.length}/300</p>
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim()}
              className="w-full"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> جاري الإرسال...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> إرسال الإشعار</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        {logs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">سجل الإشعارات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" dir="auto">{log.title}</span>
                    <Badge variant="secondary" className="text-[9px]">
                      {new Date(log.sent_at).toLocaleDateString("ar")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground" dir="auto">{log.body}</p>
                  <div className="flex gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle className="w-3 h-3" /> {log.total_sent} نجح
                    </span>
                    {log.total_failed > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-3 h-3" /> {log.total_failed} فشل
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
