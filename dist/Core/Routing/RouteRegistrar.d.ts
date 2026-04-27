import { Router } from './Router';
export declare class RouteRegistrar {
    private router;
    private attributes;
    constructor(router: Router);
    /**
     * Add a prefix to the bucket and return this registrar to allow more chaining.
     */
    prefix(prefix: string): this;
    /**
     * Add middleware to the bucket.
     */
    middleware(middleware: string | string[]): this;
    /**
     * Add a controller to the bucket.
     */
    controller(controller: any): this;
    /**
     * The final call! Pass the collected attributes back to the main Router.
     */
    group(callback: Function): void;
    name(name: string): this;
}
//# sourceMappingURL=RouteRegistrar.d.ts.map