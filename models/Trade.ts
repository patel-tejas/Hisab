import mongoose, { Schema, Document } from "mongoose";

export interface ITrade extends Document {
  user: mongoose.Types.ObjectId | string | null;
  symbol: string;
  date: Date;
  type: "long" | "short";

  quantity: number;
  entryPrice: number;
  exitPrice: number;

  entryTime?: string;
  exitTime?: string;

  totalAmount: number;
  pnl: number;
  pnlPercent: number;

  stopLoss?: number;
  target?: number;

  strategy: string;   // FIXED ✔

  outcome: string;

  entryConfidence: number;
  satisfaction: number;
  emotionalState?: string;
  mistakes: string[];

  notes?: string;
  lessonsLearned?: string;

  images: string[];

  source?: "manual" | "dhan";
  brokerOrderId?: string;
}

const TradeSchema = new Schema<ITrade>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    symbol: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["long", "short"], required: true },

    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },

    entryTime: { type: String }, // HH:mm
    exitTime: { type: String }, // HH:mm

    totalAmount: { type: Number, required: true },
    pnl: { type: Number, required: true },
    pnlPercent: { type: Number, required: true },

    stopLoss: Number,
    target: Number,

    strategy: { type: String, required: true },

    outcome: { type: String, default: "success" },

    entryConfidence: { type: Number, default: 5 },
    satisfaction: { type: Number, default: 5 },
    emotionalState: String,
    mistakes: [String],

    notes: String,
    lessonsLearned: String,

    images: { type: [String], default: [] },

    source: { type: String, enum: ["manual", "dhan"], default: "manual" },
    brokerOrderId: { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Trade ||
  mongoose.model<ITrade>("Trade", TradeSchema);
