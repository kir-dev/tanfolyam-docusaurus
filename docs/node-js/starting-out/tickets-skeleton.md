---
sidebar_position: 4
sidebar_label: 'Chapter 4: A Tickets modul és az adatvalidáció'
title: 'Chapter 4: A Tickets modul és az adatvalidáció'
---

Most, hogy megvan az adatbázisunk és a `Boards` modul alapjai, generáljuk le a hibajegyek (Tickets) kezeléséhez szükséges fájlokat, majd töltjük meg mindkét modult valódi tartalommal, validációs szabályokkal és Prisma-kapcsolattal.

### A Tickets modul generálása

A folyamat ugyanaz, mint a Boards esetén:

```bash
nest g res tickets
```

_Válaszd a **REST API**-t, majd **Y**-al a CRUD végpontok generálásához._

A CLI automatikusan beilleszti a `TicketsModule`-t az `AppModule` `imports` tömbjébe, és generálja a szükséges fájlokat:

- `src/tickets/entities/ticket.entity.ts`
- `src/tickets/dto/create-ticket.dto.ts`
- `src/tickets/dto/update-ticket.dto.ts`
- `src/tickets/tickets.controller.ts`
- `src/tickets/tickets.service.ts`

Egyelőre ezek mind üres stubként állnak — ebben a fejezetben töltjük meg őket valódi tartalommal.

---

### Adatvalidáció bevezetése

Mielőtt megírnánk az entitásokat és a service-eket, vezessük be az adatvalidációt. Ez gondoskodik arról, hogy a beérkező HTTP kérések adatai megfelelnek az elvárt formátumnak, mielőtt az adatbázisba kerülnek.

#### Függőségek telepítése

```bash
npm install class-validator@^0.14.1 class-transformer
```

- **`class-validator`**: Dekorátor alapú validációs könyvtár. Segítségével TypeScript osztályok mezőire tehetünk validációs szabályokat.
- **`class-transformer`**: Átalakítja a bejövő JSON adatokat TypeScript osztály-példányokká, hogy a `class-validator` dekorátorok lefuthassanak rajtuk.

#### A ValidationPipe globális bekapcsolása

A NestJS-ben a validáció egy `Pipe` nevű mechanizmuson keresztül működik. Nyisd meg a `src/main.ts` fájlt, és add hozzá a `ValidationPipe`-t:

```typescript title="src/main.ts"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT ?? 3000;
  console.log(`Nestjs is running on port ${port}`);
  await app.listen(port);
}

void bootstrap();
```

A `useGlobalPipes(new ValidationPipe())` utasítás gondoskodik arról, hogy **minden** bejövő HTTP kérés adatai automatikusan validálva legyenek, mielőtt elérnék a Controller metódusokat. Ha a validáció sikertelen, a NestJS automatikusan 400-as (Bad Request) hibát küld vissza.

---

### A Tickets modul véglegesítése

#### Ticket entitás

Módosítsd az `src/tickets/entities/ticket.entity.ts` fájlt. Ez az osztály definiálja az adatstruktúrát és a validációs szabályokat egyszerre:

```typescript title="src/tickets/entities/ticket.entity.ts"
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { TicketPhase } from '../../generated/prisma/client';

export class Ticket {
  @IsNumber()
  @Min(1)
  id: number = 0;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string = '';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string | null = null;

  @IsEnum(TicketPhase)
  ticketPhase: TicketPhase = TicketPhase.CREATED;

  @IsNumber()
  boardsId: number = 0;

  @IsDate()
  createdAt: Date = new Date();

  @IsDate()
  updatedAt: Date = new Date();
}
```

**Magyarázat a dekorátorokhoz:**

- **`@IsNumber()` / `@IsString()`**: Az adott mező csak szám / szöveg lehet.
- **`@Min(1)`**: A szám értéke legalább 1 kell, hogy legyen (az adatbázis ID-k 1-től kezdődnek).
- **`@IsNotEmpty()`**: Szöveges mező nem lehet üres string.
- **`@MinLength(3)` / `@MaxLength(100)`**: A szöveg legalább 3 és legfeljebb 100 karakter hosszú lehet. Dekorátorok tetszőleges számban halmozhatók — a `ValidationPipe` mindegyiket lefuttatja, és az összes megsértett szabályt egyszerre jelzi vissza.
- **`@IsOptional()` + `@MaxLength(500)`**: Ha a mező nincs elküldve, a validátor az összes rá vonatkozó szabályt kihagyja. Ha viszont el van küldve, a `@MaxLength(500)` érvénybe lép — legfeljebb 500 karakter fogadható el.
- **`@IsEnum(TicketPhase)`**: Ellenőrzi, hogy a beérkező státusz csak a Prismában definiált értékek (`CREATED`, `IN_PROGRESS`, `UNDER_REVIEW`) egyike lehet.
- **`@IsDate()`**: Az értéknek érvényes dátumnak kell lennie.

#### DTO-k

A **DTO** (Data Transfer Object — Adatátviteli Objektum) egy egyszerű TypeScript osztály, amelynek egyetlen feladata az, hogy meghatározza: **pontosan milyen adatokat fogad el az API egy adott kérésben**.

##### Miért van szükség DTO-ra, ha már van entitásunk?

Az entitás (`Ticket`) az adatbázis-rekord teljes szerkezetét írja le — beleértve az `id`-t, a `createdAt` és `updatedAt` dátumokat, amelyeket az adatbázis automatikusan kezel. Ezeket a mezőket a felhasználó **nem küldi el** (és nem is szabad, hogy elküldje) a kérésben.

A DTO ezért szűkebb: csak azokat a mezőket tartalmazza, amelyeket a felhasználónak valóban meg kell adnia.

```
Entitás (Ticket)          CreateTicketDto
──────────────────         ──────────────────
id            ✗  ←         (adatbázis adja)
name          ✓  →    →    name
description   ✓  →    →    description
ticketPhase   ✓  →    →    ticketPhase
boardsId      ✓  →    →    boardsId
createdAt     ✗  ←         (adatbázis adja)
updatedAt     ✗  ←         (adatbázis adja)
```

:::tip Miért validálunk a DTO-n és nem az entitáson?
A TypeScript típusok csak fordítási időben léteznek — futásidőben eltűnnek. Ha a felhasználó HTTP kérésen keresztül küld adatot, a TypeScript már nem képes ellenőrizni azt. Ezért van szükség a `class-validator` dekorátorokra az entitáson, és ezért futtatja a `ValidationPipe` ezeket az ellenőrzéseket a beérkező adatokon.
:::

A `@nestjs/mapped-types` csomag segítségével a DTO-kat levezethetjük az entitásból, így nem kell az összes validációs szabályt kézzel megismételni.

```typescript title="src/tickets/dto/create-ticket.dto.ts"
import { OmitType } from '@nestjs/mapped-types';
import { Ticket } from '../entities/ticket.entity';

export class CreateTicketDto extends OmitType(Ticket, ['id', 'createdAt', 'updatedAt'] as const) {}
```

```typescript title="src/tickets/dto/update-ticket.dto.ts"
import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
```

:::tip Mit csinálnak az OmitType és PartialType?
- **`OmitType(Ticket, ['id', 'createdAt', 'updatedAt'] as const)`**: Leszármazik a `Ticket` osztályból, de kihagyja a megadott mezőket. Az `id`, `createdAt` és `updatedAt` mezőket az adatbázis kezeli automatikusan, ezért a felhasználónak nem kell küldenie. Az `as const` biztosítja a pontos TypeScript típuskövetkeztetést.
- **`PartialType(CreateTicketDto)`**: Leszármazik a `CreateTicketDto`-ból, de minden mező opcionálissá válik — ideális a PATCH kérésekhez, ahol csak a módosítani kívánt mezőket küldjük.
:::

#### A Tickets Controller frissítése

Frissítsd az `src/tickets/tickets.controller.ts` fájlt a típusokkal és a `ParseIntPipe`-pal:

```typescript title="src/tickets/tickets.controller.ts"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return this.ticketsService.remove(id);
  }
}
```

**Miért kell a `ParseIntPipe`?** Az URL paraméterek (pl. `/tickets/1`) mindig szövegként érkeznek a HTTP kérésben. A `ParseIntPipe` automatikusan számmá konvertálja és validálja az `id` paramétert — ha nem érvényes szám érkezik (pl. `/tickets/abc`), a NestJS automatikusan 400-as hibát küld vissza.

#### A Tickets Service megírása

Írjuk meg az üzleti logikát. A hibajegyek service-ében van egy fontos újdonság a Boards modulhoz képest: a külső kulcs (Foreign Key) validáció kezelése.

```typescript title="src/tickets/tickets.service.ts"
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Ticket } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: Prisma.TicketUncheckedCreateInput) {
    try {
      return await this.prisma.ticket.create({
        data: createTicketDto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003: Foreign key constraint failed
        if (e.code === 'P2003') {
          throw new NotFoundException(`Board with id ${createTicketDto.boardsId} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException('Could not create ticket');
    }
  }

  async findAll(): Promise<Ticket[]> {
    return await this.prisma.ticket.findMany();
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }

    return ticket;
  }

  async update(id: number, updateTicketDto: Prisma.TicketUncheckedUpdateInput) {
    try {
      return await this.prisma.ticket.update({
        where: { id },
        data: updateTicketDto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Ticket with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not update ticket with id ${id}`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.ticket.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Ticket with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not delete ticket with id ${id}`);
    }
  }
}
```

**Három fontos elem a TicketsService-ben:**

1. **`TicketUncheckedCreateInput` típus:** A Prisma alapértelmezett `TicketCreateInput` típusa összetett (nested) objektumon keresztül várná a kapcsolatot (pl. `board: { connect: { id: 1 } }`). Az "Unchecked" változat engedi a közvetlen `boardsId` megadást, ami illeszkedik a REST API szokásos DTO struktúrájához.

2. **P2003-as Prisma hibakód (Foreign Key Constraint):** Amikor egy új hibajegyet hozunk létre, a `boardsId` mező megmondja, melyik táblához tartozik. Ha a megadott tábla nem létezik, a Prisma `P2003`-as hibát dob. Ezt elkapjuk és felhasználóbarát 404-es választ adunk.

3. **P2025-ös hiba (Record not found):** Ha olyan jegyet próbálunk módosítani vagy törölni, ami nem létezik, a Prisma `P2025`-öt dob — ilyenkor 404-est küldünk vissza.

#### A Végpontok tesztelése

A kérések küldéséhez a **REST Client** VS Code-bővítményt fogjuk használni. A workspace `requests/tickets.http` fájljában megtalálod az összes előre elkészített kérést — minden kérés felett megjelenik egy **"Send Request"** gomb, kattints rá a küldéshez.

```http
@baseUrl = http://localhost:3000

### Get all tickets
GET {{baseUrl}}/tickets

###

### Get one ticket
GET {{baseUrl}}/tickets/1

###

### Create a ticket
POST {{baseUrl}}/tickets
Content-Type: application/json

{
  "name": "Fix login bug",
  "description": "Users cannot log in with Google OAuth",
  "boardsId": 1
}

### Create a ticket with invalid data (400 expected)
POST {{baseUrl}}/tickets
Content-Type: application/json

{
  "name": "ab",
  "boardsId": 1
}
```

A második kérés szándékosan hibás — a `name` csak 2 karakter, ami megsérti a `@MinLength(3)` szabályt. A `ValidationPipe` pontosan megmondja, melyik szabályt sértettük meg:

```json
{
  "message": [
    "name must be longer than or equal to 3 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### A Boards modul véglegesítése

Most, hogy megismertük a validáció és az entitások fogalmát a Tickets modulon keresztül, alkalmazzuk ugyanezt a mintát a már korábban létrehozott `Boards` modulra is.

#### Board entitás

Módosítsd az `src/boards/entities/board.entity.ts` fájlt:

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

#### BoardWithTickets entitás

Szükségünk van egy kibővített típusra is, amit akkor adunk vissza, ha egy adott táblát lekérdezünk a hozzátartozó jegyekkel együtt.

Hozd létre az `src/boards/entities/board-with-tickets.entity.ts` fájlt:

```typescript title="src/boards/entities/board-with-tickets.entity.ts"
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Board } from './board.entity';

export class BoardWithTickets extends Board {
  tickets: Ticket[] = [];
}
```

#### DTO-k

```typescript title="src/boards/dto/create-board.dto.ts"
import { OmitType } from '@nestjs/mapped-types';
import { Board } from '../entities/board.entity';

export class CreateBoardDto extends OmitType(Board, ['id', 'createdAt'] as const) {}
```

```typescript title="src/boards/dto/update-board.dto.ts"
import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
```

#### A Boards Controller frissítése

```typescript title="src/boards/boards.controller.ts"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardWithTickets } from './entities/board-with-tickets.entity';
import { BoardsService } from './boards.service';

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

:::info
Ha elakadtál, akkor a chapter-4 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**