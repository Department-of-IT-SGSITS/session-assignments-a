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
    console.log(`Fetching weather for coordinates: ${location.lat}, ${location.lon}`);
  } else if (location.city) {
    url += `&q=${location.city}`;
    console.log(`Fetching weather for city: ${location.city}`);
  } else {
    throw new Error('No location provided. Please set a city or coordinates.');
  }

  console.log(`Requesting URL: ${url}`);
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
  
  console.log("Successfully fetched weather data:", weatherData);
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
    const locationDoc = await locationRef.get();
    
    let location: LocationSettings = { city: 'Bhopal' }; // Default
    if (locationDoc.exists) {
      location = locationDoc.data() as LocationSettings;
      console.log("Found location settings in Firestore:", location);
    } else {
      console.log("No location settings found in Firestore, using default 'Bhopal'.");
    }

    if (!location.city && (!location.lat || !location.lon)) {
        location.city = 'Bhopal'; // Default fallback
        console.log("Location details incomplete, falling back to 'Bhopal'.");
    }

    const weatherData = await fetchWeather(location);

    // Save to Firestore
    const weatherDocId = new Date().toISOString();
    const weatherRef = adminDb.collection('weather').doc(weatherDocId);
    await weatherRef.set(weatherData);
    console.log(`Weather data saved to Firestore with ID: ${weatherDocId}`);


    // Check for alerts
    const settingsRef = adminDb.collection('settings').doc('alerts');
    const settingsDoc = await settingsRef.get();
    if (settingsDoc.exists) {
      const settings = settingsDoc.data() as AlertSettings;
      console.log("Found alert settings:", settings);
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
        } else {
          console.log("No alert conditions met.");
        }
      } else {
        console.log("Alerts are disabled in settings.");
      }
    } else {
      console.log("No alert settings found in Firestore.");
    }

    console.log("Weather update job finished successfully.");
    return NextResponse.json({ success: true, message: 'Weather data updated successfully.', data: weatherData });
  } catch (error: any) {
    console.error("Error in weather update job:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
