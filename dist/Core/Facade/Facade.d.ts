import { Container } from '../Foundation/Container';
export declare abstract class Facade {
    protected static container: Container;
    /**
     * The framework calls this during boot to give the Facades access to the container.
     */
    static setFacadeApplication(container: Container): void;
    /**
     * Every specific Facade (like Route or DB) MUST override this method
     * to tell the proxy what key to look for in the container.
     */
    protected static getFacadeAccessor(): string;
    /**
     * The magic Proxy factory.
     */
    static createProxy(): {};
}
//# sourceMappingURL=Facade.d.ts.map