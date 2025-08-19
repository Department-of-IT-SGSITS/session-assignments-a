import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardHeader } from "@/components/dashboard-header";
import { CurrentWeather } from "@/components/current-weather";
import { HistoricalData } from "@/components/historical-data";
import { AlertSettings } from "@/components/alert-settings";
import { WeatherIcon } from "@/components/weather-icon";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <WeatherIcon name="Sun" className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              WeatherWise
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard" isActive>
                <WeatherIcon name="LayoutDashboard" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Alerts">
                <WeatherIcon name="Bell" />
                <span>Alerts</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <WeatherIcon name="Settings" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
             {userAvatar &&
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar.imageUrl} alt={userAvatar.description} data-ai-hint={userAvatar.imageHint} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            }
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">User</span>
              <span className="text-xs text-sidebar-foreground/70">user@example.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        <div className="p-4 md:p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <CurrentWeather />
                <HistoricalData />
            </div>
            <div className="lg:col-span-1">
                <AlertSettings />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
