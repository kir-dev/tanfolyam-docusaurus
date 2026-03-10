---
sidebar_position: 1
sidebar_label: 'Bevezetés a webes keretrendszerekbe'
title: 'Bevezetés a webes keretrendszerekbe'
---

# Bevezetés a webes keretrendszerekbe

## Az előadás célja

Az első előadás célja, hogy:

- Megértsük, mi az a **backend**, és hogyan kapcsolódik a **frontendhez**
- Átlássuk a **HTTP kommunikáció** alapjait
- Megismerjük a **REST API** fogalmát
- Megkülönböztessük a statikus, multi-page és SPA webalkalmazásokat
- Megértsük a **JSON** szerepét
- Bevezetést kapjunk a **Node.js**, **TypeScript**, **npm**, **Express** és **NestJS** világába

Ez az óra még inkább elméleti alapozás, hogy megismerjük a fogalmakat és a technológiákat, amikkel a tanfolyam során dolgozni fogunk.

---

## Mi az a backend?

Egy modern webalkalmazás általában két fő részből áll:

### Frontend

- A felhasználó böngészőjében fut
- A mi esetünkben egy **React SPA**
- Felhasználói felületet (UI) jelenít meg és kezeli a felhasználói interakciókat
- HTTP kéréseket küld a backendnek
- Felhasználói élményt biztosít (reszponzivitás, interakciók)
- Felhasználja a backend által szolgáltatott adatokat a megjelenítéshez
- Nem foglalkozik az adatok tárolásával vagy üzleti logikával
- HTML, CSS és JavaScript

### Backend

- Szerveren fut
- Feldolgozza a kéréseket
- Választ küld vissza (általában JSON formátumban)
- Üzleti logikát valósít meg
- Adatbázissal kommunikál
- Adatok mentése, olvasása, manipulálása
- Felhasználói hitelesítés és jogosultságkezelés
- PHP, Java, Python, Go, Node.js (és kb. bármilyen létező programozási nyelv)

---

## Hogyan kommunikál a frontend és a backend?

A kommunikáció HTTP kéréseken keresztül történik.

Példa:

1. A React frontend elküld egy kérést:

   ```
   GET /tickets
   ```

2. A backend válaszol:
   ```json
   [
     { "id": 1, "title": "Hibás bejelentkezés" },
     { "id": 2, "title": "Nem működik a fizetés" }
   ]
   ```

Ez a kommunikáció **stateless**, azaz minden kérés önálló, és a backend nem tárol információt a kliensről a kérésen kívül.

---

## HTTP alapok

A HTTP egy kérés-válasz alapú protokoll.

### Leggyakoribb HTTP metódusok

| Metódus | Jelentés               |
| ------- | ---------------------- |
| GET     | Adat lekérése          |
| POST    | Új adat létrehozása    |
| PUT     | Teljes adat frissítése |
| PATCH   | Részleges frissítés    |
| DELETE  | Törlés                 |

### HTTP státuszkódok

- 100-199: információs válaszok
- 200-299: sikeres válaszok
- 300-399: átirányítások
- 400-499: kliens hibák
- 500-599: szerver hibák

#### Leggyakoribb státuszkódok

| Kód | Jelentés              |
| --- | --------------------- |
| 200 | OK                    |
| 201 | Created               |
| 400 | Bad Request           |
| 401 | Unauthorized          |
| 403 | Forbidden             |
| 404 | Not Found             |
| 500 | Internal Server Error |

Lásd még:

- [**HTTP protokoll részletesen (angol)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [**HTTP status codes (angol)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

### HTTP kérés részei

- URL
- Metódus
- Header
- Body (nem mindig van)

---

## Weboldal típusok

### Statikus weboldal

- Előre elkészített HTML, CSS és JavaScript fájlok
- Nincs szerveroldali logika és perzisztens adat
- Gyors és egyszerű, de ritkán használják modern alkalmazásokhoz
- Példa: egy egyszerű portfólió oldal, vagy dokumentációs oldal, mint ez a tanfolyam weboldala, vagy applikációk forráskódjából és kommentjeiből generált dokumentációk

### Multi-page application (MPA)

- A szerver az adatbázisból kiolvassa a szükséges adatokat, és ez alapján generál egy új HTML oldalt minden kérésre
- Minden navigáció új oldalbetöltés
- Klasszikus szerveroldali renderelés, például PHP, Java Spring MVC, vagy Django használatával
- Itt a backend felelős a megjelenítésért és az üzleti logikáért is
- Példa: egy hagyományos blog, ahol minden bejegyzés egy külön HTML oldal

### Single Page Application (SPA)

- A szerver nem foglalkozik a megjelenítéssel, csak nyers adatot küld a kliensnek
- A frontend felelős a megjelenítésért és az adatok alapján jeleníti meg a tartalmat
- Backend API-n keresztül kommunikál
- JavaScript (pl. React) kezeli a routingot
- Példa: Nagyon sok modern webalkalmazás, mint a Google Maps vagy a Netflix

A mi frontendünk egy **React SPA** lesz.

---

## REST API

A Representational State Transfer (REST) egy tervezési stílus web API-khoz.
A REST API-k a HTTP protokollt használják, és erőforrás-alapúak.
Egy architektúra, amely meghatározza, hogyan kell a szervernek és a kliensnek kommunikálnia egymással.

### REST alapelvek

- Erőforrás-alapú (resource-based)
- HTTP metódusokat használ
- Stateless
- JSON válasz (általában)

### Példa REST végpontokra

```
GET    /tickets     -> összes hibajegy lekérése
GET    /tickets/1   -> az 1-es azonosítójú hibajegy lekérése
POST   /tickets     -> új hibajegy létrehozása
PUT    /tickets/1   -> az 1-es azonosítójú hibajegy teljes frissítése
PATCH  /tickets/1   -> az 1-es azonosítójú hibajegy részleges frissítése
DELETE /tickets/1   -> az 1-es azonosítójú hibajegy törlése
```

---

## JSON

A JSON (JavaScript Object Notation) adatcsere-formátum.

Példa:

```json
{
  "id": 1,
  "title": "Hiba",
  "resolved": false
}
```

Miért fontos?

- Ember által olvasható
- Könnyen feldolgozható
- HTTP API-k alap formátuma

Alap adatstruktúrák:

- Objektumok (kulcs-érték párok)
- Tömbök: értékek sorrendhelyes felsorolása vesszővel elválasztva
- Sztringek: UTF-8 karakterláncok
- Számok: egész vagy lebegőpontos számok
- Boolean értékek: true vagy false
- Null: üres érték

![JSON példa](/img/node/json-example.png)

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**