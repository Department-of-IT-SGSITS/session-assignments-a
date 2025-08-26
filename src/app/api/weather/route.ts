import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { WeatherData, LocationSettings, AlertSettings } from '@/types';
import sgMail from '@sendgrid/mail';

// This function now fetches the 3-hour forecast
async function fetchWeather(location: LocationSettings) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not set in .env.local');
  }

  // Use the 'forecast' endpoint instead of 'weather'
  let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric`;

  if (location.lat && location.lon) {
    url += `&lat=${location.lat}&lon=${location.lon}`;
  } else if (location.city) {
    url += `&q=${location.city}`;
  } else {
    throw new Error('No location provided. Please set a city or coordinates.');
  }
  
  // We only need the first forecast entry
  url += '&cnt=1';

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch weather forecast. Status: ${response.status}. Body: ${errorBody}`);
  }
  const data = await response.json();

  if (!data.list || data.list.length === 0) {
    throw new Error('No forecast data available in the response.');
  }

  const forecast = data.list[0];

  const weatherData: WeatherData = {
    date: new Date(forecast.dt * 1000).toISOString(),
    temp: forecast.main.temp,
    humidity: forecast.main.humidity,
    // Use rain volume from '3h' key if available, otherwise check 'pop'
    rain: forecast.rain ? forecast.rain['3h'] : (forecast.pop > 0 ? 0.1 : 0), // 'pop' is probability of precipitation
    wind: forecast.wind.speed * 3.6, // convert m/s to km/h
    pop: forecast.pop * 100 // Probability of precipitation in %
  };
  
  return weatherData;
}

async function sendEmail(alertSettings: AlertSettings, location: LocationSettings) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!sendgridApiKey) {
    console.error("SENDGRID_API_KEY is not set. Skipping email.");
    return;
  }
  if (!fromEmail) {
    console.error("SENDGRID_FROM_EMAIL is not set. Skipping email.");
    return;
  }

  sgMail.setApiKey(sendgridApiKey);

  const msg = {
    to: alertSettings.email,
    from: fromEmail,
    subject: `Rain Alert for ${location.displayName || location.city}`,
    html: `
      <h1>Rain Alert</h1>
      <p>Heads up! There is a high chance of rain within the next 3 hours at your location: ${location.displayName || location.city}.</p>
      <p>This is an automated message from WeatherWise Watcher.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email alert sent successfully to ${alertSettings.email}`);
  } catch (error: any) {
    console.error('Error sending email via SendGrid:', error);
    if (error.response) {
      console.error(error.response.body)
    }
  }
}

export async function GET() {
  console.log("Weather forecast update job started...");
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
            maxRain: 0.1, // Set a low rain threshold to trigger for any predicted rain
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
    // The alert is now based on probability of precipitation ('pop')
    if (settings && settings.alertsEnabled && weatherData.pop && weatherData.pop > 0) {
        console.log(`Rain alert triggered. Probability of precipitation: ${weatherData.pop}%`);
        await sendEmail(settings, location);
    }

    console.log("Weather forecast update job finished successfully.");
    return NextResponse.json({ success: true, message: 'Weather data updated successfully.', data: weatherData });
  } catch (error: any) {
    console.error("Error in weather forecast update job:", error);
    // Check if error is a Firestore error object and has a code property
    if (error.code) {
        const errorMessage = `A Firestore error occurred: ${error.code} ${error.details || error.message}`;
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
    const errorMessage = error.message || "An unknown error occurred";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
