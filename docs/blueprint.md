# **App Name**: WeatherWise Watcher

## Core Features:

- Weather Data Fetching: Fetches weather data from OpenWeatherMap API using a scheduled Firebase Cloud Function.
- Threshold Analysis: Analyzes weather data against predefined thresholds (MAX_TEMP_C, MAX_RAIN_MM).
- Email Alerting: Sends email alerts via Twilio if thresholds are exceeded. Triggered by Firebase Cloud Functions.
- Historical Data Display: Displays historical weather data using a static website hosted on Firebase Hosting.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) to evoke a sense of clear skies and reliable information.
- Background color: Light gray (#F0F0F0) to provide a clean and neutral backdrop for data presentation.
- Accent color: Warm orange (#FF9933) to highlight important alerts and calls to action.
- Body and headline font: 'PT Sans' for a modern and readable user experience.
- Use clear, simple icons to represent weather conditions and alert types.
- Dashboard layout should be clean and data-focused, with clear sections for current conditions, historical data, and alert settings.