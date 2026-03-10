---
sidebar_position: 4
sidebar_label: 'Express és NestJS'
title: 'Express és NestJS'
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
