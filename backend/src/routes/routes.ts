import express from 'express';
import { getAllForecasts, getForecast, getVersion, login, getUsers, createUser, deleteUser, getItineraries, createItinerary, updateItinerary, deleteItinerary } from '../controllers';
import { requireAuth, requireAdmin } from '../middleware/auth';

export const createRoutes = (app: express.Application) => {

  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/api/v1/version', getVersion);

  app.get('/api/v1/allForecasts', getAllForecasts);
  app.get('/api/v1/forecast', getForecast);

  // Auth
  app.post('/api/v1/auth/login', login);

  // User management
  app.get('/api/v1/users', requireAuth, getUsers);
  app.post('/api/v1/users', requireAdmin, createUser);
  app.delete('/api/v1/users/:id', requireAdmin, deleteUser);

  // Itineraries
  app.get('/api/v1/itineraries', requireAuth, getItineraries);
  app.post('/api/v1/itineraries', requireAuth, createItinerary);
  app.put('/api/v1/itineraries/:id', requireAuth, updateItinerary);
  app.delete('/api/v1/itineraries/:id', requireAuth, deleteItinerary);

};
