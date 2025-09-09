// src/geocode.ts
import dotenv from 'dotenv';
dotenv.config();
console.log('Environment variables loaded from .env file in geocode.ts');
console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? '***' : 'MISSING');

import axios from "axios";

export interface LatLng { lat: number; lng: number; }

/** Converts a city name like "Portland, ME" to lat/lng using Geocoding API. */
export async function geocodeCity(city: string): Promise<LatLng> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_MAPS_API_KEY");
  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const { data } = await axios.get(url, { params: { address: city, key } });
  if (data.status !== "OK" || !data.results?.length) {
    throw new Error(`Geocoding failed for "${city}": ${data.status}`);
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}
