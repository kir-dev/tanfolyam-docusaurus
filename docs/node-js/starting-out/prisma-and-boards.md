---
sidebar_position: 3
sidebar_label: 'Chapter 3: Konfiguráció, Prisma ORM és a Boards implementálása'
title: 'Chapter 3: Konfiguráció, Prisma ORM és a Boards implementálása'
---

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
  database: {
    url: string;
  };
}

export default (): Config => ({
  // Számmá alakítjuk a portot, ha nem sikerül, 3000 lesz az alapértelmezett
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
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
import { BoardsModule } from './boards/boards.module';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BoardsModule,
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

#### Mi az a relációs adatbázis és az ORM?

Egy **relációs adatbázis** táblákban tárolja az adatokat — pont mint egy Excel tábla: sorok (rekordok) és oszlopok (mezők). A táblák között **kapcsolatok** (relációk) vannak: például egy `Boards` táblához sok `Ticket` sor tartozhat.

Az adatbázissal hagyományosan **SQL** (Structured Query Language) lekérdezésekkel kommunikálunk:

```sql
SELECT * FROM "Ticket" WHERE "boardsId" = 1;
INSERT INTO "Ticket" ("name", "boardsId") VALUES ('Fix login bug', 1);
```

Az **ORM** (Object-Relational Mapper) egy közvetítő réteg, amely ezeket az SQL lekérdezéseket elrejti előlünk. Ahelyett, hogy SQL-t írnánk, TypeScript metódusokat hívunk, és az ORM generálja a megfelelő SQL-t a háttérben.

A **Prisma** egy modern, típusbiztos ORM (Object-Relational Mapper) Node.js-hez és TypeScript-hez. Segítségével ahelyett, hogy nyers SQL lekérdezéseket írnánk, TypeScript objektumokon és metódusokon keresztül kommunikálhatunk az adatbázissal. SQLite adatbázist fogunk használni.

#### Függőségek letöltése

Telepítsük a működéshez szükséges csomagokat. Futassuk az alábbi parancsokat:

```bash
npm install @prisma/adapter-better-sqlite3@7 @prisma/client@7
npm install -D prisma@7 @types/better-sqlite3
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

Végül adjuk hozzá a státuszokat:

```prisma
enum TicketPhase {
  CREATED
  IN_PROGRESS
  UNDER_REVIEW
}
```

Prismában a kapcsolatokat mindkét modellben definiálni kell, de a módja persze függ a kapcsolat típusától.

**Magyarázat:**

- `enum`: Egy előre definiált értékhalmaz. A ticket csak ezeket az állapotokat veheti fel.

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
A Dinamikus Modulok lehetővé teszik, hogy a modul betöltésekor paramétereket adjunk át neki (például konfigurációkat). Itt egy `forRoot` statikus metódust hoztunk létre. Amikor az `AppModule`-ban meghívtuk a `PrismaModule.forRoot({ isGlobal: true })` kódot, ez a metódus futott le. Ezzel elérjük, hogy a `PrismaService` globális legyen, azaz bármelyik másik modulban (pl. a `BoardsModule`-ban) használható legyen anélkül, hogy újra be kellene importálni.
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

1. A `PrismaService` kibővíti (`extends`) a legenerált `PrismaClient` osztályt. Ezért van az, hogy a `PrismaService`-en keresztül elérjük majd az összes adatbázis metódust (pl. `this.prisma.boards.findMany()`).
2. Kiemelten fontos a beimportált útvonal: `../generated/prisma/client`. Ezt azért tudjuk így használni, mert a `schema.prisma` fájlban módosítottuk az `output` célmappáját.
3. Itt használjuk fel a fejezet elején létrehozott **ConfigModule**-t! A `ConfigService` segítségével biztonságosan, típusosan (`Config` interfésszel) olvassuk ki a `database.url` értékét.
4. Az `OnModuleInit` interfész implementálásával biztosítjuk, hogy amint elindul a NestJS szerverünk, a Prisma azonnal felépítse az adatbázis-kapcsolatot (`this.$connect()`).

---

### A PrismaModule bekötése az AppModule-ba

Most, hogy megvan a `PrismaModule` és a `PrismaService`, regisztrálnunk kell a fő modulunkban is. Nyisd meg a `src/app.module.ts` fájlt, és add hozzá a `PrismaModule.forRoot(...)` hívást:

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    BoardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Magyarázat:**

- `PrismaModule.forRoot({ isGlobal: true })`: A `forRoot` statikus metódus (amit az előbb írtunk meg a modulban) itt hívódik meg. Az `isGlobal: true` paraméter hatására a `PrismaService` az egész alkalmazásban elérhető lesz — nem kell minden egyes modulban (pl. `BoardsModule`, `TicketsModule`) külön importálni a `PrismaModule`-t.

---

### A Boards modul összekötése a Prisma ORM-mel

Most, hogy megvan az adatbázisunk, keltjük életre a 2. fejezetben létrehozott `Boards` végpontokat!

#### A Service összekötése a Prisma ORM-mel

Írjuk meg az üzleti logikát a `boards.service.ts` fájlban. Itt fogjuk a fejezet elején létrehozott `PrismaService`-t használni.

```typescript title="src/boards/boards.service.ts"
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Boards, Ticket, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

  async findOne(id: number): Promise<Boards & { tickets: Ticket[] }> {
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

A relációs adatbázisokban (mint az SQLite) a táblák külön vannak. Alapértelmezés szerint a Prisma csak a `boards` tábla adatait adja vissza, hogy gyors maradjon a lekérdezés. Az `include` kulcsszóval (Eager Loading) viszont megmondjuk a Prismának, hogy menjen el a kapcsolódó `tickets` táblába is, és hozza el az összes olyan hibajegyet, ami ehhez a táblához tartozik. Ezért a visszatérési típus `Boards & { tickets: Ticket[] }` — a Prisma válasza tartalmazza az összes board mezőt, plusz a kapcsolódó jegyeket. A 4. fejezetben ezt egy saját entitásba fogjuk kiszervezni (`BoardWithTickets`).

#### 4. Hibakezelés és HTTP státuszkódok

A HTTP kéréseknél nagyon fontos, hogy megfelelő státuszkódot adjunk vissza hiba esetén (pl. 404, ha nem található valami, vagy 400, ha rossz az adat).
A `findOne` esetében manuálisan ellenőrizzük, hogy létezik-e az adat: `if (!board) throw new NotFoundException(...)`. Ez egy beépített NestJS hiba, ami automatikusan egy 404-es HTTP választ generál a kliensnek.

#### 5. A Prisma hibakódok (P2025) elkapása az `update` és `remove` metódusokban

A frissítésnél és a törlésnél a Prisma automatikusan hibát dob, ha olyan ID-jú elemet próbálunk módosítani, ami nem is létezik az adatbázisban.
Ezt a hibát a `try-catch` blokkban kapjuk el. Az `e instanceof Prisma.PrismaClientKnownRequestError` sorral ellenőrizzük, hogy a Prisma dobott-e ismert hibát.
A **`P2025`** a Prisma hivatalos hibakódja arra, ha _"Egy olyan rekordot próbálsz frissíteni vagy törölni, amely nem található"_. Ha ezt a kódot látjuk, pontosan tudjuk, hogy az elem nem létezik, ezért visszadobunk egy `NotFoundException`-t (404-es hiba). Minden más váratlan hiba esetén `BadRequestException`-t (400-as hiba) küldünk vissza.

#### A Controller összekötése a Service-szel

Most frissítsük a `boards.controller.ts` fájlt, hogy a generált stub metódusok helyett a valódi Service-t hívják, és a `@Body()` paraméterek is a Prisma típusait használják:

```typescript title="src/boards/boards.controller.ts"

  @Post()
  create(@Body() createBoardDto: Prisma.BoardsCreateInput): Promise<Boards> {
    return this.boardsService.create(createBoardDto);
  }
```

```typescript title="src/boards/boards.controller.ts"
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: Prisma.BoardsUpdateInput,
  ): Promise<Boards> {
    return this.boardsService.update(+id, updateBoardDto);
  }
```

**Magyarázat:**

- A `@Body()` paraméterek (`createBoardDto`, `updateBoardDto`) most a Prisma generált típusait (`Prisma.BoardsCreateInput`, `Prisma.BoardsUpdateInput`) kapják meg típusként — ugyanazokat, amiket a Service-ben is használunk.
- Az URL paraméter (`id`) egyelőre szövegként (`string`) érkezik, ezért a `+id` operátorral alakítjuk számmá. A 4. fejezetben ezt egy `ParseIntPipe`-pal fogjuk kiváltani, ami automatikusan elvégzi az átalakítást és validálja is az értéket.

:::info
Ha elakadtál, akkor a chapter-3 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

### A Végpontok tesztelése

A kérések küldéséhez a **REST Client** VS Code-bővítményt fogjuk használni. A workspace `requests/boards.http` fájljában megtalálod az összes előre elkészített kérést — minden kérés felett megjelenik egy **"Send Request"** gomb, kattints rá a küldéshez.

```http
@baseUrl = http://localhost:3000

### Get all boards
GET {{baseUrl}}/boards

###

### Create a board
POST {{baseUrl}}/boards
Content-Type: application/json

{
  "title": "My first board"
}

###

### Get one board (notice the tickets array in the response!)
GET {{baseUrl}}/boards/1

###

### Update a board
PATCH {{baseUrl}}/boards/1
Content-Type: application/json

{
  "title": "Updated board title"
}

###

### Delete a board
DELETE {{baseUrl}}/boards/1
```

**Mit várjunk a válaszoktól?**

- **`GET /boards`** — Először üres tömböt (`[]`) ad vissza. Létrehozás után az összes boardot listázza.
- **`POST /boards`** — Visszaadja az újonnan létrehozott boardot az automatikusan generált `id`-vel és `createdAt` dátummal.
- **`GET /boards/1`** — Visszaadja az adott boardot egy `tickets: []` tömbbel együtt. Ez azért jelenik meg, mert a `findOne` metódusban `include: { tickets: true }` segítségével a kapcsolódó jegyeket is lekérdezzük.
- **`PATCH /boards/1`** — Visszaadja a frissített boardot.
- **`DELETE /boards/1`** — Visszaadja a törölt boardot (utolsó állapotát), majd a következő `GET /boards`-on már nem szerepel.

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**