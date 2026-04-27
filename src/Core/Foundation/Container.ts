export class Container {
    // Protected so the Application class can access it if absolutely necessary,
    // though we should generally stick to using bind() and make().
    protected bindings = new Map<string, any>();

    /**
     * Bind a service into the container.
     */
    public bind(key: string, instance: any): void {
        this.bindings.set(key, instance);
    }

    /**
     * Resolve a service out of the container.
     */
    public make<T>(key: string): T {
        if (!this.bindings.has(key)) {
            throw new Error(`Service [${key}] not found in container.`);
        }
        return this.bindings.get(key) as T;
    }
}