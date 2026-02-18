import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmacia extends Document {
  name: string;
  address: string;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
}

const FarmaciaSchema = new Schema<IFarmacia>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FarmaciaSchema.index({ location: '2dsphere' });

export const Farmacia = mongoose.model<IFarmacia>('Farmacia', FarmaciaSchema);
