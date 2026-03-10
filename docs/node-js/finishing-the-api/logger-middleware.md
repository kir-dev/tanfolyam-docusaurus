---
sidebar_position: 4
sidebar_label: 'Chapter 8: Logger Middleware'
title: 'Chapter 8: Logger Middleware'
---

Ez a fejezet egy opcionális, de annál hasznosabb kiegészítése az alkalmazásunknak. Létrehozunk egy saját **Logger Middleware**-t, amely minden beérkező HTTP kérésnél kiírja a konzolra, hogy pontosan mennyi ideig tartott annak feldolgozása. Ez a valós (production) környezetben életmentő lehet a lassú végpontok és adatbázis-lekérdezések felderítésében.

### Mik azok a Middleware-ek?

A **Middleware** (Köztesréteg) egy olyan függvény, amely a kliens kérése (Request) és a mi végpontunk (Controller) lefutása _között_ helyezkedik el. Képes:

- Belenézni a kérésbe vagy módosítani azt (pl. autentikációs tokenek ellenőrzése).
- Megszakítani a kérést, ha valami hibát észlel.
- Továbbengedni a kérést a következő rétegnek (a `next()` függvény meghívásával).
- Valamilyen kódot futtatni a válasz (Response) kiküldése után.

Bár a NestJS elrejti előlünk, a háttérben az Express.js (vagy Fastify) motor hajtja, így a middleware-ek pontosan ugyanúgy működnek, mint egy hagyományos Express alkalmazásban.

#### Middleware a kérés életciklusában

Egy NestJS kérés a következő rétegeken halad keresztül sorban:

```
HTTP Kérés
    ↓
Middleware     ← itt vagyunk most (pl. LoggerMiddleware)
    ↓
Guard          (autentikáció, jogosultság — ezt most nem implementáljuk)
    ↓
Pipe           (adat-átalakítás és validáció — pl. ValidationPipe, ParseIntPipe)
    ↓
Controller     (a route handler metódus, pl. findOne())
    ↓
HTTP Válasz
```

**Middleware vs. Pipe — mi a különbség?**

| | Middleware | Pipe |
|---|---|---|
| **Mikor fut?** | Minden kérésre, feltétel nélkül | Csak az adott végpont paramétereire |
| **Mire való?** | Naplózás, autentikáció, fejléc-módosítás | Validáció, típuskonverzió |
| **Hozzáfér a válaszhoz?** | Igen (pl. `res.on('finish')`) | Nem |
| **Példa** | `LoggerMiddleware` | `ValidationPipe`, `ParseIntPipe` |

A Logger Middleware azért kerül a middleware rétegbe (és nem pipe-ba), mert minden kérést — a végponttól függetlenül — naplózni szeretnénk, és a válasz befejezésekor is le kell futnia.

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

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**, **[Bujdosó Gergő](https://github.com/FearsomeRover)**
