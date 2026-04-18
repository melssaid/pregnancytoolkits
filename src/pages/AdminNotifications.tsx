import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Send, Users, CheckCircle, AlertCircle, Loader2, Lock, Image as ImageIcon, X } from "lucide-react";

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  created_at: string;
  total_sent: number;
  total_failed: number;
  total_subscribers: number;
  language: string | null;
}

const ADMIN_KEY_STORAGE = "pt_admin_notifications_key";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);
  const [language, setLanguage] = useState("all");
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  // Admin key from URL param or localStorage
  const [adminKey, setAdminKey] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const keyFromUrl = params.get("key");
    if (keyFromUrl) {
      localStorage.setItem(ADMIN_KEY_STORAGE, keyFromUrl);
      return keyFromUrl;
    }
    return localStorage.getItem(ADMIN_KEY_STORAGE) || "";
  });
  const [keyInput, setKeyInput] = useState("");
  const [authenticated, setAuthenticated] = useState(!!adminKey);

  useEffect(() => {
    if (adminKey) {
      fetchSubscriberCount();
      loadLogs();
    }
  }, [adminKey]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-admin-key": adminKey,
  });

  const fetchSubscriberCount = async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-push-notification`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ action: "count" }),
        }
      );
      const data = await res.json();
      if (res.ok && data.count !== undefined) {
        setSubscriberCount(data.count);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
        toast.error("مفتاح غير صالح");
      }
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

  const handleLogin = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
    setAuthenticated(true);
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
          headers: getHeaders(),
          body: JSON.stringify({
            action: "send",
            title: title.trim(),
            body: body.trim(),
            language: language === "all" ? undefined : language,
            image: imageUrl.trim() || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send");

      const newLog: NotificationLog = {
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim(),
        created_at: new Date().toISOString(),
        total_sent: data.sent || 0,
        total_failed: data.failed || 0,
        total_subscribers: data.total || 0,
        language: language === "all" ? null : language,
      };
      const updated = [newLog, ...logs].slice(0, 50);
      setLogs(updated);
      localStorage.setItem("pt_notification_logs", JSON.stringify(updated));

      toast.success(`✅ تم إرسال ${data.sent} إشعار بنجاح`);
      setTitle("");
      setBody("");
      setImageUrl("");
      setImageError(false);
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

  // Login screen
  if (!authenticated) {
    return (
      <Layout showBack>
        <SEOHead title="Admin - Notifications" description="Admin panel" />
        <div className="container py-12 max-w-sm mx-auto flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground mb-1">لوحة الإدارة</h1>
            <p className="text-xs text-muted-foreground">أدخل مفتاح الإدارة للوصول</p>
          </div>
          <div className="w-full space-y-3">
            <Input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="المفتاح السري..."
              className="text-center"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              dir="ltr"
            />
            <Button onClick={handleLogin} className="w-full" disabled={!keyInput.trim()}>
              دخول
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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

            {/* Image URL with live preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                صورة الإشعار <span className="text-[10px] text-muted-foreground/70">(اختياري — يُفضّل 1024×512)</span>
              </label>
              <div className="relative">
                <Input
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setImageError(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="h-9 text-sm pr-8"
                  dir="ltr"
                  type="url"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => { setImageUrl(""); setImageError(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="مسح الرابط"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live preview — exact mobile notification proportions (2:1 image + caption below) */}
              {imageUrl && !imageError && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-border bg-card shadow-sm" dir="auto">
                  <div className="aspect-[2/1] bg-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="معاينة"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2.5 bg-card">
                    <p className="text-[13px] font-bold text-foreground leading-tight line-clamp-1">
                      {title || "عنوان الإشعار"}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {body || "محتوى الإشعار سيظهر هنا..."}
                    </p>
                  </div>
                </div>
              )}
              {imageUrl && imageError && (
                <p className="text-[10px] text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> فشل تحميل الصورة — تأكد من الرابط (HTTPS)
                </p>
              )}
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
                      {new Date(log.created_at).toLocaleDateString("ar")}
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
