---
sidebar_position: 2
sidebar_label: 'Node.js és aszinkronitás'
title: 'Node.js és aszinkronitás'
---

## Node.js

A Node.js lehetővé teszi, hogy JavaScriptet futtassunk szerveren.

- **Aszinkron és eseményvezérelt**: képes egyszerre több kapcsolatot fogadni, és az _event loop_ segítségével képes aszinkron műveleteket végrehajtani.
- **Egyszálú**: egyetlen szálon fut, de képes több műveletet párhuzamosan kezelni az aszinkronitás segítségével.

### Hogyan működik?

- A Chrome V8 JavaScript engine-re épül
- Event-driven
- Non-blocking I/O
- Egy szálon fut, de aszinkron módon kezeli a műveleteket

---

### Event loop

A Node.js nem blokkoló módon működik.

Példa:

```ts
setTimeout(() => {
  console.log('Késleltetett');
}, 1000);

console.log('Azonnali');
```

Kimenet:

```
Azonnali
Késleltetett
```

A `setTimeout` egy aszinkron művelet, amely a callback függvényt (callback = egy olyan függvény, amit egy másik függvénynek adunk át paraméterként, és az hívja meg később) egy későbbi időpontban hajtja végre, miközben a fő szál tovább fut, azaz nem blokkolja a `console.log('Azonnali')` végrehajtását.

---

## Aszinkronitás

### Promise

A **Promise** (ígéret) egy objektum, amely egy aszinkron művelet jövőbeli eredményét reprezentálja. Három állapota lehet:
- **Pending** (függőben): A művelet még folyamatban van.
- **Fulfilled** (teljesült): A művelet sikeresen befejeződött, és van eredménye.
- **Rejected** (elutasított): A művelet hibával zárult.

A `.then()` metódussal kezeljük a sikeres eredményt, a `.catch()` metódussal pedig az esetleges hibákat.

```ts
fetch('https://api.com/data')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

A `fetch` egy aszinkron művelet, amely egy Promise-t ad vissza. A `then` metódusok segítségével kezeljük a sikeres és hibás eseteket, a `catch` metódus pedig a dobott hibák kezelésére szolgál.

### async/await

```ts
async function load() {
  const response = await fetch('https://api.com/data');
  const data = await response.json();
  console.log(data);
}
```

Az `async/await` olvashatóbb és könnyebben követhető, mint a Promise láncolás, különösen összetettebb aszinkron műveletek esetén. Az `await` kulcsszó megállítja a függvény végrehajtását, amíg a Promise teljesül, majd visszaadja a Promise értékét. De nem blokkolja a teljes alkalmazást, csak az adott async függvény végrehajtását.

---

## npm és a csomagkezelők

Az npm a Node.js csomagkezelője.

### Mire jó?

- Külső könyvtárak telepítése
- Projekt függőségek kezelése
- Script futtatás

Példa:

```bash
npm init -y
npm install express
```

Telepíti az Express könyvtárat, és létrehozza a `package.json` fájlt a projekt gyökerében, amely tartalmazza a projekt nevét, verzióját és a telepített függőségeket és azok verzióit.

Alternatívák:

- yarn
- pnpm

---

Készítette: **[Tarjányi Csanád](https://github.com/EasySouls)**