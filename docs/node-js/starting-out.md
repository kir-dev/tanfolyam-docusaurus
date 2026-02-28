---
sidebar_position: 2
---

# Backend Fejlesztés NestJS-sel

Üdvözlünk a backend fejlesztő tanfolyamon! Ezen az órán egy modern, skálázható és robusztus backend alkalmazást fogunk felépíteni **Node.js** alapokon, a **NestJS** keretrendszer segítségével.

A projektünk egy **Hibajegy-kezelő (Ticketing) Rendszer** lesz. Adatbázisként **SQLite**-ot használunk, az adatbázis-műveleteket pedig a **Prisma ORM** segítségével fogjuk elvégezni.

:::info A végső célunk
Egy olyan REST API létrehozása, amely képes kezelni a hibajegyek létrehozását, lekérdezését, frissítését és törlését (CRUD műveletek). Ez az API később könnyen bővíthető lesz további funkciókkal, például felhasználókezeléssel, jogosultságokkal, stb. (habár erre a tanfolyamon nem fogunk kitérni).
:::

Vágjunk is bele!

---

## Chapter 1: Projekt inicializálás és a NestJS alapjai

Ebben a részben generálunk egy új NestJS projektet TypeScript támogatással, és megismerkedünk a keretrendszer alapvető építőköveivel.

### A NestJS CLI telepítése

A fejlesztés megkezdése előtt szükségünk van a NestJS parancssori eszközére (CLI). Csomagkezelőnek az `npm`-et (Node Package Manager) fogjuk használni.

Nyiss egy terminált, és futtasd a következő parancsot:

```bash
npm install -g @nestjs/cli
```

**Parancs magyarázata:**

- `npm install`: Csomag telepítését kéri a Node.js csomagkezelőjétől.
- `-g` (global): Globálisan telepíti a gépedre a csomagot, így bárhonnan elérheted a `nest` parancsot a terminálból.
- `@nestjs/cli`: A hivatalos NestJS parancssori eszköz neve.

### A projekt létrehozása

Most létrehozunk egy új alkalmazást `ticketing-app` néven:

```bash
nest new ticketing-app
```

**Parancs magyarázata:**

- `nest new`: A CLI-t utasítja egy új projekt generálására az alapértelmezett fájlokkal, mappaszerkezettel és TypeScript támogatással.
- `ticketing-app`: A projektünk mappájának és egyben az alkalmazásnak a neve. _(A parancs futtatása közben a CLI megkérdezi, melyik csomagkezelőt szeretnéd használni. Válaszd az `npm`-et!)_

Lépjünk be a létrehozott mappába:

```bash
cd ticketing-app
```

### Környezeti változók (.env) beállítása

A backend alkalmazásoknál bevett szokás, hogy a konfigurációs beállításokat környezeti változókban (Environment Variables) tároljuk.

Hozd létre a projekt gyökerében (a `package.json` fájllal egy szinten) egy új fájlt `.env` néven, és add hozzá a következő tartalmat:

```env title=".env"
PORT=3000
```

_Később ezt a portot fogjuk felhasználni arra, hogy az alkalmazásunk ezen a porton figyelje a beérkező kéréseket._

### Az alkalmazás architektúrája

A NestJS egy erősen strukturált keretrendszer. Három fő építőköve van:

1. **Modulok (Modules):** A kódunk logikai egységekre bontását végzik. Minden NestJS alkalmazásnak van legalább egy fő modulja (ez az `AppModule`).
2. **Vezérlők (Controllers):** Ők felelnek a HTTP kérések (GET, POST, stb.) fogadásáért és a válaszok visszaküldéséért (Routing).
3. **Szolgáltatások (Services / Providers):** Itt található az üzleti logikánk. A vezérlők továbbítják a kérést a szolgáltatásoknak, amelyek elvégzik a számításokat, adatbázis műveleteket, majd visszaadják az eredményt.

#### Dependency Injection (Függőség injektálás)

A NestJS lelke a **Dependency Injection (DI)** nevű tervezési minta. Lényege, hogy az osztályoknak (pl. Controllereknek) nem maguknak kell létrehozniuk a függőségeiket (pl. Service-eket `new Service()` kulcsszóval), hanem a keretrendszer automatikusan "befecskendezi" (injektálja) azokat a konstruktoron keresztül.

Ezért látod a Service-ek felett az `@Injectable()` dekorátort. Ez jelzi a NestJS-nek, hogy ez az osztály injektálható más osztályokba. Ez a módszer rendkívül megkönnyíti a kód tesztelhetőségét és karbantartását.

### Alkalmazás futtatása és Debuggolás VS Code-ban

Indítsuk el az alkalmazást fejlesztői módban:

```bash
npm run start:dev
```

**Parancs magyarázata:**

- Ez a parancs elindítja a szervert. A `:dev` rész biztosítja, hogy a kód módosításakor a szerver automatikusan újrainduljon (Hot Reloading).

#### Debuggolás beállítása

Sokszor szükséges lépésről lépésre végigkövetni a kód futását. VS Code-ban ehhez adjunk hozzá egy futtatási konfigurációt.
Hozz létre egy `.vscode` nevű mappát a projekt gyökerében, és benne egy `launch.json` fájlt:

```json title=".vscode/launch.json"
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "args": ["${workspaceFolder}/src/main.ts"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "cwd": "${workspaceFolder}",
      "protocol": "inspector",
      "internalConsoleOptions": "openOnSessionStart",
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Ezzel a beállítással a VS Code "Run and Debug" menüpontjában egy gombnyomással elindíthatod az alkalmazást debug módban, és használhatod a töréspontokat (breakpoints).

### Új végpont (Endpoint) létrehozása

Készítsünk egy végpontot, ami köszönt minket! Példaképp, ha a felhasználó megnyitja a `http://localhost:3000/hello/Gyula` címet, kapja vissza azt, hogy "Hello Gyula!".

Először módosítsuk a szolgáltatást, hogy fogadni tudjon egy nevet:

```typescript title="src/app.service.ts"
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Ez a metódus vár egy 'name' paramétert, és visszatér a formázott szöveggel
  getHello(name: string): string {
    return `Hello ${name}!`;
  }
}
```

Ezután módosítsuk a Controllert, hogy figyelje az URL-ben érkező paramétert:

```typescript title="src/app.controller.ts"
import { Controller, Get, Param } from '@nestjs/common';
// Egészítsük ki az eddigi importokat a Param dekorátorral, ami az URL paraméterek kezelésére szolgál
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // A ':name' egy dinamikus URL paramétert definiál
  @Get('hello/:name')
  getHello(@Param('name') name: string): string {
    // A @Param('name') dekorátor kiszedi az URL-ből a :name helyére írt értéket
    return this.appService.getHello(name);
  }
}
```

Próbáld ki a böngésződben a `http://localhost:3000/hello/Gyula` címet, és látni fogod az eredményt!

:::info
Ha elakadtál, akkor a chapter-1 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

## Chapter 2: A Tickets modul és a CRUD műveletek

Most, hogy ismerjük az alapokat, generáljuk le a hibajegyek (Tickets) kezeléséhez szükséges fájlokat! A NestJS CLI hatalmas segítséget nyújt ebben a `resource` generátorral.

### A Tickets modul generálása

Futtasd a következő parancsot:

```bash
nest g res tickets
```

**Parancs magyarázata:**

- `nest g`: "Nest Generate", azaz valaminek a legenerálását kérjük.
- `res`: "Resource", egy teljes erőforrás csomagot jelent (Controller, Service, Module, DTO-k, Entitás).
- `tickets`: A generálandó erőforrás neve.

_A CLI megkérdezi, hogy milyen típusú API-t szeretnél építeni. Válaszd a **REST API**-t, majd válaszolj **Y**-al a CRUD végpontok generálására._

Ez legenerálja nekünk a szabványos **CRUD** (Create, Read, Update, Delete) metódusokat mind a Controllerben, mind a Service-ben.

#### Hogyan kötődik be a rendszerbe?

Ha megnyitod az `src/app.module.ts` fájlt, észre fogod venni, hogy a Nest CLI automatikusan beillesztette a `TicketsModule`-t:

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module'; // Automatikusan importálva a CLI által

@Module({
  imports: [TicketsModule], // Itt csatlakozik be a fő modulba
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Nézzünk bele magába a `TicketsModule`-ba is:

```typescript title="src/tickets/tickets.module.ts"
import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService], // Ezt mi adjuk hozzá!
})
export class TicketsModule {}
```

:::info Providers és Exports
A `providers` tömb tartalmazza azokat a szolgáltatásokat, amelyek ebben a modulban jönnek létre és végzik a munkát. Ha egy másik modulnak szüksége lenne a `TicketsService`-re, akkor azt be kell tennünk az `exports` tömbbe is, ezzel "publikussá" téve a külvilág számára.
:::

### Entitás és DTO-k létrehozása

A CLI létrehozott számunkra mappákat az entitásoknak és a DTO-knak.

**Mi az a DTO?** A _Data Transfer Object_ (Adatátviteli objektum) határozza meg, hogy milyen formában érkezhetnek az adatok a klienstől (például egy POST kérés törzsében).

A generált `entities/ticket.entity.ts` egyelőre maradjon egy üres osztály. Később ide fogjuk modellezni az adatbázis által használt struktúrát.

```typescript title="src/tickets/entities/ticket.entity.ts"
export class Ticket {}
```

Most nézzük a DTO-kat az `src/tickets/dto/` mappában:

Hibajegy létrehozásához használt DTO (egyelőre üresen):

```typescript title="src/tickets/dto/create-ticket.dto.ts"
export class CreateTicketDto {}
```

Hibajegy frissítéséhez/módosításához szükséges DTO:

```typescript title="src/tickets/dto/update-ticket.dto.ts"
import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
```

**`PartialType`:**
Amikor frissítünk (Update) egy hibajegyet, ritkán küldjük el az összes adatot újra; általában csak azt küldjük, ami változott. A `@nestjs/mapped-types` csomagból érkező `PartialType` funkció automatikusan lemásolja a `CreateTicketDto` összes mezőjét, de mindegyiket **opcionálissá** teszi. Így nem kell kétszer megírnunk ugyanazt a kódstruktúrát.

### A Controller és a Service

A CLI által generált Controller és Service fájlokban már megtalálhatók a CRUD műveletek vázai, de egyelőre csak szöveges válaszokat adnak vissza. Ezeket fogjuk most megismerni részletesen.

#### A Vezérlő (Controller)

```typescript title="src/tickets/tickets.controller.ts"
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets') // Az összes itteni végpont a /tickets útvonalon lesz elérhető
export class TicketsController {
  // Dependency injection: A TicketsService injektálása
  constructor(private readonly ticketsService: TicketsService) {}

  @Post() // POST kérés a /tickets címre
  create(@Body() createTicketDto: CreateTicketDto) {
    // A @Body() kiszedi a HTTP kérés törzsét, és a DTO-ba tölti
    return this.ticketsService.create(createTicketDto);
  }

  @Get() // GET kérés a /tickets címre
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id') // GET kérés pl. /tickets/1 címre
  findOne(@Param('id') id: string) {
    // A +id kifejezés stringből számmá alakítja a paramétert
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id') // PATCH kérés részleges frissítéshez
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id') // DELETE kérés törléshez
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
```

#### A Szolgáltatás (Service)

Ide kerülnek be az igazi logikák, amelyek majd később az adatbázishoz nyúlnak:

```typescript title="src/tickets/tickets.service.ts"
import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  create(createTicketDto: CreateTicketDto) {
    return 'This action adds a new ticket';
  }

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticket`;
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticket`;
  }
}
```

### A Végpontok tesztelése

Az újonnan elkészített végpontjainkat többféleképpen tesztelhetjük (pl. Postman vagy Insomnia használatával). Parancssorból a `curl` parancs a legegyszerűbb megoldás.

**1. Az összes hibajegy lekérdezése (GET):**
Nyiss egy terminált (miközben a szerver fut) és írd be:

```bash
curl http://localhost:3000/tickets
```

_Válasz: `This action returns all tickets`_

**2. Egy specifikus hibajegy lekérdezése (GET by ID):**

```bash
curl http://localhost:3000/tickets/5
```

_Válasz: `This action returns a #5 ticket`_

**3. Új hibajegy létrehozása (POST):**
Itt JSON adatot is küldünk a kérés törzsében (`-d` flag):

```bash
curl -X POST http://localhost:3000/tickets \
     -H "Content-Type: application/json" \
     -d '{"name": "Teszt Hiba", "description": "Valami nem jó"}'
```

_Válasz: `This action adds a new ticket`_

Ezzel elkészült a modern NestJS API-nk alapja, ami készen áll arra, hogy a következő fejezetekben bekössük a valós adatbázist a Prismán keresztül!

:::info
Ha elakadtál, akkor a chapter-2 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

Íme a harmadik fejezet (Chapter 3) tananyaga, amely az előzőekhez hasonlóan Docusaurus-kompatibilis Markdown formátumban készült. Részletesen végigvezet a konfigurációkezelés és a Prisma ORM bevezetésének folyamatán.

## Chapter 3: Konfiguráció és a Prisma ORM

Egy komolyabb backend alkalmazásnál kiemelten fontos, hogy az adatbázis-kapcsolatokat, portokat és egyéb környezetfüggő beállításokat egy központosított, típusbiztos módon kezeljük. Mielőtt bekötnénk az adatbázist, létrehozunk egy **konfigurációs interfészt**.

### Miért hasznos a konfigurációs interfész?

Képzeld el, hogy az alkalmazásodban 20 helyen van szükséged az adatbázis URL-jére. Ha mindenhol a `process.env.DATABASE_URL` kódot használod, azzal több probléma is van:

1. **Nincs típusbiztonság (Type Safety):** A TypeScript nem tudja, hogy ez a változó biztosan létezik-e, vagy milyen típusú.
2. **Nincsenek alapértelmezett értékek:** Ha elfelejted beállítani a `.env` fájlban, az alkalmazás elszállhat.
3. **Nehéz refaktorálni:** Ha megváltozik a változó neve, 20 helyen kell átírnod.

Ezt oldja meg a NestJS beépített konfigurációs modulja.

#### Függőségek telepítése

Telepítsük a konfiguráció kezeléséhez szükséges hivatalos NestJS csomagot:

```bash
npm install @nestjs/config
```

#### A konfigurációs fájl létrehozása

Hozzuk létre a `src/config/` mappát, és abban egy `configuration.ts` fájlt:

```typescript title="src/config/configuration.ts"
export interface Config {
  port: number;
  frontendUrl: string;
  database: {
    url: string;
  };
}

export default (): Config => ({
  // Számmá alakítjuk a portot, ha nem sikerül, 3000 lesz az alapértelmezett
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
});
```

**Magyarázat:** Itt definiáltuk a `Config` interfészt, ami megmondja a TypeScriptnek, hogy pontosan milyen adatok érhetőek el a konfigurációnkban. Az exportált függvény pedig kiolvassa a környezeti változókat (a `.env` fájlból), és alapértelmezett (fallback) értékeket is biztosít.

#### A ConfigModule bekötése az AppModule-ba

Most regisztrálnunk kell ezt a konfigurációt a fő modulunkban (`src/app.module.ts`).

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Magyarázat:**

- `ConfigModule.forRoot(...)`: Inicializálja a modult.
- `isGlobal: true`: Ez teszi lehetővé, hogy az alkalmazásunk bármelyik részében (bármelyik másik modulban) használhassuk a `ConfigService`-t anélkül, hogy mindenhol újra importálnunk kellene a `ConfigModule`-t.
- `load: [configuration]`: Betölti az általunk előbb megírt egyedi konfigurációs logikát.

---

### A Prisma ORM bevezetése

A **Prisma** egy modern, típusbiztos ORM (Object-Relational Mapper) Node.js-hez és TypeScript-hez. Segítségével ahelyett, hogy nyers SQL lekérdezéseket írnánk, TypeScript objektumokon és metódusokon keresztül kommunikálhatunk az adatbázissal. SQLite adatbázist fogunk használni.

#### Függőségek letöltése

Telepítsük a működéshez szükséges csomagokat. Futassuk az alábbi parancsokat:

```bash
npm install @prisma/adapter-better-sqlite3 @prisma/client
npm install -D prisma @types/better-sqlite3
```

**Parancs magyarázata:**

- `npm install ...`: A futáshoz (produkciós környezetben is) szükséges csomagok. A `@prisma/client` felel az adatbázis lekérdezésekért, az adapter pedig a gyorsabb SQLite kezelésért.
- `npm install -D ...`: A `-D` (vagy `--save-dev`) azt jelenti, hogy ezek csak fejlesztői (Development) függőségek. Maga a `prisma` CLI csak a séma generálásához és migrációkhoz kell.

#### Prisma inicializálása

Inicializáljuk a Prismát a projektünkben:

```bash
npx prisma init
```

Ez létrehoz egy `prisma/schema.prisma` fájlt. Ez a fájl az alkalmazásunk "szíve", itt definiáljuk az adatbázis tábláit és kapcsolatait.

---

### A Prisma Séma kialakítása

Építsük fel a `schema.prisma` fájlunkat lépésről lépésre, megértve az összefüggéseket!

#### 1. Generátor és Adatforrás

Cseréld ki a `schema.prisma` tetejét a következőre:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}
```

**Magyarázat:**

- A `datasource` megmondja, hogy SQLite-ot használunk.
- A `generator` kliens felelős a TypeScript típusok legenerálásáért. Az `output` paraméterrel **megváltoztattuk az alapértelmezett generálási helyet**. Így a Prisma az `src/generated/prisma` mappába fogja tenni a kész kódokat, amit könnyebb lesz beimportálni és kezelni a projektünkön belül.

#### 2. A Táblák (Modellek) és Egy-a-Többhöz kapcsolat

Adjuk hozzá a Táblák (Boards) és a Hibajegyek (Tickets) modelljét:

```prisma
model Boards {
  id        Int      @id @default(autoincrement())
  title     String
  tickets   Ticket[]
  createdAt DateTime @default(now())
}

model Ticket {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  ticketPhase TicketPhase @default(CREATED)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  board    Boards @relation(fields: [boardsId], references: [id])
  boardsId Int
}
```

**Magyarázat:**

- `@id @default(autoincrement())`: Ez jelzi, hogy az `id` mező az elsődleges kulcs (Primary Key), ami automatikusan növekszik.
- `description String?`: A `?` jelzi, hogy ez a mező opcionális (lehet NULL az adatbázisban).
- `createdAt` / `updatedAt`: A Prisma automatikusan kitölti az aktuális dátummal létrehozáskor (`now()`), és automatikusan frissíti a dátumot módosításkor (`@updatedAt`).
- **Kapcsolat (Relation):** Egy táblához (`Boards`) több hibajegy (`Ticket`) tartozhat. A `Ticket` modellben a `boardId` fogja tárolni a kapcsolódó tábla azonosítóját (Foreign Key), amit a `@relation` annotáció köt össze.

#### 3. Enumok és Több-a-Többhöz kapcsolat

Végül adjuk hozzá a státuszokat és a címkéket:

```prisma
enum TicketPhase {
  CREATED
  IN_PROGRESS
  UNDER_REVIEW
}

model Label {
  id    Int    @id @default(autoincrement())
  name  String
  color String

  tickets Ticket[]
}
```

És persze ne felejtsük el a `Ticket` modell végére hozzáadni a címkéket:

```prisma
model Ticket {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  ticketPhase TicketPhase @default(CREATED)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  board    Boards @relation(fields: [boardsId], references: [id])
  boardsId Int

  labels Label[]
}
```

Prismában a kapcsolatokat mindkét modellben definiálni kell, de a módja persze függ a kapcsolat típusától.

**Magyarázat:**

- `enum`: Egy előre definiált értékhalmaz. A ticket csak ezeket az állapotokat veheti fel.
- **Több-a-többhöz (M-N) kapcsolat:** Egy címke (Label) több hibajegyen is rajta lehet, és egy hibajegynek több címkéje is lehet. A Prisma nagyon okos: ha mindkét modellnél tömbként (`Ticket[]` és `Label[]`) hivatkozol a másikra, automatikusan létrehoz a háttérben egy kapcsolótáblát az SQLite-ban.

#### Migráció és a kliens generálása

Most, hogy kész a séma, hozzuk létre a fizikai adatbázist és generáljuk le a TypeScript típusokat:

```bash
npx prisma migrate dev --name init
```

**Mit csinál ez a parancs?**

1. Létrehoz egy SQL migrációs fájlt (ami leírja, hogyan jönnek létre a táblák).
2. Lefuttatja ezt a fájlt, így létrejön a `dev.db` SQLite adatbázis fájl.
3. Automatikusan lefuttatja az `npx prisma generate` parancsot, ami legenerálja a `PrismaClient`-et a mi egyedi `src/generated/prisma` mappánkba!

---

### Prisma modul és Service létrehozása

Hogy használni tudjuk a Prismát a NestJS-ben, létre kell hoznunk számára egy Modult és egy Service-t. Generáljuk le a CLI-vel:

```bash
nest g mo prisma
nest g s prisma
```

#### A Prisma modul

Módosítsd az `src/prisma/prisma.module.ts` fájlt a következőre:

```typescript title="src/prisma/prisma.module.ts"
import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  static forRoot({ isGlobal }: { isGlobal: boolean }): DynamicModule {
    return {
      global: isGlobal,
      module: PrismaModule,
      providers: [PrismaService],
      exports: [PrismaService],
    };
  }
}
```

:::info Mi az a DynamicModule?
A Dinamikus Modulok lehetővé teszik, hogy a modul betöltésekor paramétereket adjunk át neki (például konfigurációkat). Itt egy `forRoot` statikus metódust hoztunk létre. Amikor az `AppModule`-ban meghívtuk a `PrismaModule.forRoot({ isGlobal: true })` kódot, ez a metódus futott le. Ezzel elérjük, hogy a `PrismaService` globális legyen, azaz bármelyik másik modulban (pl. a `TicketsModule`-ban) használható legyen anélkül, hogy újra be kellene importálni.
:::

#### A Prisma Service (Adatbázis kapcsolat)

Módosítsd az `src/prisma/prisma.service.ts` fájlt a következőre:

```typescript title="src/prisma/prisma.service.ts"
import { Injectable, OnModuleInit } from '@nestjs/common';
// Figyeld meg az importot: A saját generált mappánkból húzzuk be a klienst!
import { PrismaClient } from '../generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Config } from '../config/configuration';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly config: ConfigService<Config, true>) {
    // Kiolvassuk a db url-t a korábban létrehozott ConfigService-ből
    const connectionString = config.get('database.url', { infer: true });

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Inicializáljuk a gyorsabb SQLite adaptert
    const adapter = new PrismaBetterSqlite3({ url: connectionString });

    // Átadjuk az adaptert a szülő osztálynak (PrismaClient)
    super({ adapter });
  }

  // Ez a metódus automatikusan lefut, amikor a modul inicializálódik
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
```

**Magyarázat a Service-hez:**

1. A `PrismaService` kibővíti (`extends`) a legenerált `PrismaClient` osztályt. Ezért van az, hogy a `PrismaService`-en keresztül elérjük majd az összes adatbázis metódust (pl. `this.prisma.ticket.findMany()`).
2. Kiemelten fontos a beimportált útvonal: `../generated/prisma/client`. Ezt azért tudjuk így használni, mert a `schema.prisma` fájlban módosítottuk az `output` célmappáját.
3. Itt használjuk fel a fejezet elején létrehozott **ConfigModule**-t! A `ConfigService` segítségével biztonságosan, típusosan (`Config` interfésszel) olvassuk ki a `database.url` értékét.
4. Az `OnModuleInit` interfész implementálásával biztosítjuk, hogy amint elindul a NestJS szerverünk, a Prisma azonnal felépítse az adatbázis-kapcsolatot (`this.$connect()`).

Mostmár a `PrismaService`-t bármelyik másik modulban használhatjuk Dependency Injection segítségével.

Ezzel sikeresen összekötöttük a NestJS alkalmazásunkat a konfiguráció-kezeléssel és a Prisma ORM-mel! A következő részben ezt felhasználva befejezzük a `Tickets` végpontjaink megírását, hogy valódi adatbázisba mentsük a hibajegyeket.

:::info
Ha elakadtál, akkor a chapter-3 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

## Chapter 4: A Boards modul, validáció és a Prisma felhasználása

Ebben a fejezetben létrehozzuk a táblákat (Boards) kezelő modult. Egy `Board` képviselhet például egy projektet, amelyhez majd a hibajegyek (Tickets) tartoznak. Most először fogjuk összekötni a végpontjainkat a valós adatbázissal a Prisma segítségével, és megismerkedünk a bejövő adatok validálásával is.

### A Boards modul generálása

Először generáljuk le az új erőforrást a NestJS CLI segítségével:

```bash
nest g res boards
```

_(Válaszd a REST API-t, és kérd a CRUD végpontok generálását!)_

### Függőségek telepítése a validációhoz

Ahhoz, hogy a felhasználók által beküldött adatokat ellenőrizni tudjuk (pl. a cím ne legyen üres, az ID szám legyen), két könyvtárra lesz szükségünk. Futtasd a következő parancsot:

```bash
npm install class-validator class-transformer
```

**Mik ezek?**

- `class-validator`: Dekorátorokat biztosít (pl. `@IsString()`, `@IsNotEmpty()`), amelyekkel szabályokat definiálhatunk az osztályaink tulajdonságaira.
- `class-transformer`: Segít a sima JSON objektumokat (amelyek a hálózaton érkeznek) valódi TypeScript osztálypéldányokká alakítani.

---

### Entitások létrehozása

A generált `boards/entities/board.entity.ts` fájlban most már valós osztályt definiálunk, és fel is díszítjük a validációs szabályokkal.

```typescript title="src/boards/entities/board.entity.ts"
import { IsDate, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class Board {
  @IsNumber()
  @Min(1)
  id: number = 0;

  @IsString()
  @IsNotEmpty()
  title: string = '';

  @IsDate()
  createdAt: Date = new Date();
}
```

Mivel később szükségünk lesz arra is, hogy lekérjünk egy táblát az összes hozzá tartozó hibajeggyel, készítünk egy kiterjesztett entitást is. Hozd létre a `board-with-tickets.entity.ts` fájlt:

```typescript title="src/boards/entities/board-with-tickets.entity.ts"
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Board } from './board.entity';

export class BoardWithTickets extends Board {
  tickets: Ticket[] = [];
}
```

---

### A DTO-k és az OmitType

A bejövő adatokat DTO-kkal (Data Transfer Object) kezeljük. Módosítsuk a létrehozáshoz használt DTO-t:

```typescript title="src/boards/dto/create-board.dto.ts"
import { OmitType } from '@nestjs/mapped-types';
import { Board } from '../entities/board.entity';

export class CreateBoardDto extends OmitType(Board, ['id', 'createdAt']) {}
```

:::info Mi az az OmitType?
Képzeljük el, mi történik, amikor egy felhasználó új táblát akar létrehozni (POST kérés). Meg kell adnia a tábla címét (`title`), de **nem adhatja meg** az `id`-t és a `createdAt` dátumot, hiszen azokat az adatbázis (Prisma) automatikusan generálja!

Az `OmitType` lemásolja a `Board` entitásunkat (a benne lévő validációs szabályokkal együtt!), de **kihagyja** belőle az általunk megadott mezőket (jelen esetben az `id` és `createdAt` mezőket). Így a kódunk DRY (Don't Repeat Yourself) marad: nem kell kétszer leírnunk a `title` validációs szabályait.
:::

A frissítéshez használt DTO-t is frissítjük a korábban megismert `PartialType` segítségével:

```typescript title="src/boards/dto/update-board.dto.ts"
import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
```

---

### A validáció bekapcsolása

Az entitásokba írt dekorátorok (pl. `@IsString()`) önmagukban nem csinálnak semmit. Meg kell mondanunk a NestJS-nek, hogy minden beérkező HTTP kérést vizsgaljon meg. Ezt a `main.ts` fájlban tesszük meg egy globális "Pipe" beállításával.

```typescript title="src/main.ts"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Itt kapcsoljuk be a globális validációt!
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ?? 3000;
  console.log(`Nestjs is running on port ${port}`);
  await app.listen(port);
}

void bootstrap();
```

**Miért kell ez?**
Ha egy felhasználó most egy üres JSON-t `{}` küld be a `POST /boards` végpontra, a `ValidationPipe` automatikusan elfogja a kérést, és még azelőtt visszadob egy `400 Bad Request` hibát, hogy a kódunk egyáltalán lefutna a Controllerben. Védőhálót biztosít az alkalmazásunknak.

---

### A Controller és a Pipe-ok használata

Most frissítsük a `boards.controller.ts` fájlt:

```typescript title="src/boards/boards.controller.ts"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardWithTickets } from './entities/board-with-tickets.entity';
import { Board } from './entities/board.entity';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardsService.create(createBoardDto);
  }

  @Get()
  findAll(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BoardWithTickets> {
    return this.boardsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBoardDto: UpdateBoardDto): Promise<Board> {
    return this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Board> {
    return this.boardsService.remove(id);
  }
}
```

:::tip Mi az a ParseIntPipe és miért változik meg a hibaüzenet?
Amikor az URL-ből kiolvasunk egy paramétert (pl. `GET /boards/5`), a HTTP protokoll sajátosságai miatt az `"5"` egy `string` (szöveg).

- **ParseIntPipe nélkül:** A service-ünk ezt szövegként kapná meg, majd amikor átadja a Prismának (ami számot vár), a szerverünk elszállna egy csúnya, 500-as Internal Server Error hibával.
- **ParseIntPipe használatával:** A NestJS még a kódunk futása előtt megpróbálja az értéket számmá alakítani. Ha a felhasználó a `/boards/alma` URL-t hívja meg, a Pipe azonnal visszaad egy barátságos hibaüzenetet:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

:::

---

### A Service összekötése a Prisma ORM-mel

Végül írjuk meg az üzleti logikát a `boards.service.ts` fájlban. Itt fogjuk a Chapter 3-ban létrehozott `PrismaService`-t használni.

```typescript title="src/boards/boards.service.ts"
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Boards, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BoardWithTickets } from './entities/board-with-tickets.entity';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBoardDto: Prisma.BoardsCreateInput) {
    try {
      return await this.prisma.boards.create({
        data: createBoardDto,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Could not create board');
    }
  }

  async findAll(): Promise<Boards[]> {
    return await this.prisma.boards.findMany();
  }

  async findOne(id: number): Promise<BoardWithTickets> {
    const board = await this.prisma.boards.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    return board;
  }

  async update(id: number, updateBoardDto: Prisma.BoardsUpdateInput): Promise<Boards> {
    try {
      return await this.prisma.boards.update({
        where: { id },
        data: updateBoardDto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Board with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not update board with id ${id}`);
    }
  }

  async remove(id: number): Promise<Boards> {
    try {
      return await this.prisma.boards.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Board with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not delete board with id ${id}`);
    }
  }
}
```

#### 1. A PrismaService Injektálása

A konstruktorban (`constructor(private readonly prisma: PrismaService) {}`) a NestJS Dependency Injection (Függőség injektálás) rendszerét használjuk. Mivel a 3. fejezetben a `PrismaModule`-t globálissá tettük, a NestJS automatikusan átadja nekünk az adatbázis-kapcsolatot kezelő szolgáltatást. Ezen a `this.prisma` objektumon keresztül érjük el a generált adatbázis tábláinkat (pl. `this.prisma.boards`).

#### 2. Típusbiztonság a Prisma beépített típusaival

Ha megfigyeled a metódusok paramétereit (pl. `createBoardDto: Prisma.BoardsCreateInput`), láthatod, hogy nem a mi saját DTO-nkat használjuk típusként, hanem a Prisma által generált típusokat. Ez azért nagyon hasznos, mert a Prisma pontosan tudja, milyen mezőket vár az adatbázis egy új rekord létrehozásakor vagy frissítésekor. Ha a sémánk változik, ezek a típusok automatikusan frissülnek, így a TypeScript azonnal jelezni fogja, ha valahol rossz adatot akarunk az adatbázisba küldeni.

#### 3. Kapcsolatok lekérdezése a `findOne` metódusban

A `findOne` metódusban ezt a lekérdezést használjuk:
`include: { tickets: true }`

A relációs adatbázisokban (mint az SQLite) a táblák külön vannak. Alapértelmezés szerint a Prisma csak a `boards` tábla adatait adja vissza, hogy gyors maradjon a lekérdezés. Az `include` kulcsszóval (Eager Loading) viszont megmondjuk a Prismának, hogy menjen el a kapcsolódó `tickets` táblába is, és hozza el az összes olyan hibajegyet, ami ehhez a táblához tartozik. Ezért térünk vissza itt a kiterjesztett `BoardWithTickets` entitásunkkal, hiszen a válasz most már tartalmazni fog egy `tickets` tömböt is.

#### 4. Hibakezelés és HTTP státuszkódok

A HTTP kéréseknél nagyon fontos, hogy megfelelő státuszkódot adjunk vissza hiba esetén (pl. 404, ha nem található valami, vagy 400, ha rossz az adat).
A `findOne` esetében manuálisan ellenőrizzük, hogy létezik-e az adat: `if (!board) throw new NotFoundException(...)`. Ez egy beépített NestJS hiba, ami automatikusan egy 404-es HTTP választ generál a kliensnek.

#### 5. A Prisma hibakódok (P2025) elkapása az `update` és `remove` metódusokban

A frissítésnél és a törlésnél a Prisma automatikusan hibát dob, ha olyan ID-jú elemet próbálunk módosítani, ami nem is létezik az adatbázisban.
Ezt a hibát a `try-catch` blokkban kapjuk el. Az `e instanceof Prisma.PrismaClientKnownRequestError` sorral ellenőrizzük, hogy a Prisma dobott-e ismert hibát.
A **`P2025`** a Prisma hivatalos hibakódja arra, ha _"Egy olyan rekordot próbálsz frissíteni vagy törölni, amely nem található"_. Ha ezt a kódot látjuk, pontosan tudjuk, hogy az elem nem létezik, ezért visszadobunk egy `NotFoundException`-t (404-es hiba). Minden más váratlan hiba esetén `BadRequestException`-t (400-as hiba) küldünk vissza.

:::info
Ha elakadtál, akkor a chapter-4 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::
