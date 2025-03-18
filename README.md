# DiLib

DiLib — это простая и мощная библиотека для реализации Dependency Injection (DI) в JavaScript и TypeScript приложениях. Она позволяет управлять зависимостями, создавать синглтоны и внедрять параметры в фабрики.
Основные возможности

    Регистрация зависимостей: Регистрируйте классы или фабрики для создания объектов.

    Синглтоны: Управляйте жизненным циклом объектов, создавая их как синглтоны или новые экземпляры.

    Токены: Используйте токены для уникальной идентификации зависимостей.

    Параметры: Передавайте параметры в фабрики для гибкого создания объектов.

    TypeScript поддержка: Полная поддержка TypeScript с автоматической генерацией типов.

## Установка

Установите библиотеку через npm:

```npm install dilib```

## Использование
1. **Регистрация и получение зависимостей**
  
Пример с классом

```typescript
import { Injector } from 'dilib';

class MyService {
    greet() {
        console.log('Hello from MyService!');
    }
}

const injector = new Injector();

// Регистрируем MyService
injector.add<MyService>(() => new MyService(), MyService);

// Получаем экземпляр MyService
const myService = injector.get<MyService>(MyService);
myService.greet(); // "Hello from MyService!"
```

Пример с параметрами

```typescript
import { Injector } from 'dilib';

class Logger {
    constructor(private name: string) {}

    log(message: string) {
        console.log(`[${this.name}] ${message}`);
    }
}

const injector = new Injector();

// Регистрируем Logger с параметрами
injector.add<Logger>(
	(injector, params: { name: string }) => new Logger(params.name),
	Logger
);

// Получаем Logger с параметрами
const logger = injector.get<Logger>(Logger, { params: { name: 'AppLogger' } });
logger.log('This is a log message'); // "[AppLogger] This is a log message"
```

2. **Использование токенов**

Токены полезны, когда у вас есть несколько зависимостей одного типа.

```typescript
import { Injector, InjectionToken } from 'dilib';

const MY_TOKEN = new InjectionToken<string>('MyToken');

const injector = new Injector();

// Регистрируем значение по токену
injector.add<string>(
    () => 'This is a token value',
    String, // Используем String как ключ (можно использовать любой конструктор)
    MY_TOKEN
);

// Получаем значение по токену
const value = injector.get<string>(MY_TOKEN);
console.log(value); // "This is a token value"
```

3. **Синглтоны**

По умолчанию все зависимости регистрируются как синглтоны.
Вы можете отключить это поведение.

```typescript
import { Injector } from 'dilib';

class Counter {
    private count = 0;

    increment() {
        this.count++;
        console.log(`Count: ${this.count}`);
    }
}

const injector = new Injector();

// Регистрируем Counter как синглтон
injector.add<Counter>(() => new Counter(), Counter);

// Получаем экземпляр Counter
const counter1 = injector.get<Counter>(Counter);
counter1.increment(); // "Count: 1"

// Получаем тот же экземпляр Counter
const counter2 = injector.get<Counter>(Counter);
counter2.increment(); // "Count: 2"

// Создаем новый экземпляр Counter
const counter3 = injector.get<Counter>(Counter, { singleton: false });
counter3.increment(); // "Count: 1"
```

4. **Вложенные и циклические зависимости**

Библиотека поддерживает вложенные зависимости.
Например, один сервис может зависеть от другого

```typescript
import { Injector } from 'dilib';

class Database {
    connect() {
        console.log('Database connected');
    }
}

class UserService {
    constructor(private database: Database) {}

    getUsers() {
        this.database.connect();
        console.log('Fetching users...');
    }
}

const injector = new Injector();

// Регистрируем Database
injector.add<Database>(() => new Database(), Database);

// Регистрируем UserService, который зависит от Database
injector.add<UserService>(
    (injector) => new UserService(injector.get<Database>(Database)),
    UserService
);

// Получаем UserService
const userService = injector.get<UserService>(UserService);
userService.getUsers(); 
```

Циклические зависимости так же будут успешно разрешены,
но с одним ограничением: такую зависимость нельзя использовать непосредственно в конструкторе,
а только в методах класса.

## API
Injector

    add<T, Params>(factory: ServiceFactory<T, Params>, key: Constructor<T>, token?: IInjectionToken<T, Params>)
    Регистрирует фабрику для создания объекта типа T.

    get<T, Params>(key: Constructor<T> | IInjectionToken<T, Params>, options?: GetOptions<Params>)
    Получает экземпляр объекта типа T. Если singleton === true, возвращается один и тот же экземпляр.

InjectionToken<T, Params>

    constructor(desc: string)
    Создает токен с описанием.

    find(registry: Registry): StoreItem<T, Params>
    Ищет зависимость в реестре по токену.
