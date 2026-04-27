import { Route } from './Route';
import { RouteRegistrar } from './RouteRegistrar';
import { ResourceRegistrar } from './ResourceRegistrar';
export interface GroupAttributes {
    prefix?: string;
    middleware?: string[];
    controller?: any;
}
export declare class Router {
    private routes;
    private groupStack;
    prefix(prefix: string): RouteRegistrar;
    middleware(middleware: string | string[]): RouteRegistrar;
    controller(controller: any): RouteRegistrar;
    name(name: string): RouteRegistrar;
    group(attributes: GroupAttributes, callback: Function): void;
    get(uri: string, action: [Object, string] | Function): Route;
    post(uri: string, action: [Object, string] | Function): Route;
    delete(uri: string, action: [Object, string] | Function): Route;
    resource(uri: string, controller: Object): ResourceRegistrar;
    private addRoute;
    getRoutes(): Route[];
    clear(): void;
}
//# sourceMappingURL=Router.d.ts.map