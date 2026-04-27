export declare class Middleware {
    aliases: Record<string, any>;
    webGroup: any[];
    apiGroup: any[];
    trustedProxies: string | string[] | boolean;
    /**
     * Register route middleware aliases.
     */
    alias(aliases: Record<string, any>): this;
    /**
     * Append middlewares to the 'web' route group.
     */
    web(middlewares: any[]): this;
    /**
     * Append middlewares to the 'api' route group.
     */
    api(middlewares: any[]): this;
    /**
     * Configure trusted proxies for the application.
     */
    trustProxies(proxies: string | string[] | boolean): this;
}
//# sourceMappingURL=Middleware.d.ts.map