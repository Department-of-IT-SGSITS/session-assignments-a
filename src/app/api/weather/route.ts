import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { WeatherData, LocationSettings, AlertSettings } from '@/types';

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
    const errorBody = await response.text();
    throw new Error(`Failed to fetch weather data. Status: ${response.status}. Body: ${errorBody}`);
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

async function sendEmail(weather: WeatherData, alertSettings: AlertSettings) {
  // TODO: Implement email sending logic here using your preferred email service
  console.log(`SENDING EMAIL ALERT to ${alertSettings.email}:`, weather);
}

export async function GET() {
  console.log("Weather update job started...");
  try {
    const locationRef = adminDb.collection('settings').doc('location');
    const alertSettingsRef = adminDb.collection('settings').doc('alerts');

    let locationDoc = await locationRef.get();

    if (!locationDoc.exists) {
        console.log("Location settings not found, creating with default: { city: 'Bhopal' }");
        await locationRef.set({ city: 'Bhopal' });
        locationDoc = await locationRef.get(); // Re-fetch after creation
    }
    
    let alertSettingsDoc = await alertSettingsRef.get();

    if (!alertSettingsDoc.exists) {
        console.log("Alert settings not found, creating with default values.");
        await alertSettingsRef.set({
            alertsEnabled: true,
            maxTemp: 35,
            maxRain: 10,
            email: "user@example.com"
        });
        alertSettingsDoc = await alertSettingsRef.get(); // Re-fetch after creation
    }
    
    const location = locationDoc.data() as LocationSettings;
    const weatherData = await fetchWeather(location);

    // Save to Firestore
    const weatherDocId = new Date().toISOString();
    const weatherRef = adminDb.collection('weather').doc(weatherDocId);
    await weatherRef.set(weatherData);

    // Check for alerts
    const settings = alertSettingsDoc.data() as AlertSettings;
    if (settings && settings.alertsEnabled) {
      let alertTriggered = false;
      if (weatherData.temp > settings.maxTemp) {
        console.log(`Temperature alert triggered: ${weatherData.temp}°C > ${settings.maxTemp}°C`);
        alertTriggered = true;
      }
      if (weatherData.rain > settings.maxRain) {
        console.log(`Rain alert triggered: ${weatherData.rain}mm > ${settings.maxRain}mm`);
        alertTriggered = true;
      }
      
      if (alertTriggered) {
        await sendEmail(weatherData, settings);
      }
    }

    console.log("Weather update job finished successfully.");
    return NextResponse.json({ success: true, message: 'Weather data updated successfully.', data: weatherData });
  } catch (error: any) {
    console.error("Error in weather update job:", error);
    // Check if error is a Firestore error object and has a code property
    if (error.code) {
        const errorMessage = `A Firestore error occurred: ${error.code} ${error.details || error.message}`;
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
    const errorMessage = error.message || "An unknown error occurred";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
