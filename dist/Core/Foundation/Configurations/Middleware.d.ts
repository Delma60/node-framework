export declare class Middleware {
    aliases: Record<string, any>;
    webGroup: any[];
    apiGroup: any[];
    globalMiddlewares: any[];
    trustedProxies: string | string[] | boolean;
    alias(aliases: Record<string, any>): this;
    web(middlewares: any[]): this;
    api(middlewares: any[]): this;
    append(middleware: any): this;
    trustProxies(proxies: string | string[] | boolean): this;
}
//# sourceMappingURL=Middleware.d.ts.map