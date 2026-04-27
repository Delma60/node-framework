import { Route } from './Route';
import { RouteRegistrar } from './RouteRegistrar';
import { ResourceRegistrar } from './ResourceRegistrar';

export interface GroupAttributes {
    prefix?: string;
    middleware?: string[];
    controller?: any;
}

export class Router {
    private routes: Route[] = [];
    private groupStack: GroupAttributes[] = [];

    // --- Fluent Entry Points ---

    public prefix(prefix: string): RouteRegistrar {
        return new RouteRegistrar(this).prefix(prefix);
    }

    public middleware(middleware: string | string[]): RouteRegistrar {
        return new RouteRegistrar(this).middleware(middleware);
    }

    public controller(controller: any): RouteRegistrar {
        return new RouteRegistrar(this).controller(controller);
    }

    public name(name: string): RouteRegistrar {
        return new RouteRegistrar(this).name(name);
    }

    // --- Core Methods ---

    public group(attributes: GroupAttributes, callback: Function): void {
        this.groupStack.push(attributes);
        callback();
        this.groupStack.pop();
    }

    public get(uri: string, action: [Object, string] |Function): Route {
        return this.addRoute('get', uri, action);
    }

    public post(uri: string, action: [Object, string] | Function): Route {
        return this.addRoute('post', uri, action);
    }

    public delete(uri: string, action: [Object, string] | Function): Route {
        return this.addRoute('delete', uri, action);
    }

    public resource(uri: string, controller: Object): ResourceRegistrar {
        // Define the standard CRUD routes for a resource
        const resourceRoutes = [
            this.addRoute('get', `/${uri}`, [controller, 'index']),
            this.addRoute('post', `/${uri}`, [controller, 'store']),
            this.addRoute('put', `/${uri}/:id`, [controller, 'update']),
            this.addRoute('patch', `/${uri}/:id`, [controller, 'update']),
            this.addRoute('delete', `/${uri}/:id`, [controller, 'destroy']),
        ];

        return new ResourceRegistrar(resourceRoutes);
    }

    private addRoute(method: string, uri: string, action: [Object, string] | Function): Route {
        // 1. Create the new Route instance
        const route = new Route(method, uri, action);

        // 2. Apply group attributes if we're in a group
        if (this.groupStack.length > 0) {
            const currentGroup = this.groupStack[this.groupStack.length - 1];

            if (currentGroup?.prefix) {
                route.prefix(currentGroup.prefix);
            }

            if (currentGroup?.middleware) {
                route.middleware(currentGroup.middleware);
            }

            if (currentGroup?.controller && typeof action === 'string') {
                // If action is a string method name and we have a controller, resolve it
                route.controller(currentGroup.controller.prototype[action].bind(currentGroup.controller));
            }
        }

        // 3. Save it to our collection
        this.routes.push(route);

        // 4. Return the instance so the user can chain ->name() or ->middleware()
        return route;
    }

    public getRoutes(): Route[] {
        return this.routes;
    }

    public clear(): void {
        this.routes = [];
    }
}