import express from 'express';
import { getAllForecasts, getForecast, getVersion } from '../controllers';

export const createRoutes = (app: express.Application) => {

  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/api/v1/version', getVersion);

  app.get('/api/v1/allForecasts', getAllForecasts);
  app.get('/api/v1/forecast', getForecast);

};
