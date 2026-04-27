// src/foundation/Application.ts
import { RouteServiceProvider } from "../Routing/RouteServiceProvider";
import { ServiceProvider } from "../Support/ServiceProvider";
import { Middleware } from "./Configurations/Middleware";
import { Container } from "./Container";

export class Application extends Container {
    
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

    public withRouting(options: { web?: string, api?: string }): this {
        this.bind('routing.options', options);
        return this; 
    }

    public create(): this {
        console.log(`✅ Application built with base path: ${this.basePath}`);
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
            console.log(`Registering provider: ${ProviderClass.name}`);
            this.register(ProviderClass);
        }
        
        return this;
    }

    public async boot(): Promise<void> {
        console.log(`🚀 Booting application...`);
        for (const provider of this.providers) {
            console.log(`Booting provider: ${provider.constructor.name}`);
            if (provider.boot) {
                await provider.boot();
            }
        }
        console.log("🚀 Application booted successfully.");
    }
}