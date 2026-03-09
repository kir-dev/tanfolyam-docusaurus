---
sidebar_position: 1
---

# Bevezetés a webes keretrendszerekbe

## Az előadás célja

Az első előadás célja, hogy:

- Megértsük, mi az a **backend**, és hogyan kapcsolódik a **frontendhez**
- Átlássuk a **HTTP kommunikáció** alapjait
- Megismerjük a **REST API** fogalmát
- Megkülönböztessük a statikus, multi-page és SPA webalkalmazásokat
- Megértsük a **JSON** szerepét
- Bevezetést kapjunk a **Node.js**, **TypeScript**, **npm**, **Express** és **NestJS** világába

Ez az óra még inkább elméleti alapozás, hogy megismerjük a fogalmakat és a technológiákat, amikkel a tanfolyam során dolgozni fogunk.

---

## Mi az a backend?

Egy modern webalkalmazás általában két fő részből áll:

### Frontend

- A felhasználó böngészőjében fut
- A mi esetünkben egy **React SPA**
- Felhasználói felületet (UI) jelenít meg és kezeli a felhasználói interakciókat
- HTTP kéréseket küld a backendnek
- Felhasználói élményt biztosít (reszponzivitás, interakciók)
- Felhasználja a backend által szolgáltatott adatokat a megjelenítéshez
- Nem foglalkozik az adatok tárolásával vagy üzleti logikával
- HTML, CSS és JavaScript

### Backend

- Szerveren fut
- Feldolgozza a kéréseket
- Választ küld vissza (általában JSON formátumban)
- Üzleti logikát valósít meg
- Adatbázissal kommunikál
- Adatok mentése, olvasása, manipulálása
- Felhasználói hitelesítés és jogosultságkezelés
- PHP, Java, Python, Go, Node.js (és kb. bármilyen létező programozási nyelv)

---

## Hogyan kommunikál a frontend és a backend?

A kommunikáció HTTP kéréseken keresztül történik.

Példa:

1. A React frontend elküld egy kérést:

   ```
   GET /tickets
   ```

2. A backend válaszol:
   ```json
   [
     { "id": 1, "title": "Hibás bejelentkezés" },
     { "id": 2, "title": "Nem működik a fizetés" }
   ]
   ```

Ez a kommunikáció **stateless**, azaz minden kérés önálló, és a backend nem tárol információt a kliensről a kérésen kívül.

---

## HTTP alapok

A HTTP egy kérés-válasz alapú protokoll.

### Leggyakoribb HTTP metódusok

| Metódus | Jelentés               |
| ------- | ---------------------- |
| GET     | Adat lekérése          |
| POST    | Új adat létrehozása    |
| PUT     | Teljes adat frissítése |
| PATCH   | Részleges frissítés    |
| DELETE  | Törlés                 |

### HTTP státuszkódok

- 100-199: információs válaszok
- 200-299: sikeres válaszok
- 300-399: átirányítások
- 400-499: kliens hibák
- 500-599: szerver hibák

#### Leggyakoribb státuszkódok

| Kód | Jelentés              |
| --- | --------------------- |
| 200 | OK                    |
| 201 | Created               |
| 400 | Bad Request           |
| 401 | Unauthorized          |
| 403 | Forbidden             |
| 404 | Not Found             |
| 500 | Internal Server Error |

Lásd még:

- [**HTTP protokoll részletesen (angol)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [**HTTP status codes (angol)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

### HTTP kérés részei

- URL
- Metódus
- Header
- Body (nem mindig van)

---

## Weboldal típusok

### Statikus weboldal

- Előre elkészített HTML, CSS és JavaScript fájlok
- Nincs szerveroldali logika és perzisztens adat
- Gyors és egyszerű, de ritkán használják modern alkalmazásokhoz
- Példa: egy egyszerű portfólió oldal, vagy dokumentációs oldal, mint ez a tanfolyam weboldala, vagy applikációk forráskódjából és kommentjeiből generált dokumentációk

### Multi-page application (MPA)

- A szerver az adatbázisból kiolvassa a szükséges adatokat, és ez alapján generál egy új HTML oldalt minden kérésre
- Minden navigáció új oldalbetöltés
- Klasszikus szerveroldali renderelés, például PHP, Java Spring MVC, vagy Django használatával
- Itt a backend felelős a megjelenítésért és az üzleti logikáért is
- Példa: egy hagyományos blog, ahol minden bejegyzés egy külön HTML oldal

### Single Page Application (SPA)

- A szerver nem foglalkozik a megjelenítéssel, csak nyers adatot küld a kliensnek
- A frontend felelős a megjelenítésért és az adatok alaján jeleníti meg a tartalmat
- Backend API-n keresztül kommunikál
- JavaScript (pl. React) kezeli a routingot
- Példa: Nagyon sok modern webalkalmazás, mint a Google Maps vagy a Netflix

A mi frontendünk egy **React SPA** lesz.

---

## REST API

A Represantational State Transfer (REST) egy tervezési stílus web API-khoz.
A REST API-k a HTTP protokollt használják, és erőforrás-alapúak.
Egy architektúra, amely meghatározza, hogyan kell a szervernek és a kliensnek kommunikálnia egymással.

### REST alapelvek

- Erőforrás-alapú (resource-based)
- HTTP metódusokat használ
- Stateless
- JSON válasz (általában)

### Példa REST végpontokra

```
GET    /tickets     -> összes hibajegy lekérése
GET    /tickets/1   -> az 1-es azonosítójú hibajegy lekérése
POST   /tickets     -> új hibajegy létrehozása
PUT    /tickets/1   -> az 1-es azonosítójú hibajegy teljes frissítése
PATCH  /tickets/1   -> az 1-es azonosítójú hibajegy részleges frissítése
DELETE /tickets/1   -> az 1-es azonosítójú hibajegy törlése
```

---

## JSON

A JSON (JavaScript Object Notation) adatcsere-formátum.

Példa:

```json
{
  "id": 1,
  "title": "Hiba",
  "resolved": false
}
```

Miért fontos?

- Ember által olvasható
- Könnyen feldolgozható
- HTTP API-k alap formátuma

Alap adatstruktúrák:

- Objektumok (kulcs-érték párok)
- Tömbök: értékek sorrendhelyes felsorolása vesszővel elválasztva
- Sztringek: UTF-8 karakterláncok
- Számok: egész vagy lebegőpontos számok
- Boolean értékek: true vagy false
- Null: üres érték

![JSON példa](/img/node/json-example.png)

---

## Node.js

A Node.js lehetővé teszi, hogy JavaScriptet futtassunk szerveren.

- **Aszinkron és eseményvezérelt**: képes egyszerre több kapcsolatot fogadni, és az _evet loop_ segítségével képes aszinkron műveleteket végrehajtani.
- **Egyszálú**: egyetlen szálon fut, de képes több műveletet párhuzamosan kezelni az aszinkronitás segítségével.

### Hogyan működik?

- A Chrome V8 JavaScript engine-re épül
- Event-driven
- Non-blocking I/O
- Egy szálon fut, de aszinkron módon kezeli a műveleteket

---

### Event loop

A Node.js nem blokkoló módon működik.

Példa:

```ts
setTimeout(() => {
  console.log('Késleltetett');
}, 1000);

console.log('Azonnali');
```

Kimenet:

```
Azonnali
Késleltetett
```

A `setTimeout` egy aszinkron művelet, amely a callback függvényt egy későbbi időpontban hajtja végre, miközben a fő szál tovább fut, azaz nem blokkolja a `console.log('Azonnali')` végrehajtását.

---

## Aszinkronitás

### Promise

```ts
fetch('https://api.com/data')
  .then((response) => response.json())
  .then((data) => console.log(data));
  .catch((error) => console.error(error));
```

A `fetch` egy aszinkron művelet, amely egy Promise-t ad vissza. A `then` metódusok segítségével kezeljük a sikeres és hibás eseteket, a `catch` metódus pedig a dobott hibák kezelésére szolgál.

### async/await

```ts
async function load() {
  const response = await fetch('https://api.com/data');
  const data = await response.json();
  console.log(data);
}
```

Az `async/await` olvashatóbb és könnyebben követhető, mint a Promise láncolás, különösen összetettebb aszinkron műveletek esetén. Az `await` kulcsszó megállítja a függvény végrehajtását, amíg a Promise teljesül, majd visszaadja a Promise értékét. De nem blokkolja a teljes alkalmazást, csak az adott async függvény végrehajtását.

---

## npm és a csomagkezelők

Az npm a Node.js csomagkezelője.

### Mire jó?

- Külső könyvtárak telepítése
- Projekt függőségek kezelése
- Script futtatás

Példa:

```bash
npm init -y
npm install express
```

Telepíti az Express könyvtárat, és létrehozza a `package.json` fájlt a projekt gyökerében, amely tartalmazza a projekt nevét, verzióját és a telepített függőségeket és azok verzióit.

Alternatívák:

- yarn
- pnpm

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
    osszesResztvevo += konzi.attendees.length;
  }
}

console.log(osszesResztvevo);
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

## Express

Az Express egy minimalista Node.js web framework.\
Erőssége a rugalmasság és a könnyű használat, nem kényszerít egy adott struktúrára, így gyorsan el lehet kezdeni vele dolgozni.\Express segítségével könnyen létrehozhatunk REST API-kat, és számos middleware-t használhatunk a funkcionalitás bővítésére (pl. hitelesítés, adatbázis kapcsolat, stb.).\
Az Express egy nagyon népszerű választás a Node.js fejlesztők körében, különösen kisebb projektekhez vagy gyors prototípusokhoz.

### Egyszerű példa

```ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use((req: Request, res: Response, next) => {
  console.log(`[server]: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/users/:userId', (req: Request, res: Response) => {
  res.send(`User ID: ${req.params.userId}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

Az Express alkalmazás létrehozásához importáljuk az `express` modult, és létrehozunk egy `app` változót, amely az Express alkalmazást reprezentálja.\A `dotenv` modullal betöltjük a környezeti változókat a `.env` fájlból, így például a `PORT` változót is.\A `app.use` metódussal egy middleware-t adunk hozzá, amely minden bejövő kérésnél kiírja a HTTP metódust és az URL-t a konzolra, majd meghívja a `next` függvényt, hogy a következő middleware vagy route handler is végrehajtódjon.\A `app.get` metódussal definiálunk két GET végpontot: az egyik a gyökeret (`/`), amely egy egyszerű üzenetet küld vissza, a másik pedig egy dinamikus végpont (`/users/:userId`), amely a `userId` paramétert visszaküldi a válaszban.\Végül a `app.listen` metódussal elindítjuk a szervert a megadott porton, és egy üzenetet írunk ki a konzolra, hogy a szerver fut és elérhető a megadott URL-en.

### Hátrányai az általunk használt NestJS-hez képest

- Nincs beépített struktúra, így nagyobb projektekben könnyen kaotikussá válhat
- Nem támogatja natívan a TypeScript-et, bár könnyen használható vele
- Nem rendelkezik beépített dependency injection rendszerrel, ami megnehezítheti a tesztelést és a moduláris felépítést
- Persze ez nem jelenti azt, hogy nem lehet jól használni, csak nagyobb fegyelmet és odafigyelést igényel a fejlesztőktől, hogy ne váljon rendezetlenné a kód.

---

## NestJS

A NestJS egy strukturáltabb, enterprise-közeli framework.

### Fő jellemzők

- TypeScript-first
- Modul alapú felépítés
- Dependency Injection
- Controller / Service architektúra

---

## Express vs NestJS

| Express             | NestJS                    |
| ------------------- | ------------------------- |
| Minimalista         | Strukturált               |
| Gyors indulás       | Nagyobb tanulási görbe    |
| Kevés szabály       | Erős architektúra         |
| Kis projektekhez jó | Nagy projektekhez ideális |

---

## Összefoglalás

Az első előadáson átvettük a következő témákat:

- Mi az a backend
- Hogyan kommunikál frontend és backend
- Mi az a REST API
- Mi az a JSON
- Hogyan működik a Node.js
- Mit jelent az aszinkronitás
- Mi az a TypeScript
- Mi az az Express és NestJS

---

## Következő előadás

A következő alkalommal:

- Megnézzük a konkrét projektet
- Létrehozunk egy alap NestJS alkalmazást
- Elkezdjük építeni az API-t

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**
