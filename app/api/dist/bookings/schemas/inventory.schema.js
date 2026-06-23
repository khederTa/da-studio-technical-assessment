"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventorySchema = exports.Inventory = exports.TableAvailability = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TableAvailability = class TableAvailability {
    size;
    totalTables;
    reservedTables;
};
exports.TableAvailability = TableAvailability;
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 2 }),
    __metadata("design:type", Number)
], TableAvailability.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], TableAvailability.prototype, "totalTables", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, default: 0 }),
    __metadata("design:type", Number)
], TableAvailability.prototype, "reservedTables", void 0);
exports.TableAvailability = TableAvailability = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TableAvailability);
let Inventory = class Inventory {
    restaurantId;
    dateSlot;
    availableTables;
};
exports.Inventory = Inventory;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Restaurant', required: true }),
    __metadata("design:type", String)
], Inventory.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Inventory.prototype, "dateSlot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TableAvailability], required: true, default: [] }),
    __metadata("design:type", Array)
], Inventory.prototype, "availableTables", void 0);
exports.Inventory = Inventory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Inventory);
exports.InventorySchema = mongoose_1.SchemaFactory.createForClass(Inventory);
exports.InventorySchema.index({ restaurantId: 1, dateSlot: 1 }, { unique: true });
//# sourceMappingURL=inventory.schema.js.map