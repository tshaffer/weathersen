import { Response } from 'express';
import { Itinerary } from '../models/Itinerary';
import { AuthRequest } from '../middleware/auth';

// GET /api/v1/itineraries
export async function getItineraries(req: AuthRequest, res: Response): Promise<void> {
  const itineraries = await Itinerary.find({ userId: req.userId }, { __v: 0 }).sort({ updatedAt: -1 });
  res.json({ itineraries });
}

// POST /api/v1/itineraries
export async function createItinerary(req: AuthRequest, res: Response): Promise<void> {
  const { name, itineraryStart, itineraryStops } = req.body;
  if (!name || !itineraryStart) {
    res.status(400).json({ error: 'name and itineraryStart are required' });
    return;
  }
  const itinerary = await Itinerary.create({
    userId: req.userId,
    name,
    itineraryStart,
    itineraryStops: itineraryStops ?? [],
  });
  res.status(201).json({ itinerary });
}

// PUT /api/v1/itineraries/:id
export async function updateItinerary(req: AuthRequest, res: Response): Promise<void> {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.userId });
  if (!itinerary) {
    res.status(404).json({ error: 'Itinerary not found' });
    return;
  }
  const { name, itineraryStart, itineraryStops } = req.body;
  if (name !== undefined) itinerary.name = name;
  if (itineraryStart !== undefined) itinerary.itineraryStart = itineraryStart;
  if (itineraryStops !== undefined) itinerary.itineraryStops = itineraryStops;
  await itinerary.save();
  res.json({ itinerary });
}

// DELETE /api/v1/itineraries/:id
export async function deleteItinerary(req: AuthRequest, res: Response): Promise<void> {
  const itinerary = await Itinerary.findOne({ _id: req.params.id, userId: req.userId });
  if (!itinerary) {
    res.status(404).json({ error: 'Itinerary not found' });
    return;
  }
  await itinerary.deleteOne();
  res.json({ ok: true });
}
