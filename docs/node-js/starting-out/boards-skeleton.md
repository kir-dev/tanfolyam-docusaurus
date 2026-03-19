---
sidebar_position: 2
sidebar_label: "Chapter 2: A Boards modul bevezetése"
title: "Chapter 2: A Boards modul bevezetése"
---

Mielőtt bekötnénk az adatbázist, ismerkedjünk meg a NestJS modul-rendszerrel egy egyszerű példán keresztül! A **Boards** (Táblák) az alkalmazásunk alapentitása — a többi entitás (pl. Tickets) tőle függ —, ezért ezzel kezdünk.

### A Boards modul generálása

A NestJS CLI-vel egyetlen paranccsal generáljuk le az összes szükséges fájlt:

```bash
nest g res boards
```

**Parancs magyarázata:**

- `nest g`: "Nest Generate", azaz valaminek a legenerálását kérjük.
- `res`: "Resource", egy teljes erőforrás csomagot jelent (Controller, Service, Module, DTO-k, Entitás).
- `boards`: A generálandó erőforrás neve.

_A CLI megkérdezi, hogy milyen típusú API-t szeretnél építeni. Válaszd a **REST API**-t, majd válaszolj **Y**-al a CRUD végpontok generálására._

Ez legenerálja nekünk a szabványos **CRUD** (Create, Read, Update, Delete) metódusokat mind a Controllerben, mind a Service-ben. A CLI által generált DTO fájlok (`create-board.dto.ts`, `update-board.dto.ts`) egyelőre üres osztályokat tartalmaznak — a 4. fejezetben fogjuk őket valódi tartalommal megtölteni.

#### Hogyan kötődik be a rendszerbe?

Ha megnyitod az `src/app.module.ts` fájlt, észre fogod venni, hogy a Nest CLI automatikusan beillesztette a `BoardsModule`-t:

```typescript title="src/app.module.ts"
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module'; // Automatikusan importálva a CLI által

@Module({
  imports: [BoardsModule], // Itt csatlakozik be a fő modulba
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Nézzünk bele magába a `BoardsModule`-ba is:

```typescript title="src/boards/boards.module.ts"
import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
```

:::info Providers
A `providers` tömb tartalmazza azokat a szolgáltatásokat, amelyek ebben a modulban jönnek létre és végzik a munkát.
:::

### A Controller és a Service

A CLI által generált Controller és Service fájlokban már megtalálhatók a CRUD műveletek vázai, de egyelőre csak szöveges válaszokat adnak vissza.

#### A Vezérlő (Controller)

```typescript title="src/boards/boards.controller.ts"
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards') // Az összes itteni végpont a /boards útvonalon lesz elérhető
export class BoardsController {
  // Dependency injection: A BoardsService injektálása
  constructor(private readonly boardsService: BoardsService) {}

  @Post() // POST kérés a /boards címre
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto);
  }

  @Get() // GET kérés a /boards címre
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id') // GET kérés pl. /boards/1 címre
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id); // A + operátor string-ből számmá alakít
  }

  @Patch(':id') // PATCH kérés részleges frissítéshez
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id') // DELETE kérés törléshez
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }
}
```

#### A Szolgáltatás (Service)

```typescript title="src/boards/boards.service.ts"
import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  create(createBoardDto: CreateBoardDto) {
    return 'This action adds a new board';
  }

  findAll() {
    return `This action returns all boards`;
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
```

### A Végpontok tesztelése

A kérések küldéséhez a **REST Client** VS Code-bővítményt fogjuk használni. A workspace `requests/boards.http` fájljában megtalálod az összes előre elkészített kérést — minden kérés felett megjelenik egy **"Send Request"** gomb, kattints rá a küldéshez.

```http
@baseUrl = http://localhost:3000

### Get all boards
GET {{baseUrl}}/boards

###

### Get one board
GET {{baseUrl}}/boards/1

###

### Create a board
POST {{baseUrl}}/boards
Content-Type: application/json

{
  "title": "My first board"
}
```

Várható válaszok:
- `GET /boards` → `This action returns all boards`
- `GET /boards/1` → `This action returns a #1 board`
- `POST /boards` → `This action adds a new board`

Ezzel megértettük a NestJS modul-rendszer felépítését! A következő fejezetben bekötjük az adatbázist a Prisma ORM segítségével, és életre keltjük a `Boards` végpontjainkat.

:::info
Ha elakadtál, akkor a [chapter-2](https://github.com/kir-dev/ticketing-api-2026/tree/chapter-2) branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**