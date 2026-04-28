"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseServiceProvider = void 0;
const ServiceProvider_1 = require("../Support/ServiceProvider");
const DatabaseManager_1 = require("./DatabaseManager");
const database_1 = __importDefault(require("../../config/database")); // Import the config!
class DatabaseServiceProvider extends ServiceProvider_1.ServiceProvider {
    /**
     * Register any application services.
     */
    register() {
        const dbManager = new DatabaseManager_1.DatabaseManager(database_1.default);
        this.app.bind('db', dbManager);
    }
    /**
     * Bootstrap any application services.
     */
    async boot() {
        // Nothing needed here for the DB right now
    }
}
exports.DatabaseServiceProvider = DatabaseServiceProvider;
//# sourceMappingURL=DatabaseServiceProvider.js.map