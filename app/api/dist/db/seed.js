"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const restaurant_schema_1 = require("../restaurants/schemas/restaurant.schema");
let SeederModule = class SeederModule {
};
SeederModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/theme-park'),
            mongoose_1.MongooseModule.forFeature([{ name: restaurant_schema_1.Restaurant.name, schema: restaurant_schema_1.RestaurantSchema }]),
        ],
    })
], SeederModule);
async function bootstrapSeed() {
    console.log('🌱 Initiating database seeding sequence...');
    const app = await core_1.NestFactory.createApplicationContext(SeederModule);
    const restaurantModel = app.get((0, mongoose_1.getModelToken)(restaurant_schema_1.Restaurant.name));
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
    const restaurantMap = new Map();
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length)
            continue;
        const recordMap = {};
        headers.forEach((header, idx) => {
            recordMap[header] = values[idx];
        });
        const name = recordMap['restaurant_name'];
        const zone = recordMap['location'];
        const tableSize = parseInt(recordMap['table_size'], 10);
        const tableCount = parseInt(recordMap['table_count'], 10);
        if (!name || isNaN(tableSize) || isNaN(tableCount))
            continue;
        if (!restaurantMap.has(name)) {
            restaurantMap.set(name, { name, zone, tables: new Map() });
        }
        const restaurant = restaurantMap.get(name);
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
//# sourceMappingURL=seed.js.map