import { ServiceProvider } from '../Support/ServiceProvider';
export declare class RouteServiceProvider extends ServiceProvider {
    private resolveRouteFile;
    private resolveRouteHandler;
    /**
     * Wraps the developer's route handler to automatically parse return values
     * exactly like Laravel's Router::toResponse() method.
     */
    private wrapHandler;
    register(): void;
    boot(): Promise<void>;
}
//# sourceMappingURL=RouteServiceProvider.d.ts.map