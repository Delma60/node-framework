import { ServiceProvider } from "../Support/ServiceProvider";
import { Middleware } from "./Configurations/Middleware";
import { Container } from "./Container";
import { ExceptionHandler } from "./Exceptions/Handler";
interface Interface {
    basePath: string;
    withMiddleware(callback?: (middleware: Middleware) => Promise<void> | void): this;
    withRouting(options: {
        web?: string;
        api?: string;
    }): this;
    create(): Promise<Application>;
    register(ProviderClass: new (app: Application) => ServiceProvider): void;
    withProviders(providers: Array<new (app: Application) => ServiceProvider>): this;
    boot(): Promise<void>;
    withExceptions(callback?: (exception: ExceptionHandler) => Promise<void> | void): this;
}
export declare class Application extends Container implements Interface {
    basePath: string;
    private providers;
    constructor(basePath?: string);
    /**
     * The Laravel 11 Entry Point (Static Factory)
     * This allows: Application.configure(path).withRouting(...).create()
     */
    static configure(basePath: string): Omit<Application, 'withProviders'>;
    withMiddleware(callback?: (middleware: Middleware) => Promise<void> | void): this;
    withExceptions(callback?: (exceptions: ExceptionHandler) => void): this;
    withRouting(options: {
        web?: string;
        api?: string;
    }): this;
    create(): Promise<this>;
    register(ProviderClass: new (app: Application) => ServiceProvider): void;
    withProviders(providers: Array<new (app: Application) => ServiceProvider>): this;
    boot(): Promise<void>;
}
export {};
//# sourceMappingURL=Application.d.ts.map