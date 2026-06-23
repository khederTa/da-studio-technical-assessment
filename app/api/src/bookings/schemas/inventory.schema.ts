import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ _id: false })
export class TableAvailability {
  @Prop({ required: true, min: 2 })
  size!: number;

  @Prop({ required: true, min: 0 })
  totalTables!: number;

  @Prop({ required: true, min: 0, default: 0 })
  reservedTables!: number;
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: string;

  @Prop({ required: true, index: true })
  dateSlot!: string;

  @Prop({ type: [TableAvailability], required: true, default: [] })
  availableTables!: TableAvailability[];
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.index({ restaurantId: 1, dateSlot: 1 }, { unique: true });