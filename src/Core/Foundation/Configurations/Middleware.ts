export class Middleware {
    public aliases: Record<string, any> = {};
    public webGroup: any[] = [];
    public apiGroup: any[] = [];
    
    // 🚀 NEW: Store global middlewares here
    public globalMiddlewares: any[] = []; 

    public trustedProxies: string | string[] | boolean = false;

    public alias(aliases: Record<string, any>): this {
        this.aliases = { ...this.aliases, ...aliases };
        return this;
    }

    public web(middlewares: any[]): this {
        this.webGroup.push(...middlewares);
        return this;
    }

    public api(middlewares: any[]): this {
        this.apiGroup.push(...middlewares);
        return this;
    }

    // 🚀 NEW: Append global middleware that runs on EVERY request
    public append(middleware: any): this {
        this.globalMiddlewares.push(middleware);
        return this;
    }

    public trustProxies(proxies: string | string[] | boolean): this {
        this.trustedProxies = proxies;
        return this;
    }
}