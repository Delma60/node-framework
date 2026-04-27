import { Route } from './Route';

export class ResourceRegistrar {
    private routes: Route[];

    constructor(routes: Route[]) {
        this.routes = routes;
    }

    public middleware(middleware: string | string[]): this {
        const middlewares = Array.isArray(middleware) ? middleware : [middleware];

        for (const route of this.routes) {
            route.middleware(middlewares);
        }

        return this;
    }

    public prefix(prefix: string): this {
        for (const route of this.routes) {
            route.prefix(prefix);
        }

        return this;
    }

    public name(name: string): this {
        for (const route of this.routes) {
            route.name(name);
        }

        return this;
    }
}
