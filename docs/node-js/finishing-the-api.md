---
sidebar_position: 3
---

# Node.js tanfolyam - 3. alkalom

## Chapter 6: A Tickets Modul véglegesítése

A korábbi fejezetekben legeneráltuk a `Tickets` modult, de a logikája még üres volt, és nem kapcsolódott a Prisma adatbázishoz. Ebben a fejezetben ezt pótoljuk: felépítjük a végleges Entitást, a DTO-kat, és megírjuk az üzleti logikát a Swagger dokumentációval együtt.

### A DTO-k véglegesítése

A hibajegyek létrehozásánál és frissítésénél a `@nestjs/swagger` csomagból importált függvényeket fogjuk használni, ahogy azt az 5. fejezetben megtanultuk.

Módosítsd a `create-ticket.dto.ts` fájlt:

```typescript title="src/tickets/dto/create-ticket.dto.ts"
import { OmitType } from '@nestjs/swagger';
import { Ticket } from '../entities/ticket.entity';

export class CreateTicketDto extends OmitType(Ticket, ['id', 'createdAt', 'updatedAt']) {}
```

**Magyarázat:** Itt nem csak az `id`-t és a `createdAt`-et hagyjuk ki a felhasználó által beküldhető adatok közül, hanem az `updatedAt` mezőt is, hiszen ezt is a Prisma fogja automatikusan kezelni (a sémában korábban megadott `@updatedAt` attribútum miatt).

Módosítsd az `update-ticket.dto.ts` fájlt is (itt csak az import változik a Swagger miatt):

```typescript title="src/tickets/dto/update-ticket.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
```

---

### TicketEntity

Most írjuk meg a valódi `Ticket` entitást, felvértezve a validációs szabályokkal.

```typescript title="src/tickets/entities/ticket.entity.ts"
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
// Ezt a típust a Prisma generálta a schema.prisma alapján!
import { TicketPhase } from '../../generated/prisma/client';

export class Ticket {
  @IsNumber()
  @Min(1)
  id: number = 0;

  @IsString()
  @IsNotEmpty()
  name: string = '';

  @IsString()
  @IsOptional()
  description: string | null = null;

  @IsEnum(TicketPhase)
  @ApiProperty({ enum: TicketPhase })
  ticketPhase: TicketPhase = TicketPhase.CREATED;

  @IsNumber()
  boardsId: number = 0;

  @IsDate()
  createdAt: Date = new Date();

  @IsDate()
  updatedAt: Date = new Date();
}
```

:::info Új validációs elemek és a Swagger

1. **`@IsOptional()`**: A `description` mezőnk a Prisma sémában `String?` (opcionális) volt. Ez a dekorátor jelzi a NestJS-nek, hogy ne dobjon hibát, ha a felhasználó nem küld leírást.
2. **`@IsEnum(TicketPhase)`**: Ellenőrzi, hogy a beérkező státusz csak a Prismában definiált értékek (CREATED, IN_PROGRESS, UNDER_REVIEW) egyike lehet.
3. **`@ApiProperty({ enum: TicketPhase })`**: Bár az 5. fejezetben beállított CLI plugin nagyon okos, az Enumokkal (felsorolás típusokkal) néha meggyűlik a baja. Ezzel a Swagger-specifikus dekorátorral kézzel kényszerítjük ki, hogy a dokumentációban gyönyörűen, legördülő menüben jelenjenek meg a lehetséges státuszok.
   :::

---

### TicketsController

A Controllerben most már explicitly dokumentáljuk a lehetséges HTTP válaszokat (sikeres és hibás eseteket is). Ezt a Swagger UI nagyon szépen fogja megjeleníteni.

```typescript title="src/tickets/tickets.controller.ts"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiBody({ type: CreateTicketDto })
  @ApiCreatedResponse({
    description: 'Successfully created ticket',
    type: Ticket,
  })
  @ApiNotFoundResponse({ description: 'No board exists with given id' })
  @ApiBadRequestResponse({ description: 'Could not create ticket' })
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOkResponse({
    type: Ticket,
    isArray: true,
    description: 'All tickets',
  })
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateTicketDto })
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  @ApiBadRequestResponse({ description: 'Could not update ticket' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Ticket })
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  @ApiBadRequestResponse({ description: 'Could not delete ticket' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Ticket> {
    return this.ticketsService.remove(id);
  }
}
```

:::tip Miért írunk ennyi Swagger dekorátort?
A CLI plugin az esetek többségében kikövetkezteti a sikeres (200-as vagy 201-es) válaszokat a függvény visszatérési típusából (`Promise<Ticket>`). Azonban a **hibákat (404, 400)** nem tudja kitalálni. Az `@ApiNotFoundResponse` és társai segítségével a frontend fejlesztők pontosan tudni fogják, milyen hibaüzenetekre számíthatnak, ha rossz adatot küldenek.
:::

---

### TicketsService

A hibajegyek service-e hasonló a BoardsService-hez, de a létrehozásnál van egy nagyon fontos logikai elem, amit le kell kezelnünk: a külső kulcs (Foreign Key) validáció.

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

A TicketsService-ben három fontos új elem van, amiket érdemes részletesen megérteni:

#### 1. A P2003-as Prisma hibakód elkapása (Foreign Key Constraint)

A `create` metódusban van egy újdonság a korábbi (Boards) modulunkhoz képest. Amikor egy új hibajegyet hozunk létre, át kell adnunk a `boardsId` mezőt, ami megmondja, melyik táblához (Board) tartozik ez a jegy.

Mi történik, ha a felhasználó (vagy a frontend) egy olyan `boardsId`-t küld, ami **nem létezik** az adatbázisban (például `999`)?
Mivel a 3. fejezetben a Prisma sémánkban összekapcsoltuk a `Ticket` és `Boards` táblákat egy relációval, az adatbázis megakadályozza az érvénytelen adat beszúrását (Külső kulcs megszorítás / Foreign Key Constraint).

A Prisma ilyenkor egy **`P2003`**-as kóddal ellátott ismert hibát (`PrismaClientKnownRequestError`) dob, aminek a jelentése: _"A kapcsolódó rekord nem található"_. Mi ezt a hibát a `try-catch` blokkban elkapjuk, és egy sokkal felhasználóbarátabb, `NotFoundException` (404-es HTTP státusz) választ adunk vissza a kliensnek: `"Board with id 999 not found"`. Minden más adatbázishiba esetén (például ha az adatbázis kiszolgáló leállt) továbbra is 400-as `BadRequestException`-t küldünk.

#### 2. A "Unchecked" típusok használata (`TicketUncheckedCreateInput`)

A `create` és `update` metódusok paraméterében egy érdekes típust használunk a Prismától: `Prisma.TicketUncheckedCreateInput`.
A Prisma alapértelmezett típusai (pl. `TicketCreateInput`) elvárnák, hogy az adatbázis kapcsolatot egy összetett (nested) objektumon keresztül definiáljuk a létrehozás során, például így:

```json
{
  "name": "Hibajegy",
  "board": {
    "connect": { "id": 1 }
  }
}
```

Azonban a mi REST API-nk sokkal egyszerűbben várja az adatokat a DTO-ban, a relációs azonosítót közvetlenül megadva:

```json
{
  "name": "Hibajegy",
  "boardsId": 1
}
```

A Prisma **"Unchecked"** input típusai pontosan ezt engedik meg: közvetlenül megadhatjuk a kapcsolódó tábla azonosítóját (Foreign Key), így tökéletesen illeszkedik a hagyományos REST alapú DTO struktúránkhoz, extra adatkonverzió nélkül.

#### 3. A P2025-ös hiba (Record not found)

A `update` és `remove` metódusokban ugyanazt a logikát alkalmazzuk, mint amit a `BoardsService`-ben már megismertünk. Ha olyan hibajegyet próbálunk szerkeszteni vagy törölni, ami nem létezik (például valaki már letörölte előttünk), a Prisma egy **`P2025`**-ös hibát dob. Ezt szintén elkapjuk, és `NotFoundException` (404) választ generálunk belőle, míg a többi hibát általános `BadRequestException` (400) kíséretében küldjük vissza.

## A dokumentáció megtekintése

Indítsd el az alkalmazást (vagy ha futott, várd meg amíg az SWC újrafordítja):

```bash
npm run start:dev
```

A [http://localhost:3000/api](http://localhost:3000/api) címre navigálva, mostmár a `/tickets` végpontok dokumentációját is láthatod, úgyanúgy mint a `/boards`-ét, a mezők típusával és a validációs szabályokkal együtt.

:::info
Ha elakadtál, akkor a chapter-6 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::
