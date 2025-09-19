import { Request, Response } from 'express';

import { version } from '../version';
import { getDailyForecast } from '../utilities';
import { DailyForecastDay } from 'googleInterfaces';

export const getVersion = (request: Request, response: Response, next: any) => {
  const data: any = {
    serverVersion: version,
  };
  response.json(data);
};

export const getAllForecasts= async (request: Request, response: Response, next: any) => {
  console.log('getAllForecasts called with query:', request.query);
  const { date, locations, numberOfDays } = request.query as { date: string, locations: string, numberOfDays: string };
  const googleLocations = JSON.parse(locations) as { lat: number; lng: number }[];
  console.log('Parsed locations:', googleLocations);

  const days: DailyForecastDay[][] = await Promise.all(googleLocations.map(googleLocation => getDailyForecast(googleLocation.lat, googleLocation.lng, 10)));
  console.log('Forecast days:', days);

  // Here you would normally call your weather API with the location and date
  // For this example, we'll just return a mock response
  return response.json({
    days,
  });
}

export const getForecast = async (request: Request, response: Response, next: any) => {
  console.log('getForecast called with query:', request.query);
  const { location, date } = request.query as { location: string, date: string };
  const googleLocation = JSON.parse(location) as { lat: number; lng: number };
  console.log('Parsed location:', googleLocation);

  const days = await getDailyForecast(googleLocation.lat, googleLocation.lng, 10);
  console.log('Forecast days:', days);

  // Here you would normally call your weather API with the location and date
  // For this example, we'll just return a mock response
  return response.json({
    days,
  });
}

