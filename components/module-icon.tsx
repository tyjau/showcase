import {
  Users,
  CalendarDays,
  Smartphone,
  UserPlus,
  Calculator,
  UserSearch,
  Target,
  GraduationCap,
  Award,
  HeartHandshake,
  ShieldCheck,
  Box,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  users: Users,
  "calendar-days": CalendarDays,
  smartphone: Smartphone,
  "user-plus": UserPlus,
  calculator: Calculator,
  "user-search": UserSearch,
  target: Target,
  "graduation-cap": GraduationCap,
  award: Award,
  "heart-handshake": HeartHandshake,
  "shield-check": ShieldCheck,
};

export function ModuleIcon({
  name,
  size = 20,
  className,
}: {
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = (name && MAP[name]) || Box;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
