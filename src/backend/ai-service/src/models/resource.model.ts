import mongoose, { Document, Schema } from 'mongoose';

export interface IExperimentResource extends Document {
  experimentId: string;
  type: 'dataset' | 'model' | 'checkpoint' | 'result';
  name: string;
  path: string;
  size: number;
  format: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

const ExperimentResourceSchema = new Schema<IExperimentResource>({
  experimentId: { type: String, required: true, index: true },
  type: { type: String, enum: ['dataset', 'model', 'checkpoint', 'result'], required: true },
  name: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, default: 0 },
  format: { type: String, default: 'unknown' },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const ExperimentResourceModel = mongoose.model<IExperimentResource>('ExperimentResource', ExperimentResourceSchema);