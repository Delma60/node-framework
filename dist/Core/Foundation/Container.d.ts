export declare class Container {
    protected bindings: Map<string, any>;
    /**
     * Bind a service into the container.
     */
    bind(key: string, instance: any): void;
    /**
     * Resolve a service out of the container.
     */
    make<T>(key: string): T;
}
//# sourceMappingURL=Container.d.ts.map