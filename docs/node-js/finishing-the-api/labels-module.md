---
sidebar_position: 3
sidebar_label: 'Chapter 7: A Labels modul és a hibajegyek összekapcsolása'
title: 'Chapter 7: A Labels modul és a hibajegyek összekapcsolása'
---

A hibajegy-kezelő rendszerek (mint például a Jira vagy a Trello) egyik elengedhetetlen funkciója, hogy a jegyeket különböző színű és nevű címkékkel (Labels) láthassuk el. Ebben a fejezetben elkészítjük a teljes Labels modult — a Prisma sémától a CRUD végpontokon át egészen a hibajegyekkel való **több-a-többhöz (M:N)** összekapcsolásig.

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

### Adatbázis-kapcsolatok röviden

A korábbi fejezetekben már használtunk egy **egy-a-többhöz (1:N)** kapcsolatot: egy `Board`-hoz sok `Ticket` tartozhat, de egy `Ticket` csak egy `Board`-hoz.

A Labels modul bevezetéséhez egy új kapcsolattípusra lesz szükségünk: **több-a-többhöz (M:N)**.

**Miért M:N a kapcsolat a Ticket és a Label között?**

- Egy hibajegynek (`Ticket`) **több** címkéje is lehet (pl. `bug`, `urgent`)
- Egy címkét (`Label`) **több** hibajegyre is fel lehet rakni

Ha ezt egy hagyományos 1:N kapcsolattal próbálnánk megoldani, az nem működne: a `Ticket`-ben nem tárolhatnánk több `labelId`-t egy mezőben.

A megoldás egy **kapcsolótábla** (junction table): egy rejtett, köztes tábla, amely párokat tárol — minden sor egy (ticket, label) összerendelést jelent.

```
Ticket                _LabelToTicket         Label
──────                ──────────────         ─────
id: 1    ──────────►  ticketId: 1  ◄──────── id: 10 (bug)
                      labelId:  10
id: 1    ──────────►  ticketId: 1  ◄──────── id: 11 (urgent)
                      labelId:  11
id: 2    ──────────►  ticketId: 2  ◄──────── id: 10 (bug)
                      labelId:  10
```

A Prisma ezt a kapcsolótáblát **automatikusan kezeli** — nekünk soha nem kell közvetlenül hozzányúlnunk.

---

### A Prisma séma bővítése

Mielőtt bármilyen kódot írnánk, bővítsük az adatbázis sémánkat. Nyisd meg a `prisma/schema.prisma` fájlt, add hozzá a `Label` modellt, és egészítsd ki a `Ticket` modellt a kapcsolatmezővel:

```prisma
model Label {
  id      Int      @id @default(autoincrement())
  name    String
  color   String
  tickets Ticket[]
}

model Ticket {
  // ... meglévő mezők
  labels Label[]
}
```

**Magyarázat:** A Prisma felismeri, hogy mindkét modell hivatkozik a másikra egy tömb típusú mezőn keresztül, és ebből automatikusan egy **implicit M:N relációt** hoz létre. A háttérben Prisma egy rejtett kapcsolótáblát (`_LabelToTicket`) generál, amelyet a `connect` és `disconnect` műveletek fognak kezelni — nekünk ezt a táblát soha nem kell közvetlenül érintenünk.

#### Migráció futtatása

```bash
npx prisma migrate dev --name add-labels
```

Ez a parancs:
1. Létrehozza a szükséges SQL migrációs fájlokat (a `Label` tábla és a `_LabelToTicket` kapcsolótábla).
2. Lefuttatja a migrációt, így a `dev.db`-ben megjelennek az új táblák.
3. Automatikusan újragenerálja a Prisma klienst — ezután a `this.prisma.label` metódusok és a `labels.connect`/`labels.disconnect` operátorok is elérhetők lesznek.

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
import { Label, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLabelDto: Prisma.LabelCreateInput): Promise<Label> {
    try {
      return await this.prisma.label.create({
        data: createLabelDto,
      });
    } catch (e) {
      console.error(e);
      throw new BadRequestException('Could not create label');
    }
  }

  async findAll(): Promise<Label[]> {
    return await this.prisma.label.findMany();
  }

  async findOne(id: number): Promise<Label> {
    const label = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!label) {
      throw new NotFoundException(`Label with id ${id} not found`);
    }

    return label;
  }

  async update(id: number, updateLabelDto: Prisma.LabelUpdateInput): Promise<Label> {
    try {
      return await this.prisma.label.update({
        where: { id },
        data: updateLabelDto,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Label with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not update label with id ${id}`);
    }
  }

  async remove(id: number): Promise<Label> {
    try {
      return await this.prisma.label.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException(`Label with id ${id} not found`);
        }
      }
      console.error(e);
      throw new BadRequestException(`Could not delete label with id ${id}`);
    }
  }
}
```

**A LabelsService működésének áttekintése:**

1. **Típusbiztonság Prisma típusokkal:** A `create` és `update` metódusok `Prisma.LabelCreateInput` és `Prisma.LabelUpdateInput` típusokat használnak — ugyanúgy, ahogy a Boards modulban tanultuk.
2. **Keresés és Hibakezelés (`findOne`):** Ha a Prisma `null` értékkel tér vissza, egy manuális `NotFoundException` (404) hibát dobunk.
3. **Módosítás és Törlés (`update`, `remove`):** A `P2025`-ös hibakódot elkapva érthető 404-es hibaüzenetet adunk vissza, minden más váratlan hibánál 400-ast.

---

### Címkék összekapcsolása a hibajegyekkel

Most, hogy a Labels CRUD végpontjai készen vannak, megvalósítjuk a hibajegyekkel való összekapcsolást. Az ehhez szükséges végpontokat a `Tickets` modulban helyezzük el.

#### TicketWithLabels entitás

Ahhoz, hogy a Swagger dokumentációnk és a TypeScript típusaink is tudják, hogy egy hibajegy lekérdezésekor most már a címkéket is visszaadjuk, egy kiterjesztett osztályt kell létrehoznunk.

Hozd létre a `src/tickets/entities/ticket-with-labels.entity.ts` fájlt:

```typescript title="src/tickets/entities/ticket-with-labels.entity.ts"
import { Label } from '../../labels/entities/label.entity';
import { Ticket } from './ticket.entity';

export class TicketWithLabels extends Ticket {
  labels: Label[] = [];
}
```

**Magyarázat:** Mivel ez az osztály leszármazik (öröklődik) a `Ticket` osztályból, ezért annak az összes validációs szabálya és Swagger dekorátora megmarad rajta. Egyetlen dologgal bővítjük: egy `labels` tömbbel.

---

#### A GET végpontok frissítése a Tickets modulban

Módosítanunk kell a meglévő `findAll` és `findOne` végpontjainkat, hogy ne csak a nyers hibajegyet, hanem a hozzá tartozó címkéket is visszaadják.

##### 1. A TicketsController módosítása

Importáld be az új entitást, és frissítsd a két `GET` metódust a `src/tickets/tickets.controller.ts` fájlban:

```typescript title="src/tickets/tickets.controller.ts"
// ... korábbi importok
import { TicketWithLabels } from './entities/ticket-with-labels.entity';

// ... az osztály korábbi részei

  @Get()
  @ApiOkResponse({
    type: TicketWithLabels,
    isArray: true,
    description: 'All tickets',
  })
  findAll(): Promise<TicketWithLabels[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TicketWithLabels })
  @ApiNotFoundResponse({ description: 'Ticket with given id not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TicketWithLabels> {
    return this.ticketsService.findOne(id);
  }

// ... az osztály további részei
```

##### 2. A TicketsService módosítása

Frissítsd a Prisma lekérdezéseket a `src/tickets/tickets.service.ts` fájlban:

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

**Magyarázat:** Az `include: { labels: true }` hatására a lekérdezés a hibajegy adatai mellett egy `labels` tömböt is visszaad az összes hozzárendelt címkével.

---

#### Új végpontok a Controllerben

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
  ): Promise<TicketWithLabels> {
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
  ): Promise<TicketWithLabels> {
    return this.ticketsService.removeLabel(ticketId, labelId);
  }
```

**Magyarázat:** Az útvonal mindkét esetben két dinamikus paramétert vár: `ticketId` és `labelId`. Például a `PATCH /tickets/5/assign/2` azt jelenti, hogy az 5-ös számú hibajegyre rárakjuk a 2-es azonosítójú címkét.

---

#### Az üzleti logika a Service-ben

Most megírjuk a Prisma lekérdezéseket a `src/tickets/tickets.service.ts` fájlban. Először is győződj meg róla, hogy beimportáltad a `Prisma` névteret a fájl tetején:

```typescript
import { Prisma } from '../generated/prisma/client';
```

Ezután add hozzá az osztályhoz az alábbi két metódust:

```typescript title="src/tickets/tickets.service.ts"
  async assignLabel(
    ticketId: number,
    labelId: number,
  ): Promise<TicketWithLabels> {
    try {
      return await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          labels: {
            // A 'connect' kulcsszó köti össze a két meglévő rekordot
            connect: { id: labelId },
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
  ): Promise<TicketWithLabels> {
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

**A kód működésének magyarázata:**

1. **`connect` és `disconnect` a Prismában:**
   Amikor M:N kapcsolatot kezelünk, a Prisma nagyon elegáns megoldást nyújt. Ahelyett, hogy manuálisan SQL beszúrásokat végeznénk a rejtett kapcsolótáblába, egyszerűen a `connect` paranccsal összekötjük az azonosítókat, a `disconnect` paranccsal pedig felbontjuk a kapcsolatot.
2. **Az `include` használata módosításkor:**
   Az `include: { labels: true }` segítségével a sikeres összekötés (vagy leválasztás) után a válasz tartalmazza a hibajegy jelenlegi összes címkéjét is.
3. **P2016 és P2025 hibakódok:**
   - Ha olyan címkét próbálunk hozzákapcsolni, ami nem létezik, a Prisma **P2025**-ös hibát dob.
   - Ha a hibajegy nem létezik, a Prisma **P2016**-os hibát ad vissza ebben a relációs kontextusban.
4. **Idempotens műveletek:**
   - A `connect` idempotens: ha a kapcsolat már létezik, a Prisma nem dob hibát.
   - A `disconnect` szintén idempotens: ha a kapcsolat nem is létezik, a Prisma nem dob hibát.

:::info
Ha elakadtál, akkor a chapter-8 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**