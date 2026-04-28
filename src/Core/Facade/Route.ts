import { Facade } from './Facade';
import { Router } from '../Routing/Router';

class RouteFacade extends Facade {
    protected static getFacadeAccessor(): string {
        // This MUST match what you bind in the RouteServiceProvider!
        return 'router';
    }
}

// 🚀 The Magic: We cast the Proxy to the Router type. 
// Now developers get perfect IDE autocomplete, even though it's a dynamic Proxy!
export const Route = RouteFacade.createProxy() as unknown as Router;