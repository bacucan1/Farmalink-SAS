import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Medicamento } from '../models/Medicamento.js';
import {
  validateCreateMedicamento,
  validateUpdateMedicamento,
  CreateMedicamentoDTO,
  UpdateMedicamentoDTO,
} from './MedicamentoDTO.js';

// ── GET /api/medicamentos ─────────────────────────────────────────────────────
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { category, active, lab } = req.query;
    const filter: any = {};

    if (category) filter.category = { $regex: category as string, $options: 'i' };
    if (active !== undefined) filter.active = active === 'true';
    if (lab) filter.lab = { $regex: lab as string, $options: 'i' };

    const medicamentos = await Medicamento.find(filter)
      .populate('farmaciaId', 'name address phone')
      .sort({ name: 1 });

    res.json({ success: true, total: medicamentos.length, data: medicamentos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener medicamentos', error });
  }
}

// ── GET /api/medicamentos/:id ─────────────────────────────────────────────────
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const medicamento = await Medicamento.findById(id).populate('farmaciaId', 'name address phone');

    if (!medicamento) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    res.json({ success: true, data: medicamento });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener medicamento', error });
  }
}

// ── POST /api/medicamentos ────────────────────────────────────────────────────
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body: CreateMedicamentoDTO = req.body;

    // Validar DTO
    const errors = validateCreateMedicamento(body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Datos inválidos', errors });
      return;
    }

    // Verificar que no exista el mismo medicamento en la misma farmacia
    const existe = await Medicamento.findOne({
      name: { $regex: `^${body.name.trim()}$`, $options: 'i' },
      farmaciaId: body.farmaciaId,
    });

    if (existe) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un medicamento con ese nombre en esa farmacia',
      });
      return;
    }

    const nuevo = await Medicamento.create({
      name: body.name.trim(),
      lab: body.lab.trim(),
      active: body.active ?? true,
      description: body.description?.trim(),
      category: body.category?.trim(),
      farmaciaId: body.farmaciaId,
    });

    res.status(201).json({ success: true, message: 'Medicamento creado', data: nuevo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear medicamento', error });
  }
}

// ── PUT /api/medicamentos/:id ─────────────────────────────────────────────────
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body: UpdateMedicamentoDTO = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    // Validar DTO
    const errors = validateUpdateMedicamento(body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, message: 'Datos inválidos', errors });
      return;
    }

    const actualizado = await Medicamento.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('farmaciaId', 'name address phone');

    if (!actualizado) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    res.json({ success: true, message: 'Medicamento actualizado', data: actualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar medicamento', error });
  }
}

// ── DELETE /api/medicamentos/:id ──────────────────────────────────────────────
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' });
      return;
    }

    const eliminado = await Medicamento.findByIdAndDelete(id);

    if (!eliminado) {
      res.status(404).json({ success: false, message: 'Medicamento no encontrado' });
      return;
    }

    res.json({ success: true, message: 'Medicamento eliminado', data: eliminado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar medicamento', error });
  }
}
