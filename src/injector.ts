/* eslint-disable @typescript-eslint/ban-types */

import { InjectionToken } from './injection-token';

import type {
    Constructor,
    GetOptions,
    IInjectionToken,
    Registry,
    ServiceFactory,
    StoreItem
} from './types';

/**
 * Класс `Injector` реализует контейнер для управления зависимостями (Dependency Injection).
 * Он позволяет регистрировать фабрики для создания объектов и управлять их жизненным циклом
 * (например, создавать синглтоны или новые экземпляры при каждом запросе).
 */
export class Injector {
    private _registry: Registry = new Map();

    /**
     * Регистрирует фабрику для создания объекта типа `T`.
     *
     * @param factory Фабрика, которая создает объект типа `T`.
     * @param key Конструктор класса или токен, который будет использоваться для поиска зависимости.
     * @param token Опциональный токен, который также может быть использован для поиска зависимости.
     *
     * @example
     * injector.add<EventEmitter>(() => new EventEmitter(), EventEmitter);
     * injector.add<StorageProvider>(() => new StorageProvider(Token), StorageProvider);
     */
    public add<T extends object, Params = void>(factory: ServiceFactory<T, Params>, key: Constructor<T>, token?: IInjectionToken<T, Params>) {
        const storeItem: StoreItem<T, Params> = {
            initialized: false,
            factory,
            instance: null
        };
        if (token) {
            this._registry.set(token, storeItem);
        }
        this._registry.set(key, storeItem);
    }

    /**
     * Получает экземпляр объекта типа `T` из контейнера.
     * Если зависимость зарегистрирована как синглтон, возвращается один и тот же экземпляр.
     * Если нет, создается новый экземпляр.
     *
     * @param Key Конструктор класса или токен, по которому ищется зависимость.
     * @param options Опции для получения зависимости (например, параметры для фабрики и флаг `singleton`).
     * @returns Экземпляр объекта типа `T`.
     *
     * @example
     * const eventEmitter = injector.get<EventEmitter>(EventEmitter);
     * const contourService = injector.get<ContourService>(ContourService, { singleton: false });
     */
    public get<T extends object, Params = void>(Key: Constructor<T> | IInjectionToken<T, Params>, options: GetOptions<Params> = {}): T {
        const { singleton = true, params } = options;
        const storeItem = Key instanceof InjectionToken
            ? Key.find(this._registry)
            : this._registry.get(Key);
        if (!storeItem) {
            throw new Error(`${Key} is not registered`);
        }
        if (!singleton) {
            return storeItem.factory(this, params as Params);
        }
        if (storeItem.initialized) {
            if (storeItem.instance) {
                return storeItem.instance;
            } else {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const injector = this; // eslint-disable-line consistent-this
                return new Proxy(
                    {},
                    {
                        get(_, prop, receiver) {
                            // get instance from di-container
                            const target: Object = injector.get<T, Params>(Key);
                            if (typeof target !== 'object') {
                                throw new Error(`DI: instance of ${Key} not found`);
                            }
                            // getter is redirected to real object
                            return Reflect.get(target, prop, receiver);
                        },
                        set(_, prop, val, receiver) {
                            const target: Object = injector.get<T, Params>(Key);
                            if (typeof target !== 'object') {
                                throw new Error(`DI: instance of ${Key} not found`);
                            }
                            return Reflect.set(target, prop, val, receiver);
                        }
                    }
                ) as T;
            }
        }
        storeItem.initialized = true;

        storeItem.instance = storeItem.factory(this, params as Params);
        return storeItem.instance;
    }
}
