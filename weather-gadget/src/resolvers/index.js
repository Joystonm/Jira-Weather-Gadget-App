import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";

const resolver = new Resolver();

// Simple hello world test resolver
resolver.define("getText", (req) => {
  console.log(req);
  return "Hello, world!";
});

// Resolver to fetch geolocation data from OpenWeather API
resolver.define("getLocationCoordinates", async (req) => {
  if (req.payload.location) {
    const config = req.payload.location;
    const url =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      config.city +
      "," +
      config.country +
      "&limit=5&appid=" +
      process.env.OPENWEATHER_KEY;

    const response = await fetch(url);

    if (!response.ok) {
      const errmsg = `Error from Open Weather Map Geolocation API: ${
        response.status
      } ${await response.text()}`;
      console.error(errmsg);
      throw new Error(errmsg);
    }

    const locations = await response.json();
    return locations;
  } else {
    return null;
  }
});

// ✅ NEW: Resolver to fetch current weather using lat/lon
resolver.define("getCurrentWeather", async (req) => {
  console.log(req.context.extension.gadgetConfiguration);

  const config = req.context.extension.gadgetConfiguration;

  if (config && config.lat && config.lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${config.lat}&lon=${config.lon}&units=metric&appid=${process.env.OPENWEATHER_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errmsg = `Error from Current Weather API: ${response.status} ${await response.text()}`;
      console.error(errmsg);
      throw new Error(errmsg);
    }

    const weather = await response.json();
    return weather;
  } else {
    return null;
  }
});

export const handler = resolver.getDefinitions();
