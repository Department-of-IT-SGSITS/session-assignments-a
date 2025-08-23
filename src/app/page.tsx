"use client";

import { useState } from "react";
import { CurrentWeather } from "@/components/current-weather";
import { HistoricalData } from "@/components/historical-data";
import { AlertSettings } from "@/components/alert-settings";
import { LocationSettings } from "@/components/location-settings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/weather");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Weather data updated successfully.",
        });
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update weather data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Weather Dashboard</h1>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Trigger Update
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CurrentWeather />
            <HistoricalData />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <AlertSettings />
            <LocationSettings />
          </div>
        </div>
      </div>
    </main>
  );
}
