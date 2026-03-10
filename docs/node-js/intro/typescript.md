---
sidebar_position: 3
sidebar_label: 'TypeScript alapok'
title: 'TypeScript alapok'
---

## TypeScript alapok

A TypeScript a JavaScript típusrendszerrel kibővített változata.

### Miért jó?

- Fordítás előtt hibákat jelez
- Erősebb típusellenőrzés
- Nagy projektekben biztonságosabb

---

### Egyszerű példa

JavaScript:

```js
function add(a, b) {
  return a + b;
}
```

TypeScript:

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

Például, ha megpróbálunk egy stringet átadni a `add` függvénynek TypeScript-ben, a fordító hibát fog jelezni, mert a függvény csak számokat vár.

```ts
add(1, '2'); // Fordítási hiba: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Ha változót nem inicializálunk, vagy egy nem létező változóra hivatkozunk, a TypeScript fordító szintén hibát fog jelezni.

```ts
let x: number;
console.log(x); // Fordítási hiba: Variable 'x' is used before being assigned.
```

Viszont ha ismert típussal inicializálunk egy változót, akkor nem kell kiírnunk a típusát, mert a TypeScript képes lesz kitalálni azt.

```ts
let x = 5; // TypeScript automatikusan felismeri, hogy x egy number
let y = 'Hello'; // TypeScript automatikusan felismeri, hogy y egy string
let z = add(1, x); // TypeScript automatikusan felismeri, hogy z egy number, mert az add függvény visszatérési értéke number
```

---

### Fordítás menete

Ha egy TypeScript fájlt szeretnénk futtatni Node.js-ben, vagy a böngészőben, először le kell fordítanunk JavaScriptre. Ez a `tsc` (TypeScript Compiler) segítségével történik (Manapság a Node.js képes natívan typescript fájlokat futtatni).

1. TypeScript fájl (`.ts`)
2. `tsc` fordító
3. JavaScript fájl (`.js`)
4. Node.js futtatja

### Typescript példák

#### Arrow function

```ts
interface Kitty {
  name: string;
  age?: number;
  children: Kitty[] | string[];
}

const array: Kitty[] = [
  {
    name: 'Cirmos',
    age: 1,
    children: ['Scruffles', 'Snowballs II'],
  },
  { name: 'Foltos', children: [] },
];

function logFunction(element: Kitty, index: number): void {
  console.log(`${index} - ${element.name}: ${element.age ?? 'Újszülött'}.`);
}

const logArrowFunction = (element: Kitty, index: number): void => {
  console.log(`${index} - ${element.name}: ${element.age ? 'Nem újszülött' : 'Újszülött'}.`);
};

console.log('Old way:');
for (let i = 0; i < array.length; ++i) {
  logFunction(array[i], i);
}

console.log('\nArrow function way:');
array.forEach((element, index) => {
  logArrowFunction(element, index);
});
```

Az interface segítségével definiáljuk a `Kitty` típusát, amely egy objektumot reprezentál, amelynek van egy `name` mezője (string), egy opcionális `age` mezője (number), és egy `children` mezője, amely lehet egy `Kitty` tömb vagy egy string tömb.\
Az `array` egy `Kitty` típusú objektumokat tartalmazó tömb, amely két elemet tartalmaz.\
A `logFunction` egy hagyományos függvény, amely két paramétert vár: egy `Kitty` objektumot és egy indexet. A függvény kiírja az indexet, a `Kitty` nevét és életkorát (ha van).\
A `logArrowFunction` egy arrow function, amely ugyanazt a logikát valósítja meg, mint a `logFunction`, de egy rövidebb szintaxissal.\
Végül a `for` ciklus és a `forEach` metódus segítségével meghívjuk a két függvényt az `array` elemeire, és kiírjuk a nevüket és életkorukat.

#### Array functions

```ts
interface Consultation {
  name: string;
  public: boolean;
  attendees: string[];
}

const konzik: Consultation[] = [
  {
    name: 'Grafika házi help',
    public: true,
    attendees: ['Attila', 'Álmos', 'Huba'],
  },
  {
    name: 'Adatb vizsgára készülés',
    public: false,
    attendees: ['Attila', 'Todor'],
  },
  {
    name: 'Prog2 konzi',
    public: true,
    attendees: ['Márton', 'Zalán', 'Tibor', 'Sándor'],
  },
];
```

Feladat:
Számoljuk össze, összesen hány résztvevő volt a publikus a konzultációkon!

```ts
let publicAttendeesCount = 0;
for (const konzi of konzik) {
  if (konzi.public) {
    publicAttendeesCount += konzi.attendees.length;
  }
}

console.log(publicAttendeesCount);
```

Egy `for` ciklus segítségével iterálunk a `konzik` tömb elemein, és minden publikus konzultáció esetén hozzáadjuk az `attendees` tömb hosszát a `publicAttendeesCount` változóhoz.

```ts
let publicAttendeesCount = 0;

konzik
  .filter((konzi) => konzi.public)
  .forEach((konzi) => {
    publicAttendeesCount += konzi.attendees.length;
  });

console.log(publicAttendeesCount);
```

A `filter` metódus segítségével kiszűrjük a publikus konzultációkat, majd a `forEach` metódussal iterálunk a szűrt tömb elemein, és minden publikus konzultáció esetén hozzáadjuk az `attendees` tömb hosszát a `publicAttendeesCount` változóhoz.\
Viszont ez a megoldás nem a legoptimálisabb, mert két iterációt hajt végre a tömbön (egy `filter` és egy `forEach`), míg az előző megoldás csak egy iterációt (`for` ciklus) hajt végre.

```ts
const publicAttendeesCount = konzik.reduce((count, konzi) => {
  if (!konzi.public) return count;
  return count + konzi.attendees.length;
}, 0);
```

A `reduce` metódus segítségével egyetlen iterációval számoljuk össze a publikus konzultációk résztvevőinek számát. A `reduce` egy akkumulátor (`count`) és a jelenlegi elem (`konzi`) segítségével halad végig a tömbön, és minden publikus konzultáció esetén hozzáadja az `attendees` tömb hosszát az akkumulátorhoz. Az eredmény a `publicAttendeesCount` változóban lesz tárolva.

#### Async-await

```ts
import fetch from 'node-fetch';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export const fetchUser = async (userId: string): Promise<User> => {
  return fetch(`https://jsonplaceholder.typicode.com/users/${userId}`).then((res) => res.json()) as Promise<User>;
};

// Tegyük fel, hogy a Facebook backendjén dolgozunk, a barátnak jelölés funkciót szeretnénk implementálni
// Azt a kis feladatot kaptuk, hogy írjunk egy segédfüggvényt,
// ami két felhasználó adait lekéri az adatbázisból, és egy tömbben visszaküldi.

// Promise
const checkFriendsPromise = () => {
  let user1: User;
  return fetchUser('1')
    .then((value) => {
      user1 = value;
      return fetchUser('2');
    })
    .then((user2) => [user2, user1]);
};

// Async + Await
export const checkFriendsAwait = async () => {
  try {
    const user1 = await fetchUser('1');
    const user2 = await fetchUser('2');
    return [user1, user2];
  } catch (error) {
    console.error(error);
  }
};

checkFriendsPromise().then((a) => console.log(a));
checkFriendsAwait().then(console.log);
```

A `fetchUser` függvény egy aszinkron művelet, amely egy `User` objektumot ad vissza egy adott `userId` alapján.\A `checkFriendsPromise` függvény a Promise láncolás segítségével lekéri két felhasználó adatait, és egy tömbben visszaadja őket.\
A `checkFriendsAwait` függvény ugyanazt a logikát valósítja meg, de az `async/await` szintaxist használja, ami olvashatóbb és könnyebben követhető, különösen összetettebb aszinkron műveletek esetén.\
Mindkét függvény végül egy tömböt ad vissza, amely két `User` objektumot tartalmaz, és a `console.log` segítségével kiírjuk azokat a konzolra.

#### Concurrency

```ts
import { fetchUser } from './2-async-await';

export const checkFriendsConcurrent = async () => {
  const a = fetchUser('1');
  const b = fetchUser('2');

  const users = await Promise.all([a, b]);

  return users;
};
```

A `checkFriendsConcurrent` függvény párhuzamosan indítja el a két `fetchUser` műveletet, és a `Promise.all` segítségével várja meg, amíg mindkét művelet befejeződik. Ez hatékonyabb, mint a szekvenciális megközelítés, mert nem kell megvárni az első művelet befejeződését, mielőtt elindítanánk a másodikat.\A `Promise.all` egy új Promise-t ad vissza, amely akkor teljesül, amikor az összes bemeneti Promise teljesül, és egy tömböt ad vissza a bemeneti Promise-ok értékeivel.\
Ez persze csak akkor használható, ha a műveletek egymástól függetlenek, azaz nincs szükség arra, hogy az egyik művelet eredményét felhasználjuk a másik művelet elindításához.

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**