import mongoose, { Schema, Document } from "mongoose";

export interface IStrategy extends Document {
  user: mongoose.Types.ObjectId | string | null;        // Each user has their own strategies
  name: string;        // Name of the setup (Breakout, Reversal, Scalping etc.)
  description?: string; // Optional detailed explanation
  tags?: string[];      // Optional keywords (trend, momentum, risk etc.)
}

const StrategySchema = new Schema<IStrategy>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true },

    description: { type: String },

    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Strategy ||
  mongoose.model<IStrategy>("Strategy", StrategySchema);
