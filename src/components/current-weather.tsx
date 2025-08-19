import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { currentLocation, currentWeather } from "@/lib/placeholder-data";
import { WeatherIcon } from "@/components/weather-icon";

export function CurrentWeather() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-bold">{currentWeather.temperature}°C</CardTitle>
                <CardDescription className="text-base">{currentWeather.condition} in {currentLocation}</CardDescription>
            </div>
            <WeatherIcon name={currentWeather.icon as any} className="h-12 w-12 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <WeatherIcon name="Wind" className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Wind:</span>
            <span>{currentWeather.wind} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon name="Droplets" className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Humidity:</span>
            <span>{currentWeather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon name="CloudRain" className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">Rain:</span>
            <span>{currentWeather.precipitation} mm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
