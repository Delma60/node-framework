import { Container } from '../Foundation/Container';

export abstract class Facade {
    // Holds the global application container
    protected static container: Container;

    /**
     * The framework calls this during boot to give the Facades access to the container.
     */
    public static setFacadeApplication(container: Container): void {
        Facade.container = container;
    }

    /**
     * Every specific Facade (like Route or DB) MUST override this method 
     * to tell the proxy what key to look for in the container.
     */
    protected static getFacadeAccessor(): string {
        throw new Error('Facade does not implement getFacadeAccessor method.');
    }

    /**
     * The magic Proxy factory.
     */
    public static createProxy() {
        return new Proxy({}, {
            get: (target, property: string) => {
                const accessor = this.getFacadeAccessor();
                
                if (!Facade.container) {
                    throw new Error("Facade application has not been set.");
                }

                // 1. Resolve the underlying instance from the IoC Container
                const instance = Facade.container.make<any>(accessor);
                
                if (!instance) {
                    throw new Error(`A facade root has not been set for [${accessor}].`);
                }

                // 2. Grab the requested property/method
                const member = instance[property];

                // 3. If it's a method, bind it to the instance so 'this' doesn't break
                if (typeof member === 'function') {
                    return member.bind(instance);
                }

                return member;
            }
        });
    }
}
