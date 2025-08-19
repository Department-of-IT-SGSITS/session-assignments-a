import type { WeatherData, AlertSettings } from '@/types';

export const currentLocation = "Bhopal";

export const currentWeather = {
  temperature: 18,
  condition: "Partly Cloudy",
  icon: "CloudSun",
  wind: 15,
  humidity: 70,
  precipitation: 0,
};

export const historicalData: WeatherData[] = [
  { date: "2023-10-26", temp: 22, humidity: 65, rain: 0, wind: 12 },
  { date: "2023-10-25", temp: 24, humidity: 60, rain: 0, wind: 8 },
  { date: "2023-10-24", temp: 21, humidity: 70, rain: 2, wind: 15 },
  { date: "2023-10-23", temp: 20, humidity: 75, rain: 5, wind: 20 },
  { date: "2023-10-22", temp: 23, humidity: 68, rain: 0, wind: 10 },
  { date: "2023-10-21", temp: 25, humidity: 55, rain: 0, wind: 5 },
  { date: "2023-10-20", temp: 26, humidity: 50, rain: 0, wind: 7 },
];

export const alertSettings: AlertSettings = {
  maxTemp: 35,
  maxRain: 10,
  email: "user@example.com",
  alertsEnabled: true
};
