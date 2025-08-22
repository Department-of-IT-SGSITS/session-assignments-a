"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather-icon";
import { db } from "@/lib/firebase-client";
import { collection, onSnapshot, query, orderBy, limit, doc } from "firebase/firestore";
import type { WeatherData } from "@/types";
import { currentLocation } from "@/lib/placeholder-data";

export function CurrentWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState(currentLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weatherQuery = query(collection(db, "weather"), orderBy("date", "desc"), limit(1));
    const unsubscribeWeather = onSnapshot(weatherQuery, (snapshot) => {
      if (!snapshot.empty) {
        setWeather(snapshot.docs[0].data() as WeatherData);
      } else {
        setWeather(null);
      }
      setLoading(false);
    });

    const locationRef = doc(db, "settings", "location");
    const unsubscribeLocation = onSnapshot(locationRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().city) {
        setLocation(docSnap.data().city);
      } else {
        setLocation(currentLocation);
      }
    });

    return () => {
      unsubscribeWeather();
      unsubscribeLocation();
    };
  }, []);

  const getWeatherIcon = (temp: number) => {
    if (temp > 30) return "Sun";
    if (temp < 10) return "CloudSnow";
    return "CloudSun";
  }

  if (loading || !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading current weather...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait. If this is the first time, data may take a moment to appear.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-bold">{weather.temp.toFixed(1)}°C</CardTitle>
                <CardDescription className="text-base">
                  {weather.rain > 0 ? "Rainy" : "Clear"} in {location}
                </CardDescription>
            </div>
            <WeatherIcon name={getWeatherIcon(weather.temp)} className="h-12 w-12 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <WeatherIcon name="Wind" className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Wind:</span>
            <span>{weather.wind.toFixed(1)} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon name="Droplets" className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Humidity:</span>
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <WeatherIcon name="CloudRain" className="h-5 w-5 text-muted-foreground" />
             <span className="font-medium">Rain:</span>
            <span>{weather.rain} mm</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
