import { Facade } from './Facade';
import { DatabaseManager } from '../Database/DatabaseManager';

class DBFacade extends Facade {
    protected static getFacadeAccessor(): string {
        return 'db';
    }
}

export const DB = DBFacade.createProxy() as unknown as DatabaseManager;