import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPrecio extends Document {
  precio: number;
  medicamentoId: Types.ObjectId;
  farmaciaId: Types.ObjectId;
  fecha: Date;
}

const PrecioSchema = new Schema<IPrecio>(
  {
    precio: { type: Number, required: true },
    medicamentoId: { type: Schema.Types.ObjectId, ref: 'Medicamento', required: true },
    farmaciaId: { type: Schema.Types.ObjectId, ref: 'Farmacia', required: true },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

PrecioSchema.index({ medicamentoId: 1, farmaciaId: 1 });

export const Precio = mongoose.model<IPrecio>('Precio', PrecioSchema);
