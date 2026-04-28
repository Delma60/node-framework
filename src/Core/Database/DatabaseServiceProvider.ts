import { ServiceProvider } from '../Support/ServiceProvider';
import { DatabaseManager } from './DatabaseManager';
import dbConfig from '../../config/database'; // Import the config!

export class DatabaseServiceProvider extends ServiceProvider {
    /**
     * Register any application services.
     */
    public register(): void {
        const dbManager = new DatabaseManager(dbConfig);
        this.app.bind('db', dbManager);
    }

    /**
     * Bootstrap any application services.
     */
    public async boot(): Promise<void> {
        // Nothing needed here for the DB right now
    }
}
