import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedicamento extends Document {
  name: string;
  lab: string;
  active: boolean;
  description?: string;
  category?: string;
  farmaciaId: Types.ObjectId;
  createdAt: Date;
}

const MedicamentoSchema = new Schema<IMedicamento>(
  {
    name: { type: String, required: true },
    lab: { type: String, required: true },
    active: { type: Boolean, default: true },
    description: { type: String },
    category: { type: String },
    farmaciaId: { type: Schema.Types.ObjectId, ref: 'Farmacia', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Medicamento = mongoose.model<IMedicamento>('Medicamento', MedicamentoSchema);
