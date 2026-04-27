import type { Application } from "../Foundation/Application";
export declare abstract class ServiceProvider {
    /**
     * The application/container instance.
     * Marked as protected so any class extending this one can access it via `this.app`.
     */
    app: Application;
    constructor(app: Application);
    /**
     * Phase 1: Register any application services.
     * * IMPORTANT: You should ONLY bind things into the container here.
     * You should NEVER attempt to resolve a service from the container
     * inside this method, because the service you want might not be
     * registered yet!
     */
    abstract register(): void;
    /**
     * Phase 2: Bootstrap any application services.
     * * This method is called after ALL other service providers have
     * been registered. Here, you can safely resolve any service from
     * the container knowing that they are fully available.
     * * (We provide an empty default implementation so child classes
     * aren't forced to write a boot method if they only need to register things).
     */
    boot(): Promise<void>;
}
//# sourceMappingURL=ServiceProvider.d.ts.map