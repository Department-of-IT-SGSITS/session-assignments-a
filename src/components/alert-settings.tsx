import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { alertSettings } from "@/lib/placeholder-data";

export function AlertSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Settings</CardTitle>
        <CardDescription>Configure thresholds for weather alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-alerts" className="font-semibold">Enable Email Alerts</Label>
          <Switch id="email-alerts" defaultChecked={alertSettings.alertsEnabled} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-temp">Max Temperature (°C)</Label>
          <Input id="max-temp" type="number" defaultValue={alertSettings.maxTemp} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-rain">Max Rainfall (mm/24h)</Label>
          <Input id="max-rain" type="number" defaultValue={alertSettings.maxRain} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Alert Email</Label>
          <Input id="email" type="email" defaultValue={alertSettings.email} />
        </div>
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
      </CardContent>
    </Card>
  );
}
