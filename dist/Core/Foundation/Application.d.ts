import { ServiceProvider } from "../Support/ServiceProvider";
import { Middleware } from "./Configurations/Middleware";
import { Container } from "./Container";
export declare class Application extends Container {
    basePath: string;
    private providers;
    constructor(basePath?: string);
    /**
     * The Laravel 11 Entry Point (Static Factory)
     * This allows: Application.configure(path).withRouting(...).create()
     */
    static configure(basePath: string): Omit<Application, 'withProviders'>;
    withMiddleware(callback?: (middleware: Middleware) => Promise<void> | void): this;
    withRouting(options: {
        web?: string;
        api?: string;
    }): this;
    create(): this;
    register(ProviderClass: new (app: Application) => ServiceProvider): void;
    withProviders(providers: Array<new (app: Application) => ServiceProvider>): this;
    boot(): Promise<void>;
}
//# sourceMappingURL=Application.d.ts.map