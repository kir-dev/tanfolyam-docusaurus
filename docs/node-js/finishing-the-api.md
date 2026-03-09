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

### A dokumentáció megtekintése

Indítsd el az alkalmazást (vagy ha futott, várd meg amíg az SWC újrafordítja):

```bash
npm run start:dev
```

A [http://localhost:3000/api](http://localhost:3000/api) címre navigálva, mostmár a `/tickets` végpontok dokumentációját is láthatod, úgyanúgy mint a `/boards`-ét, a mezők típusával és a validációs szabályokkal együtt.

:::info
Ha elakadtál, akkor a chapter-6 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

## Chapter 7: A címkék implementálása

A hibajegy-kezelő rendszerek (mint például a Jira vagy a Trello) egyik elengedhetetlen funkciója, hogy a jegyeket különböző színű és nevű címkékkel (Labels) láthassuk el. Ebben a fejezetben elkészítjük a címkéket kezelő modult, amelyen keresztül létrehozhatjuk, módosíthatjuk és törölhetjük a projektben elérhető címkéket.

### A Labels modul generálása

A már jól ismert módon hívjuk segítségül a NestJS CLI-t az új erőforrás (Resource) létrehozásához:

```bash
nest g res labels
```

_(Ahogy eddig is, válaszd a **REST API**-t, és kérd a CRUD végpontok legenerálását!)_

:::info Fontos megjegyzés az AppModule-ról
Ha a NestJS CLI-t használod, az automatikusan frissíti a `src/app.module.ts` fájlt, és beleteszi a `LabelsModule`-t az `imports` tömbbe. Ha bármilyen okból kifolyólag ezeket a fájlokat manuálisan hoznád létre, sose felejtsd el kézzel beimportálni a modult a fő modulba, különben a végpontjaid nem fognak élni!
:::

---

### LabelEntity

A címke egy nagyon egyszerű objektum lesz: van egy azonosítója (`id`), egy neve (`name`), és egy színe (`color`), amit hexadecimális kódként (pl. `#FF0000`) fogunk tárolni.

Cseréld le a `labels/entities/label.entity.ts` tartalmát:

```typescript title="src/labels/entities/label.entity.ts"
import { IsHexColor, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class Label {
  @IsNumber()
  @Min(1)
  id: number = 0;

  @IsString()
  @IsNotEmpty()
  name: string = '';

  // Új validációs dekorátor!
  @IsString()
  @IsHexColor()
  color: string = '';
}
```

:::tip Mi az az `@IsHexColor()`?
A `class-validator` könyvtár rengeteg beépített ellenőrzőt tartalmaz. Ahelyett, hogy nekünk kéne egy bonyolult Reguláris Kifejezést (Regex) írnunk annak ellenőrzésére, hogy a felhasználó tényleg egy érvényes színkódot küldött-e (pl. `#1a2b3c`), az `@IsHexColor()` dekorátor ezt automatikusan elvégzi helyettünk. Ha a kliens "piros"-t küld értéknek, a szerver azonnal egy `400 Bad Request` hibával fog válaszolni.
:::

---

### A Label DTO-k

A létrehozáshoz és frissítéshez használt DTO-k szinte azonosak lesznek a korábbi fejezetekben látottakkal. Továbbra is a `@nestjs/swagger` csomagból importáljuk a segédfüggvényeket, hogy az API dokumentációnk is tükrözze a modellt.

```typescript title="src/labels/dto/create-label.dto.ts"
import { OmitType } from '@nestjs/swagger';
import { Label } from '../entities/label.entity';

// Létrehozásnál az 'id'-t az adatbázis generálja, így azt kihagyjuk
export class CreateLabelDto extends OmitType(Label, ['id'] as const) {}
```

```typescript title="src/labels/dto/update-label.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { CreateLabelDto } from './create-label.dto';

// Frissítésnél minden mező opcionálissá válik
export class UpdateLabelDto extends PartialType(CreateLabelDto) {}
```

---

### A LabelsController

A vezérlőben beállítjuk a megfelelő végpontokat és felparaméterezzük őket a Swagger dokumentációs dekorátorokkal.

```typescript title="src/labels/labels.controller.ts"
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Label } from './entities/label.entity';
import { LabelsService } from './labels.service';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  @ApiBody({ type: CreateLabelDto })
  @ApiCreatedResponse({
    description: 'Label successfully created',
    type: Label,
  })
  @ApiBadRequestResponse({ description: 'Could not create label' })
  create(@Body() createLabelDto: CreateLabelDto): Promise<Label> {
    return this.labelsService.create(createLabelDto);
  }

  @Get()
  findAll(): Promise<Label[]> {
    return this.labelsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Label })
  @ApiNotFoundResponse({ description: 'Label not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Label> {
    return this.labelsService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateLabelDto })
  @ApiOkResponse({ type: Label })
  @ApiNotFoundResponse({ description: 'Label not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLabelDto: UpdateLabelDto): Promise<Label> {
    return this.labelsService.update(id, updateLabelDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Label })
  @ApiNotFoundResponse({ description: 'Label not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Label> {
    return this.labelsService.remove(id);
  }
}
```

---

### A LabelsService

Végül megírjuk a Prisma lekérdezéseket a `labels.service.ts` fájlban. Ez a logika már ismerős lehet a `Boards` és `Tickets` modulokból.

```typescript title="src/labels/labels.service.ts"
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

#### A LabelsService működésének áttekintése

Mivel a `Label` entitásunk egy nagyon egyszerű, önálló táblát reprezentál az adatbázisban (nincsenek kötelező külső kulcsai létrehozáskor), a szolgáltatás logikája szinte egy az egyben megegyezik az eddig tanultakkal:

1. **Adatbázis kapcsolat (Dependency Injection):** A konstruktorban injektáljuk a `PrismaService`-t, ezen keresztül érjük el a `this.prisma.label` metódusait.
2. **Keresés és Hibakezelés (`findOne`):** Lekérjük az adott azonosítójú címkét. Ha a Prisma `null` értékkel tér vissza (nem találta), egy manuális `NotFoundException` (404) hibát dobunk a felhasználónak.
3. **Módosítás és Törlés (`update`, `remove`):** Ahogy a korábbi moduloknál már megszokhattuk, a frissítés és törlés műveleteket egy `try-catch` blokkba csomagoljuk. Ha a megadott ID nem létezik az adatbázisban, a Prisma egy ismert **`P2025`**-ös hibakóddal tér vissza. Ezt elkapva egy szép, érthető 404-es HTTP hibaüzenetet (`NotFoundException`) adunk vissza, minden más váratlan adatbázishiba esetén pedig egy általános 400-as hibát (`BadRequestException`).

Ezzel a modullal teljessé vált az alapvető entitásaink (Boards, Tickets, Labels) CRUD műveleteinek sora!

Viszont jelenleg a címkéink még nincsenek összekötve a hibajegyekkel, így hiába hozunk létre egy új címkét, azt nem tudjuk hozzárendelni egy jegyhez. Ez lesz a következő fejezet témája, ahol megvalósítjuk a sok-sok kapcsolathoz szükséges végpontokat, hogy egy jegyhez több címkét is hozzá tudjunk rendelni, és egy címkéhez is több jegy tartozhasson.

:::info
Ha elakadtál, akkor a chapter-7 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

## Chapter 8: Címkék hozzárendelése a hibajegyekhez

A 3. fejezetben, amikor elkészítettük a Prisma sémánkat, egy több-a-többhöz (M-N) kapcsolatot hoztunk létre a `Ticket` és a `Label` modellek között. Ez azt jelenti, hogy egy hibajegynek több címkéje is lehet, és egy címke több hibajegyen is szerepelhet. Ebben a fejezetben megírjuk azokat a végpontokat, amikkel összekapcsolhatjuk (vagy éppen szétválaszthatjuk) ezeket az entitásokat.

### TicketWithLabels modell

Ahhoz, hogy a Swagger dokumentációnk és a TypeScript típusaink is tudják, hogy egy hibajegy lekérdezésekor most már a címkéket is visszaadjuk, egy kiterjesztett osztályt kell létrehoznunk.

Hozd létre a `src/tickets/entities/ticket-with-labels.entity.ts` fájlt:

```typescript title="src/tickets/entities/ticket-with-labels.entity.ts"
import { Label } from '../../labels/entities/label.entity';
import { Ticket } from './ticket.entity';

export class TicketWithLabels extends Ticket {
  labels: Label[] = [];
}
```

**Magyarázat:** Mivel ez az osztály leszármazik (öröklődik) a `Ticket` osztályból, ezért annak az összes validációs szabálya és Swagger dekorátora megmarad rajta. Egyetlen dologgal bővítjük: egy `labels` tömbbel. Ez a struktúra pontosan le fogja modellezni azt az objektumot, amit az adatbázisból fogunk visszakapni a relációk lekérése után.

---

### A GET végpontok frissítése

Most módosítanunk kell a meglévő `findAll` és `findOne` végpontjainkat a `Tickets` modulban, hogy ne csak a nyers hibajegyet, hanem a hozzá tartozó címkéket is visszaadják.

#### 1. A TicketsController módosítása

Importáld be az új entitást, és frissítsd a két `GET` metódust a `src/tickets/tickets.controller.ts` fájlban:

```typescript title="src/tickets/tickets.controller.ts"
// ... korábbi importok
import { TicketWithLabels } from './entities/ticket-with-labels.entity';

// ... az osztály korábbi részei

  @Get()
  @ApiOkResponse({
    type: TicketWithLabels, // Itt cseréltük az entitást
    isArray: true,
    description: 'All tickets',
  })
  findAll(): Promise<TicketWithLabels[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TicketWithLabels }) // Itt is cseréltük az entitást
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TicketWithLabels> {
    return this.ticketsService.findOne(id);
  }

// ... az osztály további részei
```

#### 2. A TicketsService módosítása

Hogy a kérés ki is szolgálja ezeket az adatokat, a Prisma lekérdezéseit is frissítenünk kell a `src/tickets/tickets.service.ts` fájlban. Ne felejtsd el beimportálni felülre a `TicketWithLabels` osztályt!

```typescript title="src/tickets/tickets.service.ts"
// ... korábbi importok
import { TicketWithLabels } from './entities/ticket-with-labels.entity';

// ... az osztály korábbi részei

  async findAll(): Promise<TicketWithLabels[]> {
    return await this.prisma.ticket.findMany({
      include: {
        labels: true,
      },
    });
  }

  async findOne(id: number): Promise<TicketWithLabels> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        labels: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with id ${id} not found`);
    }
    return ticket;
  }

```

**Magyarázat:** A Prisma `findMany` és `findUnique` metódusainál hozzáadtuk az `include` opciót, amiben megmondjuk, hogy a `labels` relációt is szeretnénk visszakapni. Így a lekérdezés nem csak a hibajegy adatait fogja visszaadni, hanem egy `labels` tömböt is, amiben az összes hozzárendelt címke szerepelni fog.

---

### Új végpontok a Controllerben

A hibajegyhez egy címkét hozzárendelni alapvetően a hibajegy egyfajta "módosítása", ezért `PATCH` kérést fogunk használni. A leválasztáshoz pedig a szemantikus `DELETE` metódust választjuk.

Nyisd meg a `src/tickets/tickets.controller.ts` fájlt, és add hozzá az osztályhoz a következő két új metódust:

```typescript title="src/tickets/tickets.controller.ts"
  @Patch(':ticketId/assign/:labelId')
  @ApiOkResponse({ type: TicketWithLabels })
  @ApiNotFoundResponse({
    description:
      'Ticket or label with given id not found. You can deduce which one from the error message',
  })
  @ApiBadRequestResponse({ description: 'Could not assign label' })
  assignLabel(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Param('labelId', ParseIntPipe) labelId: number,
  ): Promise< TicketWithLabels > {
    return this.ticketsService.assignLabel(ticketId, labelId);
  }

  @Delete(':ticketId/assign/:labelId')
  @ApiOkResponse({
    description:
      "The label was successfully removed from the ticket. Worth to note, that this returns 200 even if the label wasn't connected to the ticket.",
    type: TicketWithLabels,
  })
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  @ApiBadRequestResponse({ description: 'Could not remove label' })
  removeLabel(
    @Param('ticketId', ParseIntPipe) ticketId: number,
    @Param('labelId', ParseIntPipe) labelId: number,
  ): Promise< TicketWithLabels > {
    return this.ticketsService.removeLabel(ticketId, labelId);
  }
```

**Magyarázat:**

- Az útvonal mindkét esetben két dinamikus paramétert vár: `ticketId` és `labelId`. Például a `PATCH /tickets/5/assign/2` azt jelenti, hogy az 5-ös számú hibajegyre rárakjuk a 2-es azonosítójú címkét.
- Két darab `@Param` dekorátort is használunk, hogy mindkét azonosítót kinyerjük az URL-ből, és a `ParseIntPipe` gondoskodik róla, hogy ezek biztosan számok legyenek.

---

### Az üzleti logika a Service-ben

Most megírjuk a Prisma lekérdezéseket a `src/tickets/tickets.service.ts` fájlban, amelyek ténylegesen elvégzik a több-a-többhöz kapcsolatok módosítását.

Először is győződj meg róla, hogy beimportáltad a `Prisma` névteret a fájl tetején:

```typescript
import { Prisma } from '../generated/prisma/client';
```

Ezután add hozzá az osztályhoz az alábbi két metódust:

```typescript title="src/tickets/tickets.service.ts"
  async assignLabel(
    ticketId: number,
    labelId: number,
  ): Promise< TicketWithLabels > {
    try {
      return await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          labels: {
            // A 'connect' kulcsszó köti össze a két meglévő rekordot
            connect: { id: labelId },
          },
        },
        // Itt is megkérjük a Prismát, hogy adja vissza a címkéket a végeredményben
        include: {
          labels: true,
        },
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Ha a címke nem létezik
        if (e.code === 'P2025') {
          throw new NotFoundException('Invalid label id');
        }
        // Ha a hibajegy nem létezik
        if (e.code === 'P2016') {
          throw new NotFoundException('Invalid ticket id');
        }
      }
      throw new BadRequestException(`Could not assign label to ticket`);
    }
  }

  async removeLabel(
    ticketId: number,
    labelId: number,
  ): Promise< TicketWithLabels > {
    try {
      return await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          labels: {
            // A 'disconnect' megszünteti a kapcsolatot a két rekord között
            disconnect: { id: labelId },
          },
        },
        include: {
          labels: true,
        },
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException('Invalid label id');
        }
      }
      throw new BadRequestException(`Could not remove label from ticket`);
    }
  }
```

### A kód működésének magyarázata:

1. **`connect` és `disconnect` a Prismában:**
   Amikor több-a-többhöz (M-N) kapcsolatot kezelünk, a Prisma nagyon elegáns megoldást nyújt. Ahelyett, hogy nekünk kéne manuálisan SQL beszúrásokat végezni egy rejtett kapcsolótáblába, egyszerűen a `connect` paranccsal összekötjük az azonosítókat, a `disconnect` paranccsal pedig felbontjuk a kapcsolatot.
2. **Az `include` használata módosításkor:**
   Bár az `update` metódus alapvetően módosítja az adatot, a Prisma azonnal vissza is tér a frissített objektummal. Az `include: { labels: true }` segítségével elérjük, hogy a sikeres összekötés (vagy leválasztás) után a válasz tartalmazza a hibajegy jelenlegi összes címkéjét is. Így a kliens (pl. a frontend alkalmazás) egyből látja a művelet sikerességét, és újra tudja rajzolni a felületet.
3. **P2016 és P2025 hibakódok:**
   - Ha olyan címkét próbálunk hozzákapcsolni (`connect`), ami nem létezik, a Prisma **P2025**-ös (Record not found) hibát dob.
   - Ha a hibajegy nem létezik, amire a címkét raknánk, érdekes módon a Prisma **P2016**-os hibát ad vissza ebben a specifikus relációs kontextusban (Query interpretation error). Ezeket a specifikus Prisma hibákat elkapva rendkívül pontos és beszédes hibaüzeneteket küldhetünk vissza a felhasználónak!
4. **Idempotens műveletek:**
   - A `connect` művelet idempotens, ami azt jelenti, hogy ha egy címke már hozzá van rendelve egy hibajegyhez, és újra megpróbáljuk hozzákapcsolni, a Prisma nem dob hibát, hanem egyszerűen "nem csinál semmit". Ez megkönnyíti a frontend fejlesztést, mert nem kell előtte ellenőrizni, hogy a kapcsolat már létezik-e.
   - Hasonlóan, a `disconnect` művelet is idempotens, így ha megpróbálunk leválasztani egy címkét, ami nincs is hozzárendelve a jegyhez, a Prisma szintén nem dob hibát.

Ezzel a két új végponttal most már teljesen működőképes a címkék és hibajegyek közötti kapcsolat kezelése! A frontend fejlesztők mostantól könnyedén tudnak címkéket rendelni a jegyekhez, vagy éppen eltávolítani azokat, és a változások azonnal tükröződnek a lekérdezésekben is.

:::info
Ha elakadtál, akkor a chapter-8 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

## Chapter 9: Logger Middleware

Ez a fejezet egy opcionális, de annál hasznosabb kiegészítése az alkalmazásunknak. Létrehozunk egy saját **Logger Middleware**-t, amely minden beérkező HTTP kérésnél kiírja a konzolra, hogy pontosan mennyi ideig tartott annak feldolgozása. Ez a valós (production) környezetben életmentő lehet a lassú végpontok és adatbázis-lekérdezések felderítésében.

### Mik azok a Middleware-ek?

A **Middleware** (Köztesréteg) egy olyan függvény, amely a kliens kérése (Request) és a mi végpontunk (Controller) lefutása _között_ helyezkedik el. Képes:

- Belenézni a kérésbe vagy módosítani azt (pl. autentikációs tokenek ellenőrzése).
- Megszakítani a kérést, ha valami hibát észlel.
- Továbbengedni a kérést a következő rétegnek (a `next()` függvény meghívásával).
- Valamilyen kódot futtatni a válasz (Response) kiküldése után.

Bár a NestJS elrejti előlünk, a háttérben az Express.js (vagy Fastify) motor hajtja, így a middleware-ek pontosan ugyanúgy működnek, mint egy hagyományos Express alkalmazásban.

### A Common Modul és a Middleware létrehozása

Hozzuk létre az alkalmazásban egy közös, általános célú modult (`common`), amiben az ilyen segédfüggvényeket tárolhatjuk. Hozz létre egy `src/common` mappát, benne pedig egy `logger.middleware.ts` fájlt:

```typescript title="src/common/logger.middleware.ts"
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now(); // Eltároljuk a kérés kezdetének időpontját

    // Feliratkozunk a válasz 'finish' (befejezés) eseményére
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${method}] ${originalUrl} - ${res.statusCode} - ${duration}ms`);
    });

    // Továbbadjuk a vezérlést az alkalmazás többi részének
    next();
  }
}
```

#### Hogyan működik ez a kód?

1. Amikor beérkezik egy kérés, kiolvassuk belőle a HTTP metódust (pl. `GET`) és az URL-t (pl. `/tickets/1`).
2. A `Date.now()` segítségével feljegyezzük az aktuális milliszekundumot (`start`).
3. **Nagyon fontos:** Nem itt számoljuk ki az időt, hiszen a feldolgozás még el sem kezdődött! Ehelyett a `res.on('finish', ...)` kóddal feliratkozunk egy eseményre, ami akkor fut le, amikor a NestJS már teljesen végzett a kéréssel, és kiküldte a választ a felhasználónak.
4. A `next()` meghívása kritikus fontosságú. Ha ezt kihagyjuk, a kérés "lógva marad" (timeout), és soha nem jut el a Controllerig.

### A Middleware regisztrálása a Common Modulban

Hozzunk létre egy modulfájlt is a `src/common` mappában, hogy be tudjuk kötni a NestJS Dependency Injection (Függőség injektálás) rendszerébe:

```typescript title="src/common/common.module.ts"
import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  exports: [LoggerMiddleware],
  providers: [LoggerMiddleware],
})
export class CommonModule {}
```

### A Middleware bekötése az AppModule-ba

Végül meg kell mondanunk a fő modulunknak (`AppModule`), hogy használja ezt a middleware-t. Nyisd meg a `src/app.module.ts` fájlt.

Először is importáld be a szükséges osztályokat és az új modulunkat:

```typescript title="src/app.module.ts" (részlet)
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/logger.middleware';
```

A modult add hozzá az `imports` tömbhöz:

```typescript title="src/app.module.ts" (részlet)
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    TicketsModule,
    BoardsModule,
    LabelsModule,
    CommonModule, // Itt adjuk hozzá a CommonModule-t!
  ],
```

Végül implementáld a `NestModule` interfészt magán az `AppModule` osztályon, és konfiguráld be a middleware-t:

```typescript title="src/app.module.ts" (részlet)
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // A LoggerMiddleware-t minden ('*') útvonalra rákötjük
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
```

#### Próbáld ki!

Most indítsd el a szervert (`npm run start:dev`), és küldj pár kérést mondjuk a Swagger felületről (http://localhost:3000/api). Ha megnyitod a szervered terminálját, látni fogod a lekérésekhez tartozó logokat a HTTP metódussal, az útvonallal, a válaszkóddal és a feldolgozási idővel együtt:

```bash
[GET] /api - 200 - 5ms
[GET] /tickets - 200 - 12ms
[POST] /boards - 201 - 25ms
[GET] /tickets/999 - 404 - 8ms
```

:::info
Ha elakadtál, akkor a chapter-8 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**
