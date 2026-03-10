---
sidebar_position: 1
sidebar_label: 'Chapter 5: API dokumentáció Swaggerrel'
title: 'Chapter 5: API dokumentáció Swaggerrel'
---

Egy backend alkalmazás fejlesztése során elengedhetetlen, hogy a frontend fejlesztők (vagy a tesztelők) pontosan lássák, milyen végpontok (endpointok) állnak rendelkezésre, és azok milyen adatokat várnak vagy adnak vissza. Erre a legjobb eszköz a **Swagger (OpenAPI)**, ami egy interaktív, vizuális dokumentációt generál a kódunkból.

### Függőségek telepítése

A NestJS rendelkezik egy dedikált csomaggal a Swagger integrációhoz. Töltsük le a szükséges függőséget:

```bash
npm install @nestjs/swagger
```

### DTO-k módosítása a Swaggerhez

A 4. fejezetben a `@nestjs/mapped-types` csomagot használtuk az `OmitType` és `PartialType` funkciókhoz. Mivel most már Swaggert használunk, **le kell cserélnünk ezeket az importokat**, hogy a Swagger is "lássa" és megértse a DTO-ink felépítését.

Módosítsd a `create-board.dto.ts` fájlt:

```typescript title="src/boards/dto/create-board.dto.ts"
import { OmitType } from '@nestjs/swagger';
import { Board } from '../entities/board.entity';

// Figyeld meg az "as const" kulcsszót a tömb végén!
export class CreateBoardDto extends OmitType(Board, ['id', 'createdAt'] as const) {}
```

És módosítsd az `update-board.dto.ts` fájlt is:

```typescript title="src/boards/dto/update-board.dto.ts"
import { PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
```

:::tip Miért kellett a Swaggeres import és az `as const`?
Ha a sima `mapped-types`-t használnánk, a generált Swagger dokumentációban a létrehozás és frissítés végpontoknál üres objektumok (vagy hibás mezők) jelennének meg. A `@nestjs/swagger` csomagból importált `OmitType` és `PartialType` biztosítja, hogy a dokumentációba is átkerüljenek a megfelelő típusok. Az `as const` pedig a TypeScriptnek segít abban, hogy a tömb elemeit ne sima stringekként, hanem konkrét, megváltoztathatatlan értékekként (literal types) kezelje, ami elengedhetetlen a Swagger pontos típus-következtetéséhez.
:::

### A Nest CLI konfigurálása (nest-cli.json)

Hogy a Swagger automatikusan felismerje a Controller-ekben és DTO-kban lévő típusokat (anélkül, hogy tele kellene szemetelnünk a kódunkat `@ApiProperty()` dekorátorokkal), be kell kapcsolnunk a Swagger CLI plugint. Egyúttal felgyorsítjuk a projekt fordítását is.

Nyisd meg a projekt gyökerében lévő `nest-cli.json` fájlt, és cseréld ki a tartalmát erre:

```json title="nest-cli.json"
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "builder": "swc",
    "typeCheck": true,
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true,
          "skipAutoHttpCode": false,
          "esmCompatible": true
        }
      }
    ]
  }
}
```

#### Az új tulajdonságok magyarázata:

- **`builder: "swc"`**: A NestJS alapértelmezetten a szabványos TypeScript fordítót (`tsc`) használja, ami nagy projekteknél lassú lehet. Az SWC (Speedy Web Compiler) egy Rust-ban írt, villámgyors fordító, ami drasztikusan lecsökkenti az alkalmazás indulási és újrafordulási idejét.
- **`typeCheck: true`**: Mivel az SWC annyira gyors, hogy a típusokat nem ellenőrzi (csak eltávolítja őket és lefordítja a kódot JavaScriptre), ezzel a kapcsolóval bekapcsolunk egy külön folyamatot, ami a háttérben továbbra is elvégzi a TypeScript típusellenőrzést.
- **`plugins` tömb**: Itt mondjuk meg a NestJS-nek, hogy fordítás közben futtassa le a Swagger bővítményt.
  - `classValidatorShim`: Engedélyezi, hogy a plugin kiolvassa a `class-validator` dekorátorokat (pl. `@IsString()`), és ezek alapján állítsa be a Swaggerben, hogy egy mező kötelező-e vagy milyen típusú.
  - `introspectComments`: Ha JSDoc kommenteket írsz a kódodba (pl. `/** Ez egy azonosító */`), a Swagger ezt automatikusan kiolvassa, és megjeleníti a dokumentációban mint mező leírás.
  - `skipAutoHttpCode`: Ha `false`, a plugin automatikusan hozzáadja a megfelelő HTTP státuszkódokat (pl. 201 a POST-hoz, 200 a GET-hez) a dokumentációhoz.
  - `esmCompatible`: ESM (ES Module) kompatibilitást biztosít a generált metaadatokhoz.

### A Swagger bekötése

Végül inicializálnunk kell a Swaggert az alkalmazásunk belépési pontján. Cseréld le a `src/main.ts` tartalmát a következőre:

```typescript title="src/main.ts"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// A Nest CLI plugin (SWC használata esetén) automatikusan generálja ezt a fájlt fordításkor
// ⚠️ Ez a fájl nem létezik a forráskódban — az első 'npm run start:dev' futtatáskor generálódik!
import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // 1. Swagger konfiguráció építése
  const config = new DocumentBuilder()
    .setTitle('Ticketing API 2026')
    .setDescription('A hibajegy-kezelő rendszer API dokumentációja')
    .setVersion('1.0')
    .build();

  // 2. Plugin metaadatok betöltése
  // Ez ahhoz kell, hogy az SWC fordítóval együtt is működjön az automatikus típusfelismerés
  await SwaggerModule.loadPluginMetadata(metadata);

  // 3. A dokumentum legenerálása és csatolása az alkalmazáshoz
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // A 'api' az URL útvonal, ahol elérhető lesz a Swagger UI
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  console.log(`Nestjs is running on port ${port}`);
  await app.listen(port);
}

void bootstrap();
```

:::warning A `./metadata` import piros hibát jelez?
A `./metadata` fájl nem létezik a forráskódban — a NestJS CLI a Swagger plugin segítségével automatikusan generálja az első fordításkor. Ha az IDE piros hibát jelez ennél a sornál, futtasd egyszer a `npm run start:dev` parancsot, és a hiba eltűnik.
:::

#### A Swagger inicializálásának magyarázata:

1.  **`DocumentBuilder`**: Ez egy Builder minta, amivel összeállíthatjuk a dokumentációnk alapvető adatait (Cím, Leírás, Verzió). Itt adhatnánk meg akár a JWT autentikáció beállításait is később.
2.  **`loadPluginMetadata(metadata)`**: Amikor SWC fordítót használunk, a hagyományos TypeScript metaadatok (reflection) másképp működnek. A `nest-cli.json`-ben beállított plugin generál egy rejtett metaadat-fájlt az alkalmazás indulásakor. Ezzel a sorral töltjük be ezeket az adatokat, így a Swagger tudni fogja, hogy a `BoardsController`-ben lévő `@Post()` végpont pontosan milyen `CreateBoardDto`-t vár.
3.  **`SwaggerModule.setup('api', ...)`**: Ez a parancs csatolja fel a vizuális felületet az alkalmazásunkra. Az első paraméter (`'api'`) az URL útvonal.

### A Dokumentáció megtekintése

Indítsd el az alkalmazást (vagy ha futott, várd meg amíg az SWC újrafordítja):

```bash
npm run start:dev
```

Nyisd meg a böngésződben a [http://localhost:3000/api](http://localhost:3000/api) címet! Ha mindent jól csináltál, akkor a `/tickets` és a `/boards` végpontok dokumentációját fogod látni, a mezők típusával és a validációs szabályokkal együtt. Ráadásul az egyes végpontokra kattintva interaktívan ki is próbálhatod őket közvetlenül a böngészőből!

:::tip Házi feladat
A következő fejezetben a Tickets controller-t fogjuk Swagger dekorátorokkal (`@ApiOkResponse`, `@ApiCreatedResponse`, `@ApiNotFoundResponse`, stb.) ellátni. Próbáld meg önállóan is kiegészíteni a Boards controller metódusait hasonló dekorátorokkal!
:::

:::info
Ha elakadtál, akkor a [chapter-5](https://github.com/kir-dev/ticketing-api-2026/tree/chapter-5) branch-en megtalálod az eddigi kódot, amit összehasonlíthatsz a sajátoddal, vagy checkoutolhatod, hogy onnan folytasd.
:::

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**
