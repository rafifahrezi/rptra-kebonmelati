"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var adminSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    lastLogin: { type: Date, default: null },
});
var Admin = mongoose_1.default.models.Admin || mongoose_1.default.model('Admin', adminSchema, 'Admins');
exports.default = Admin;
