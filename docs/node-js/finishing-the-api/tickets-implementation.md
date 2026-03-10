---
sidebar_position: 2
sidebar_label: 'Chapter 6: A Tickets Modul Swagger dokumentálása'
title: 'Chapter 6: A Tickets Modul Swagger dokumentálása'
---

A 4. fejezetben megírtuk a `Tickets` modul teljes implementációját: az entitást, a DTO-kat, a Controller-t és a Service-t. Az előző fejezetben bevezettük a Swaggert, és frissítettük a `Boards` modult. Most ugyanezt tesszük a `Tickets` modullal is.

### A Ticket entitás kiegészítése

A Swagger CLI plugin az esetek többségében automatikusan felismeri a típusokat, de az Enum típusoknál segítséget kell adnunk neki. Add hozzá a `@ApiProperty` dekorátort a `ticketPhase` mezőhöz:

```typescript title="src/tickets/entities/ticket.entity.ts"
import { ApiProperty } from '@nestjs/swagger';
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

:::info Miért kell az `@ApiProperty` az Enum-nál?
Bár az előző fejezetben beállított CLI plugin nagyon okos, az Enum típusokkal néha meggyűlik a baja. Ezzel a Swagger-specifikus dekorátorral kézzel kényszerítjük ki, hogy a dokumentációban gyönyörűen, legördülő menüben jelenjenek meg a lehetséges státuszok.
:::

---

### A DTO-k importjának frissítése

Ahogy a `Boards` modulnál is tettük, cseréljük le a `@nestjs/mapped-types` importokat `@nestjs/swagger`-re, hogy a Swagger is értelmezni tudja a DTO struktúrákat.

```typescript title="src/tickets/dto/create-ticket.dto.ts"
import { OmitType } from '@nestjs/swagger';
import { Ticket } from '../entities/ticket.entity';

export class CreateTicketDto extends OmitType(Ticket, ['id', 'createdAt', 'updatedAt'] as const) {}
```

```typescript title="src/tickets/dto/update-ticket.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
```

---

### A Tickets Controller Swagger dekorátorokkal

Dokumentáljuk explicit módon a lehetséges HTTP válaszokat (sikeres és hibás eseteket is). Ezt a Swagger UI szépen fogja megjeleníteni.

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

### A dokumentáció megtekintése

Indítsd el az alkalmazást (vagy ha futott, várd meg amíg az SWC újrafordítja):

```bash
npm run start:dev
```

A [http://localhost:3000/api](http://localhost:3000/api) címre navigálva mostmár a `/tickets` végpontok dokumentációját is láthatod, ugyanúgy mint a `/boards`-ét, a mezők típusával, az Enum legördülő menüvel és a validációs szabályokkal együtt.

:::info
Ha elakadtál, akkor a chapter-6 branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**