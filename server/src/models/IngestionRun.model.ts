import mongoose, { Document, Schema } from 'mongoose';

export interface IIngestionRun extends Document {
  source: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  metrics: { fetched: number; inserted: number; duplicates: number; errors: number };
  errorMessage?: string;
}

const IngestionRunSchema = new Schema<IIngestionRun>({
  source: { type: String, required: true },
  status: { type: String, enum: ['running', 'completed', 'failed'], default: 'running' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  metrics: {
    fetched: { type: Number, default: 0 },
    inserted: { type: Number, default: 0 },
    duplicates: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
  },
  errorMessage: { type: String },
});

export const IngestionRun = mongoose.model<IIngestionRun>('IngestionRun', IngestionRunSchema);