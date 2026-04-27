    export class Middleware {
        public aliases: Record<string, any> = {};

    public web(){
        
    }
        public alias(aliases: Record<string, any>): this {
            this.aliases = { ...this.aliases, ...aliases };
            return this;
        }
    }