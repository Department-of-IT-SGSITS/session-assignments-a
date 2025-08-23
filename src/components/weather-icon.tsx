import type { LucideProps } from "lucide-react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun, Wind, Thermometer, Droplets, MapPin, LayoutDashboard, Bell, Settings, RefreshCw } from "lucide-react";

type IconName = "Sun" | "Cloud" | "CloudRain" | "CloudSnow" | "CloudSun" | "Wind" | "Thermometer" | "Droplets" | "MapPin" | "LayoutDashboard" | "Bell" | "Settings" | "RefreshCw" | "default";

const iconComponents: Record<IconName, React.FC<LucideProps>> = {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Wind,
  Thermometer,
  Droplets,
  MapPin,
  LayoutDashboard,
  Bell,
  Settings,
  RefreshCw,
  default: Sun,
};

interface WeatherIconProps extends LucideProps {
  name: IconName;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ name, ...props }) => {
  const IconComponent = iconComponents[name] || iconComponents.default;
  return <IconComponent {...props} />;
};
