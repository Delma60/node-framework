export class Middleware {
    public aliases: Record<string, any> = {};
    
    // Arrays to hold class references for specific route groups
    public webGroup: any[] = [];
    public apiGroup: any[] = [];

    // Express trust proxy configuration
    public trustedProxies: string | string[] | boolean = false;

    /**
     * Register route middleware aliases.
     */
    public alias(aliases: Record<string, any>): this {
        this.aliases = { ...this.aliases, ...aliases };
        return this;
    }

    /**
     * Append middlewares to the 'web' route group.
     */
    public web(middlewares: any[]): this {
        this.webGroup.push(...middlewares);
        return this;
    }

    /**
     * Append middlewares to the 'api' route group.
     */
    public api(middlewares: any[]): this {
        this.apiGroup.push(...middlewares);
        return this;
    }

    /**
     * Configure trusted proxies for the application.
     */
    public trustProxies(proxies: string | string[] | boolean): this {
        this.trustedProxies = proxies;
        return this;
    }
}