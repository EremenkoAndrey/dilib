/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Constructor<T extends object> {
    new(...args: any[]): T;
}

export type GetOptions<Params> = {
    singleton?: boolean,
    params?: Params
}

export type StoreItem<T, Params> = {
    initialized: boolean,
    factory: ServiceFactory<T, Params>,
    instance: T | null
}

export interface IInjectionToken<T, Params = void> {
    find(registry: Registry): StoreItem<T, Params>;
}

export type Registry = Map<Function | IInjectionToken<any, any>, StoreItem<any, any>>;

export interface IInjector {
    get<T extends object, Params>(constructor: Constructor<T> | IInjectionToken<T, Params>, options: GetOptions<Params>): T;

    get<T extends object>(constructor: Constructor<T> | IInjectionToken<T>): T;
}

export type ServiceFactory<T, Params> = (injector: IInjector, params: Params) => T;


