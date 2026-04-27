export type ControllerAction = [Record<string, any>, string] | Function;

export class Route {
    public method: string;
    public uri: string;
    public action: ControllerAction;
    
    // Additional configuration for this specific route
    public routeName?: string;
    public routeMiddleware: string[] = [];

    constructor(method: string, uri: string, action: ControllerAction) {
        this.method = method;
        this.uri = uri;
        this.action = action;
    }

    /**
     * Name the route.
     */
    public name(name: string): this {
        this.routeName = name;
        return this; // Returns the route itself for chaining
    }

    /**
     * Assign middleware to the route.
     */
    public middleware(middleware: string | string[]): this {
        const middlewares = Array.isArray(middleware) ? middleware : [middleware];
        this.routeMiddleware.push(...middlewares);
        return this;
    }

    public controller(controller: Function){
        this.action = controller;
        return this;
    }

    public prefix(prefix: string){
        this.uri = prefix + this.uri;
        return this;
    }

    public group(callback: Function){
        callback(this);
        return this;
    }
}