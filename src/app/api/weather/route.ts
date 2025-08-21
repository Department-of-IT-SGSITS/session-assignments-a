import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { WeatherData, LocationSettings } from '@/types';

async function fetchWeather(location: LocationSettings) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not set in .env.local');
  }

  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;

  if (location.lat && location.lon) {
    url += `&lat=${location.lat}&lon=${location.lon}`;
  } else if (location.city) {
    url += `&q=${location.city}`;
  } else {
    throw new Error('No location provided. Please set a city or coordinates.');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data for ${location.city || `${location.lat},${location.lon}`}: ${response.statusText}`);
  }
  const data = await response.json();
  
  const weatherData: WeatherData = {
    date: new Date().toISOString(),
    temp: data.main.temp,
    humidity: data.main.humidity,
    rain: data.rain ? data.rain['1h'] : 0, // Rain volume for the last 1 hour in mm
    wind: data.wind.speed * 3.6, // convert m/s to km/h
  };

  return weatherData;
}

async function sendEmail(weather: WeatherData) {
  // TODO: Implement email sending logic here using your preferred email service
  console.log("Sending email for weather alert:", weather);
}

export async function GET() {
  try {
    const locationRef = adminDb.collection('settings').doc('location');
    const locationDoc = await locationRef.get();
    
    const location: LocationSettings = locationDoc.exists 
      ? (locationDoc.data() as LocationSettings)
      : { city: 'Bhopal' };

    if (!location.city && (!location.lat || !location.lon)) {
        location.city = 'Bhopal'; // Default fallback
    }

    const weatherData = await fetchWeather(location);

    // Save to Firestore
    const weatherRef = adminDb.collection('weather').doc(new Date().toISOString());
    await weatherRef.set(weatherData);

    // Check for alerts
    const settingsRef = adminDb.collection('settings').doc('alerts');
    const settingsDoc = await settingsRef.get();
    if (settingsDoc.exists) {
      const settings = settingsDoc.data();
      if (settings && settings.alertsEnabled) {
        if (weatherData.temp > settings.maxTemp || weatherData.rain > settings.maxRain) {
          await sendEmail(weatherData);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Weather data updated successfully.', data: weatherData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
