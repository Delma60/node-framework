import { Route } from './Route';
export declare class ResourceRegistrar {
    private routes;
    constructor(routes: Route[]);
    middleware(middleware: string | string[]): this;
    prefix(prefix: string): this;
    name(name: string): this;
}
//# sourceMappingURL=ResourceRegistrar.d.ts.map