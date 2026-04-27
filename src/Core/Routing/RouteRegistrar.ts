import { Router } from './Router';

export class RouteRegistrar {
    private router: Router;

    // The bucket holding the chained attributes
    private attributes: { prefix?: string; middleware?: string[]; controller?: any; routeName?: string } = {};

    constructor(router: Router) {
        this.router = router;
    }

    /**
     * Add a prefix to the bucket and return this registrar to allow more chaining.
     */
    public prefix(prefix: string): this {
        this.attributes.prefix = prefix;
        return this;
    }

    /**
     * Add middleware to the bucket.
     */
    public middleware(middleware: string | string[]): this {
        this.attributes.middleware = Array.isArray(middleware) ? middleware : [middleware];
        return this;
    }

    /**
     * Add a controller to the bucket.
     */
    public controller(controller: any): this {
        this.attributes.controller = controller;
        return this;
    }

    /**
     * The final call! Pass the collected attributes back to the main Router.
     */
    public group(callback: Function): void {
        this.router.group(this.attributes, callback);
    }

    public name(name: string): this {
        this.attributes.routeName = name;
        return this;
    }
}