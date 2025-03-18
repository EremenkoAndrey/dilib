import type { IInjectionToken, Registry, StoreItem } from './types';

/**
 * Класс `InjectionToken` представляет собой токен, который используется для уникальной идентификации
 * зависимостей в DI-контейнере. Токены полезны, когда несколько зависимостей имеют одинаковый тип,
 * но должны быть разными экземплярами.
 *
 * @template T Тип объекта, который будет связан с этим токеном.
 * @template Params Тип параметров, которые могут быть переданы при создании объекта.
 */
export class InjectionToken<T, Params = void> implements IInjectionToken<T, Params>{
    protected _desc: string;

    /**
     * Создает новый экземпляр токена.
     *
     * @param desc Описание токена, которое помогает идентифицировать его в ошибках и логах.
     *
     * @example
     * const MY_TOKEN = new InjectionToken<MyService>('MyService');
     */
    constructor(desc: string) {
        this._desc = desc;
    }

    /**
     * Ищет зависимость, связанную с этим токеном, в реестре.
     *
     * @param registry Реестр, в котором хранятся зарегистрированные зависимости.
     * @returns Объект `StoreItem`, содержащий фабрику и экземпляр зависимости.
     * @throws Ошибка, если зависимость не найдена в реестре.
     *
     * @example
     * const storeItem = MY_TOKEN.find(registry);
     */
    public find(registry: Registry): StoreItem<T, Params> {
        const storeItem = registry.get(this);
        if (!storeItem) {
            throw new Error(`Token ${this._desc} is not registered`);
        }
        return storeItem;
    }

    /**
     * Возвращает описание токена в виде строки.
     *
     * @returns Описание токена.
     *
     * @example
     * console.log(MY_TOKEN.toString()); // "MyService"
     */
    public toString(): string {
        return this._desc;
    }
}
