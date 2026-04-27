export type ControllerAction = [Record<string, any>, string] | Function;
export declare class Route {
    method: string;
    uri: string;
    action: ControllerAction;
    routeName?: string;
    routeMiddleware: string[];
    constructor(method: string, uri: string, action: ControllerAction);
    /**
     * Name the route.
     */
    name(name: string): this;
    /**
     * Assign middleware to the route.
     */
    middleware(middleware: string | string[]): this;
    controller(controller: Function): this;
    prefix(prefix: string): this;
    group(callback: Function): this;
}
//# sourceMappingURL=Route.d.ts.map