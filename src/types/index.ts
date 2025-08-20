export type WeatherData = {
  date: string;
  temp: number;
  humidity: number;
  rain: number;
  wind: number;
};

export type AlertSettings = {
  maxTemp: number;
  maxRain: number;
  email: string;
  alertsEnabled: boolean;
};

export type LocationSettings = {
  city: string;
};
