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
exports.RestaurantSchema = exports.Restaurant = exports.TableConfig = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let TableConfig = class TableConfig {
    size;
    count;
};
exports.TableConfig = TableConfig;
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 2 }),
    __metadata("design:type", Number)
], TableConfig.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], TableConfig.prototype, "count", void 0);
exports.TableConfig = TableConfig = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TableConfig);
let Restaurant = class Restaurant {
    name;
    zone;
    tables;
};
exports.Restaurant = Restaurant;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "zone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TableConfig], required: true, default: [] }),
    __metadata("design:type", Array)
], Restaurant.prototype, "tables", void 0);
exports.Restaurant = Restaurant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Restaurant);
exports.RestaurantSchema = mongoose_1.SchemaFactory.createForClass(Restaurant);
//# sourceMappingURL=restaurant.schema.js.map