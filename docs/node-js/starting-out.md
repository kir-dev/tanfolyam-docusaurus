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
