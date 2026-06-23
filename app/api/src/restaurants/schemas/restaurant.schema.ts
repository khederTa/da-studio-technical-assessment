import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ _id: false })
export class TableConfig {
  @Prop({ required: true, min: 2 })
  size!: number;

  @Prop({ required: true, min: 0 })
  count!: number;
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, index: true })
  zone!: string;

  @Prop({ type: [TableConfig], required: true, default: [] })
  tables!: TableConfig[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);