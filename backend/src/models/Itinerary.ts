import mongoose, { Document, Schema, Types } from 'mongoose';

interface SavedLocation {
  googlePlaceId: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
}

interface SavedStop {
  stopId: string;
  placeName?: string;
  location?: SavedLocation;
}

export interface IItinerary extends Document {
  userId: Types.ObjectId;
  name: string;
  itineraryStart: string;
  itineraryStops: SavedStop[];
}

const SavedLocationSchema = new Schema<SavedLocation>(
  {
    googlePlaceId: { type: String, required: true },
    name: { type: String, required: true },
    geometry: {
      location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
  },
  { _id: false }
);

const SavedStopSchema = new Schema<SavedStop>(
  {
    stopId: { type: String, required: true },
    placeName: { type: String },
    location: { type: SavedLocationSchema },
  },
  { _id: false }
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    itineraryStart: { type: String, required: true },
    itineraryStops: { type: [SavedStopSchema], default: [] },
  },
  { timestamps: true }
);

export const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
