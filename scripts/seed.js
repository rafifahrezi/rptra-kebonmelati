"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
var mongoose_1 = require("mongoose");
var bcrypt = require("bcryptjs");
var mongoose_2 = require("../lib/mongoose");
var Admin_1 = require("../models/Admin");
// Data admin untuk seeding
var adminData = [
    {
        username: 'Tasya',
        email: 'tasya@gmail.com',
        password: 'tasyacantik',
        role: 'superadmin',
        lastLogin: null,
    },
    {
        username: 'superadmin1',
        email: 'superadmin1@example.com',
        password: 'superadmin123',
        role: 'superadmin',
        lastLogin: null,
    },
    {
        username: 'admin1',
        email: 'admin1@example.com',
        password: 'admin123',
        role: 'admin',
        lastLogin: null,
    },
    {
        username: 'admin2',
        email: 'admin2@example.com',
        password: 'admin123',
        role: 'admin',
        lastLogin: null,
    },
];
function seedAdmins() {
    return __awaiter(this, void 0, void 0, function () {
        var AdminModel, collections, collectionExists, beforeCount, _i, adminData_1, admin, existingAdmin, hashedPassword, newAdmin, afterCount, allAdmins, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 12, 13, 16]);
                    // Hubungkan ke database
                    return [4 /*yield*/, (0, mongoose_2.default)()];
                case 1:
                    // Hubungkan ke database
                    _b.sent();
                    AdminModel = Admin_1.default;
                    return [4 /*yield*/, ((_a = mongoose_1.default.connection.db) === null || _a === void 0 ? void 0 : _a.listCollections().toArray())];
                case 2:
                    collections = _b.sent();
                    collectionExists = collections === null || collections === void 0 ? void 0 : collections.some(function (col) { return col.name === 'Admins'; });
                    console.log('Collection Admins exists:', collectionExists);
                    return [4 /*yield*/, AdminModel.countDocuments()];
                case 3:
                    beforeCount = _b.sent();
                    console.log('Admins before seeding:', beforeCount);
                    _i = 0, adminData_1 = adminData;
                    _b.label = 4;
                case 4:
                    if (!(_i < adminData_1.length)) return [3 /*break*/, 9];
                    admin = adminData_1[_i];
                    return [4 /*yield*/, AdminModel.findOne({
                            $or: [{ email: admin.email }, { username: admin.username }],
                        })];
                case 5:
                    existingAdmin = _b.sent();
                    if (existingAdmin) {
                        console.log("Admin ".concat(admin.email, " or ").concat(admin.username, " already exists, skipping..."));
                        return [3 /*break*/, 8];
                    }
                    return [4 /*yield*/, bcrypt.hash(admin.password, 10)];
                case 6:
                    hashedPassword = _b.sent();
                    newAdmin = new AdminModel({
                        username: admin.username,
                        email: admin.email,
                        password: hashedPassword,
                        role: admin.role,
                        lastLogin: admin.lastLogin,
                    });
                    // Simpan ke database
                    return [4 /*yield*/, newAdmin.save()];
                case 7:
                    // Simpan ke database
                    _b.sent();
                    console.log("Admin ".concat(admin.username, " created successfully at"), new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9: return [4 /*yield*/, AdminModel.countDocuments()];
                case 10:
                    afterCount = _b.sent();
                    console.log("Total admins after seeding: ".concat(afterCount));
                    return [4 /*yield*/, AdminModel.find({}, 'username email role')];
                case 11:
                    allAdmins = _b.sent();
                    console.log('All admins in collection:', allAdmins);
                    console.log('Seeding completed!');
                    return [3 /*break*/, 16];
                case 12:
                    error_1 = _b.sent();
                    console.error('Seeding failed:', error_1);
                    return [3 /*break*/, 16];
                case 13: 
                // Tambahkan delay kecil untuk memastikan semua operasi selesai
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 14:
                    // Tambahkan delay kecil untuk memastikan semua operasi selesai
                    _b.sent();
                    // Tutup koneksi
                    return [4 /*yield*/, mongoose_1.default.connection.close()];
                case 15:
                    // Tutup koneksi
                    _b.sent();
                    console.log('Database connection closed');
                    process.exit(0);
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Jalankan fungsi seeding
seedAdmins();
