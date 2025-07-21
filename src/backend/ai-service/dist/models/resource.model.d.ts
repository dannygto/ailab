import mongoose, { Document } from 'mongoose';
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
export declare const ExperimentResourceModel: mongoose.Model<IExperimentResource, {}, {}, {}, mongoose.Document<unknown, {}, IExperimentResource, {}> & IExperimentResource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=resource.model.d.ts.map