import { NestFactory } from '@nestjs/core';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { Restaurant, RestaurantSchema } from '../restaurants/schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/theme-park'),
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
  ],
})
class SeederModule {}

async function bootstrapSeed() {
  console.log('🌱 Initiating database seeding sequence...');

  const app = await NestFactory.createApplicationContext(SeederModule);
  const restaurantModel = app.get<Model<Restaurant>>(getModelToken(Restaurant.name));

  const csvPath = process.env.CSV_PATH || path.resolve(__dirname, '../../../../data/restaurants.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Operation failed: CSV source missing at path: ${csvPath}`);
    await app.close();
    process.exit(1);
  }

  const rawContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = rawContent.split('\n').map(line => line.trim()).filter(Boolean);

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  await restaurantModel.deleteMany({});

  const restaurantMap = new Map<string, { name: string; zone: string; tables: Map<number, number> }>();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const recordMap: Record<string, string> = {};
    headers.forEach((header, idx) => {
      recordMap[header] = values[idx];
    });

    const name = recordMap['restaurant_name'];
    const zone = recordMap['location'];
    const tableSize = parseInt(recordMap['table_size'], 10);
    const tableCount = parseInt(recordMap['table_count'], 10);

    if (!name || isNaN(tableSize) || isNaN(tableCount)) continue;

    if (!restaurantMap.has(name)) {
      restaurantMap.set(name, { name, zone, tables: new Map() });
    }

    const restaurant = restaurantMap.get(name)!;
    restaurant.tables.set(tableSize, (restaurant.tables.get(tableSize) || 0) + tableCount);
  }

  let recordsInserted = 0;

  for (const [, entry] of restaurantMap) {
    const tables = Array.from(entry.tables.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => a.size - b.size);

    await restaurantModel.create({
      name: entry.name,
      zone: entry.zone,
      tables,
    });

    recordsInserted++;
  }

  console.log(`✅ Success: ${recordsInserted} themed restaurant configurations seeded smoothly.`);
  await app.close();
  process.exit(0);
}

bootstrapSeed().catch(async (error) => {
  console.error('💥 Critical exception caught during seeding execution context:', error);
  process.exit(1);
});
