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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
class RegisterDto {
    name;
    email;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100, { message: 'Names must be constrained between 2 and 100 characters.' }),
    (0, class_validator_1.Matches)(/^\p{L}+(?:[\s'-]\p{L}+)*$/u, {
        message: 'Name can only contain alphabetic structures, spaces, hyphens, or apostrophes.'
    }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? (0, sanitize_html_1.default)(value.trim(), { allowedTags: [], allowedAttributes: {} }) : value),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)({}, { message: 'A structurally compliant email handle is required.' }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? (0, sanitize_html_1.default)(value.toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} }) : value),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
        message: 'Password must match complexity policies: minimum 8 characters, containing 1 uppercase letter and 1 number.',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
//# sourceMappingURL=register.dto.js.map