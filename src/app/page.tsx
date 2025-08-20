import { CurrentWeather } from "@/components/current-weather";
import { HistoricalData } from "@/components/historical-data";
import { AlertSettings } from "@/components/alert-settings";
import { LocationSettings } from "@/components/location-settings";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Weather Dashboard</h1>
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
