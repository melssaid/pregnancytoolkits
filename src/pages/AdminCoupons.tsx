import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Ticket, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getBackendFunctionUrl, getBackendPublishableKey } from "@/lib/backendConfig";

const ADMIN_KEY_STORAGE = "pt_admin_notifications_key";

interface CouponRow {
  id: string;
  code: string;
  duration_type: string;
  bonus_points: number;
  is_active: boolean;
  expires_at: string | null;
  current_claims: number;
  max_claims: number;
  created_at: string;
}

interface ClaimRow {
  id: string;
  coupon_id: string;
  device_fingerprint: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export default function AdminCoupons() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);

  const authenticate = () => {
    if (!adminKey.trim()) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    setIsAuthed(true);
  };

  useEffect(() => {
    if (!isAuthed) return;
    loadData();
  }, [isAuthed]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Coupons are public-readable
      const { data: couponData } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      setCoupons((couponData as CouponRow[]) || []);

      // Claims need service_role — use edge function
      const res = await fetch(getBackendFunctionUrl("redeem-coupon"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getBackendPublishableKey()}`,
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ action: "admin_stats" }),
      });
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims || []);
      }
    } catch (e) {
      console.error("Failed to load coupon data:", e);
    } finally {
      setLoading(false);
    }
  };

  const getClaimsForCoupon = (couponId: string) =>
    claims.filter((c) => c.coupon_id === couponId);

  const getUniqueDevices = (couponId: string) => {
    const couponClaims = getClaimsForCoupon(couponId);
    return new Set(couponClaims.map((c) => c.device_fingerprint)).size;
  };

  const getActiveClaims = (couponId: string) =>
    getClaimsForCoupon(couponId).filter(
      (c) => new Date(c.expires_at) > new Date()
    ).length;

  if (!isAuthed) {
    return (
      <Layout showBack>
        <SEOHead title="Admin Coupons" description="Coupon management dashboard" />
        <div className="container py-8 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-bold">Coupon Dashboard</h1>
            <p className="text-sm text-muted-foreground">Enter admin key to access</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin key"
              onKeyDown={(e) => e.key === "Enter" && authenticate()}
            />
            <button
              onClick={authenticate}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Enter
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack>
      <SEOHead title="Admin Coupons" description="Coupon management dashboard" />
      <div className="container py-4 pb-24 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Coupon Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const totalClaims = getClaimsForCoupon(coupon.id).length;
              const uniqueDevices = getUniqueDevices(coupon.id);
              const activeClaims = getActiveClaims(coupon.id);
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();

              return (
                <Card key={coupon.id} className="overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold tracking-widest">
                        {coupon.code}
                      </CardTitle>
                      <div className="flex gap-1.5">
                        {coupon.is_active ? (
                          <Badge variant="default" className="text-[10px] px-2 py-0.5">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                            Inactive
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                        <Users className="w-4 h-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{uniqueDevices}</p>
                        <p className="text-[10px] text-muted-foreground">Devices</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                        <Ticket className="w-4 h-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{totalClaims}</p>
                        <p className="text-[10px] text-muted-foreground">Total Claims</p>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                        <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{activeClaims}</p>
                        <p className="text-[10px] text-muted-foreground">Active Now</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>Duration: <strong className="text-foreground">{coupon.duration_type}</strong></span>
                      <span>•</span>
                      <span>Bonus: <strong className="text-foreground">{coupon.bonus_points} pts</strong></span>
                      {coupon.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires: <strong className="text-foreground">{new Date(coupon.expires_at).toLocaleDateString()}</strong></span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {coupons.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No coupons found</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}