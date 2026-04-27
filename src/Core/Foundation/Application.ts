// src/foundation/Application.ts
import { RouteServiceProvider } from "../Routing/RouteServiceProvider";
import { ServiceProvider } from "../Support/ServiceProvider";
import { Middleware } from "./Configurations/Middleware";
import { Container } from "./Container";
import { ExceptionHandler } from "./Exceptions/Handler";

interface Interface{
    basePath: string;
    withMiddleware(callback?: (middleware: Middleware) => Promise<void> | void): this;
    withRouting(options: { web?: string, api?: string }): this;
    create(): this;
    register(ProviderClass: new (app: Application) => ServiceProvider): void;
    withProviders(providers: Array<new (app: Application) => ServiceProvider>): this;
    boot(): Promise<void>;
    withExceptions(callback: (exception: ExceptionHandler) => Promise<void> | void): this;
}
export class Application extends Container implements Interface {
    
    // Instance properties, not static!
    public basePath: string;
    private providers: ServiceProvider[] = [];

    // The constructor sets up the initial state
    constructor(basePath: string = "") {
        super();
        this.basePath = basePath;
        
        // Bonus: Bind the app to itself so providers can resolve the core app if needed
        this.bind('app', this);
    }

    /**
     * The Laravel 11 Entry Point (Static Factory)
     * This allows: Application.configure(path).withRouting(...).create()
     */
    public static configure(basePath: string): Omit<Application, 'withProviders'> {
        return (new Application(basePath)).withProviders([
            RouteServiceProvider,
        ]);
    }

    // --- All methods below are now INSTANCE methods ---

    public withMiddleware(callback?: (middleware: Middleware) => Promise<void> | void): this {
        const middleware = new Middleware();
        if (callback) {
            callback(middleware);
        }
        return this;
    }



    public withExceptions(callback?: (exceptions: ExceptionHandler) => void): this {
        // 1. Create the default exception handler
        const handler = new ExceptionHandler();

        // 2. If the developer wants to add custom logic later, they can use the callback
        if (callback) {
            callback(handler);
        }

        // 3. Bind it to the container so the Router can grab it later
        this.bind('exception.handler', handler);
        
        return this;
    }

    public withRouting(options: { web?: string, api?: string }): this {
        this.bind('routing.options', options);
        return this; 
    }

    public create(): this {
        this.boot()
        return this;
    }

    public register(ProviderClass: new (app: Application) => ServiceProvider): void {
        // 'this' is now properly an Application instance!
        const provider = new ProviderClass(this);
        provider.register();
        this.providers.push(provider);
    }

    public withProviders(providers: Array<new (app: Application) => ServiceProvider>): this {
        for (const ProviderClass of providers) {
            this.register(ProviderClass);
        }
        
        return this;
    }

    public async boot(): Promise<void> {
        for (const provider of this.providers) {
            if (provider.boot) {
                await provider.boot();
            }
        }
    }
}