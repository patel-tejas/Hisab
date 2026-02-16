import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrokerConnection {
  broker: string;
  clientId: string;
  accessToken: string;          // encrypted
  lastSynced?: Date;
  isActive: boolean;
}

export interface IUser extends Document {
  name?: string;
  email?: string;
  username: string;
  password: string;
  brokerConnections: IBrokerConnection[];
}

const BrokerConnectionSchema = new Schema(
  {
    broker: { type: String, required: true },       // "dhan"
    clientId: { type: String, required: true },
    accessToken: { type: String, required: true },  // encrypted at rest
    lastSynced: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, sparse: true, unique: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    brokerConnections: { type: [BrokerConnectionSchema], default: [] },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
