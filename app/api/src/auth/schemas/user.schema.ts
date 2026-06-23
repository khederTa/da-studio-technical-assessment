import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: ['ADMIN', 'CASHIER'], default: 'CASHIER' })
  role!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  scopeUserId!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);