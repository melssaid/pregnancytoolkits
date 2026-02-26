import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Baby, Calendar, Droplets, Activity, TrendingUp, Ruler,
  Utensils, ShoppingCart, Pill, FileText, PersonStanding, ChevronLeft, ChevronRight,
  Moon, Heart, Milk,
  type LucideIcon 
} from "lucide-react";

interface RelatedToolLink {
  to: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  arrowIcon?: LucideIcon;
}

const ICON_MAP: Record<string, LucideIcon> = {
  baby: Baby,
  calendar: Calendar,
  droplets: Droplets,
  activity: Activity,
  trending: TrendingUp,
  ruler: Ruler,
  utensils: Utensils,
  cart: ShoppingCart,
  pill: Pill,
  fileText: FileText,
  personStanding: PersonStanding,
  moon: Moon,
  heart: Heart,
  milk: Milk,
};

interface RelatedToolLinksProps {
  links: {
    to: string;
    titleKey: string;
    titleFallback: string;
    descKey: string;
    descFallback: string;
    icon: keyof typeof ICON_MAP;
  }[];
}

export function RelatedToolLinks({ links }: RelatedToolLinksProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const Icon = ICON_MAP[link.icon] || Baby;
        return (
          <Link
            key={link.to}
            to={link.to}
            className="flex items-center gap-2.5 rounded-xl bg-primary/8 border border-primary/15 p-3 hover:bg-primary/12 transition-colors"
          >
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">
                {t(link.titleKey, link.titleFallback)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {t(link.descKey, link.descFallback)}
              </p>
            </div>
            <ArrowIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
