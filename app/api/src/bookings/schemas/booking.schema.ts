import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, unique: true, index: true })
  idempotencyKey!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: string;

  @Prop({ required: true })
  dateSlot!: string;

  @Prop({ required: true, min: 1 })
  partySize!: number;

  @Prop({ required: true, min: 2 })
  assignedTableSize!: number;

  @Prop({ required: true, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' })
  status!: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);