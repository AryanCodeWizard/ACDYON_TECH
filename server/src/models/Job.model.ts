import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  externalId: string;
  source: string;
  title: string;
  company: string;
  description: string;
  location: string;
  url: string;
  postedAt: Date;
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    externalId: { type: String, required: true },
    source: { type: String, required: true, index: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    url: { type: String, required: true },
    postedAt: { type: Date, required: true },
    fingerprint: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Composite index for externalId dedupe fallback
JobSchema.index({ source: 1, externalId: 1 }, { unique: true });
// Text index for full-text search across job titles, companies, descriptions, and locations
JobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });

export const Job = mongoose.model<IJob>('Job', JobSchema);