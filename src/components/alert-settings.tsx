"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useToast } from "@/hooks/use-toast";
import type { AlertSettings as AlertSettingsType } from "@/types";

export function AlertSettings() {
  const [settings, setSettings] = useState<AlertSettingsType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "alerts");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AlertSettingsType);
      } else {
        // Initialize with default or empty state if no settings found
        setSettings({
          alertsEnabled: true,
          maxTemp: 35,
          maxRain: 0.1,
          email: "user@example.com"
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (settings) {
      try {
        await setDoc(doc(db, "settings", "alerts"), settings);
        toast({
          title: "Success",
          description: "Alert settings saved successfully.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save alert settings.",
        });
      }
    }
  };

  const handleChange = (field: keyof AlertSettingsType, value: any) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
          <CardDescription>Configure settings for weather alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Settings</CardTitle>
        <CardDescription>Configure settings for weather alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-alerts" className="font-semibold">Enable Rain Alerts</Label>
          <Switch
            id="email-alerts"
            checked={settings.alertsEnabled}
            onCheckedChange={(value) => handleChange("alertsEnabled", value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Alert Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}
