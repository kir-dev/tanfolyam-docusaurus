# React tanfolyam — 2. alkalom, Live Coding 1

## Az alkalom célja röviden
Ezen a live coding alkalmon egy **nagyon egyszerű Next.js (React) UI-t** építünk, ami már ténylegesen kommunikál egy backend API-val.
A cél nem az, hogy tökéletesen kész terméket írjunk, hanem hogy gyakorlatban összekössük az elméleti fogalmakat:

- **Komponens alapú gondolkodás:** a UI-t kisebb, újrahasznosítható egységekre bontjuk.
- **Állapot (state):** a UI egy pillanatnyi állapot leképezése (UI = f(state)).
- **Hook-ok:** `useState`, `useEffect` használata valós példán.
- **HTTP kommunikáció:** adatlekérés és -küldés a backend felé (`axios`).
- **Refaktorálás:** amikor a kód nő, elkezdjük szétbontani és újraszervezni.

A jegyzetben szereplő kódrészletek „építőkockák”: mindig azt a minimális kódrészt mutatják, ami az adott fogalomhoz kell, és mellé tesszük a technikai magyarázatot.

## Ismétlés az előző alkalomról
A korábbi előadáson áttekintettük a modern webfejlesztés alapjait, különös tekintettel a **React** komponens-alapú architektúrájára és a **Next.js** keretrendszer nyújtotta előnyökre (mint a *Server Components* és az egyszerűsített útvonalválasztás). Megismertük a deklaratív UI építés lényegét, a komponensek közötti kommunikációt (props) és az alapvető állapotkezelést (*useState*).

## Kiinduló projekt
A [ticketing-frontend-2026](https://github.com/kir-dev/ticketing-frontend-2026) repo-ban fogunk dolgozni, ahol a Node.js és Spring Boot
tanfolyamokon implementált ticketing-api-hoz fogunk egy frontendet készíteni Next.js frameworkkel.

### A projekt klónozása
A tanfolyamhoz használt alap projektet az alábbi paranccsal tudod letölteni a kívánt helyre:

```bash
git clone https://github.com/kir-dev/ticketing-frontend-2026.git
cd ticketing-frontend-2026
npm install
npm run dev
```

#### Mit jelent ez a gyakorlatban?
- A `git clone` letölti a projekt aktuális állapotát.
- Az `npm install` feltelepíti a projekthez szükséges függőségeket (`node_modules`).
- Az `npm run dev` elindítja a fejlesztői szervert (hot-reload-dal), így amit mentünk, az rögtön frissül a böngészőben.

---

### Kiinduló állapot
Ez a kiindulási alap. Egy friss Next.js projekt, a szükséges könyvtárszerkezettel (`src/app/`, `public/`).

A projekt alapértelmezés szerint a `master` ágon áll, ami egy minimális Next.js kezdőoldalt tartalmaz a Kir-Dev logójával és üdvözletével. Erre fogunk építkezni a továbbiakban.

> Fontos: Next.js-ben (App Router esetén) a `src/app/page.tsx` a kezdőoldal. A `layout.tsx` a közös “keret” (globális layout), a `globals.css` pedig a globális stílus.

---

### Projekt indítása
Miután bemásolták a kódokat a megfelelő fájlokba, a fejlesztői környezet elindításához az alábbi parancsokat kell futtatniuk a projekt gyökérkönyvtárában:

1.  **Függőségek telepítése:**
    ```bash
    npm install
    ```

2.  **Fejlesztői szerver indítása:**
    ```bash
    npm run dev
    ```

## Komponensek, state-k és hook-ok alapvető bemutatása

Vigyünk egy kis extra funkcionalitást a projektünkbe, hogy a gyakorlatban is megismerkedjünk a már tárgyalt React komponensekkel, a state-kezeléssel és a hook-ok használatával.

### 1) Állapot felvétele `useState`-tel
Vegyünk fel egy állapotot a `page.tsx` fájlban, amely egy számlálót fog kezelni. Ez egy egyszerű példa arra, hogyan használhatjuk a `useState` hook-ot a React-ben.

```tsx
// Fájl: src/app/page.tsx
const [counter, setCounter] = useState(0)
```

**Mi történik itt?**
- `counter`: az aktuális érték (kezdetben `0`).
- `setCounter`: a hivatalos “módosító” függvény. Reactben **nem** írjuk felül direktben a state-et (`counter = counter + 1`), hanem mindig a setterrel frissítünk.

**Miért jó ez?**
Amikor a state változik, a React újra rendereli a komponenst, így a UI automatikusan frissül.

### 2) Eseménykezelés `onClick`-kel
Iratkoztassunk fel egy `onClick` eseményt a gombra, amely meghívja a `setCounter` függvényt a jelenlegi érték növelésével. A `counter` számláló értékét jelenítsük meg a gomb szövegeként, így láthatjuk a változást minden kattintás után.

```tsx
// Fájl: src/app/page.tsx
return (
    <div className="min-h-screen bg-white flex flex-col flex-1 items-center justify-center">
        <button
            className="flex flex-row font-sans text-3xl text-black bg-slate-400 rounded-full p-20 justify-center items-center hover:scale-105"
            onClick={() => setCounter(counter + 1)}
        >
            <Image src={"/Kir-Dev.png"} width={200} height={200} alt="Kir-Dev" className="mr-4"/>
            {counter}++++
        </button>
    </div>
);
```

**Mi a lényeg?**
- A `onClick` egy függvényt kap (callback). Ez akkor fut le, amikor a user kattint.
- A `{counter}` TSX-ben azt jelenti: “ide rendereld ki a JS/TS változó értékét”.

**Gyakori buktató:**
Ha a frissítés a korábbi értékből számolódik, biztonságosabb lehet a callback-es forma:
`setCounter((prev) => prev + 1)`. Ez különösen akkor fontos, ha több frissítés történik gyorsan egymás után.

### 3) Miért kell a `use client`?

```tsx
'use client'
```

A basic React-tel ellentétben, a Next.js App Router alapértelmezés szerint **Server Componenteket** használ. Ez azt jelenti, hogy a komponens
kódja elsősorban a szerveren fut, és a böngésző csak a “kész” HTML-t kapja. React-nél ez alapértelmezetten a kliensen történne (CSR, SPA).

Az olyan React funkciók, mint a `useState`, `useEffect` és a DOM események (`onClick`) **kliensoldali interaktivitást** igényelnek, ezért az
ilyen fájlokra ki kell mondanunk:

- **`'use client'`** → ez egy Client Component, mehet benne state, event handler, effect.

> TIPP: A `page.tsx` tetejére érdemes tenni, még az importok elé.

---

## Adatok küldése a backendnek az API és hook-ok használatával

Ebben a lépésben a “játék-számláló” után áttérünk a valódi célra: **adatot menteni a backendbe**. A korábbi kódrészleteket törölhetjük, kivéve a `'use client'`-et.

Az elkészítendő funkció egy egyszerű input mező és egy gomb lesz, amely lehetővé teszi a felhasználó számára, hogy új "board"-ot adjon hozzá a backendhez. Az input értékét egy `useState` hook-kal fogjuk kezelni.

```tsx
const [inputValue, setInputValue] = useState<string>("")
```

**Mit jelent ez?**
- `inputValue` mindig a mező aktuális tartalma.
- `setInputValue`-val frissítjük, amikor a user gépel.
- A `string` típus megadása segít az IDE-nek és a hibák korai elkapásában.

A backend elérési út:

```tsx
const backendURL = "/api/ticketing/boards"
```

**Miért jó konstansba tenni?**
- Nem kell több helyen hard-code-olni.
- Később könnyebb átírni (pl. ha változik a végpont).

**Hogyan kéne ezt valóban helyesen és biztonságosan kezelni?**
- Környezeti változóban tárolni a *valódi backend hostot* (`process.env.NEXT_PUBLIC_BACKEND_URL` vagy server oldalon `process.env.BACKEND_URL`).
- Így könnyen átállítható fejlesztői, staging és éles környezet között.
- Megjegyzés: a `NEXT_PUBLIC_` prefixű env változók **kikerülnek a böngészőbe is**, ezért oda csak nem-érzékeny értéket tegyünk (API kulcsot soha).

Az HTTP kliens:

```tsx
import axios from "axios";
```

**Mi az axios és miért használjuk?**
- Egy Promise-alapú HTTP kliens.
- Kényelmesebb, mint a `fetch`: automatikus JSON parsing (`res.data`), egyszerűbb hibakezelési modell.

Új board létrehozása:

```tsx
const onAdd = () => {
    axios.post(backendURL, {
        title: inputValue
    }).then((res) => {
        setInputValue("")
        console.log(res.data)
    }).catch((err) => {
        console.error("Error adding board:", err)
    })
}
```

**Mi történik lépésről lépésre?**
1. `POST` kérést küldünk a backendnek a board címével.
2. Siker esetén:
   - kiürítjük az inputot (`setInputValue("")`), hogy a user lássa: elküldtük.
   - kiírjuk a választ a konzolra (ez lehet egy új board objektum).
3. Hiba esetén kiírjuk a hibát a konzolra.

UI rész:

```tsx
return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center">
      <div className="mt-10">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border-black border-2"
        />
        <button onClick={onAdd}>
          Add
        </button>
      </div>
    </div>
  );
```

Az input értéke (`value`) mindig a React state-ből jön, és minden gépelés (`onChange`) frissíti a state-et. Így a React a “single source of truth”.
A button pedig meghívja az `onAdd` függvényt, amikor a user rákattint.

---

## Adatlekérés és megjelenítés

A következő lépés, hogy ne csak küldeni tudjunk adatot, hanem meg is jelenítsük a backendből érkező listát.

Board lista state:

```tsx
const [boards, setBoards] = useState<Board[]>([])
```

**Miért tömb, és miért üres induláskor?**
Az API-tól egy listát várunk. Induláskor még nincs meg (nem futott le a kérés), ezért legyen biztonságos alapérték: `[]`.

A megadott Board típust definiálnunk is kell, hogy a TypeScript tudja, milyen mezőket várunk a backend válaszában:

```tsx
type Board = {
    id: number;
    title: string;
    createdAt: string;
}
```

**Miért jó ez?**
- Dokumentálja, milyen mezőket várunk.
- Az IDE segít: pl. elütést (`createdAT`) rögtön jelzi.

Lekérő függvény:

```tsx
const getBoards = () => {
    axios
        .get<Board[]>(backendURL)
        .then((res) => setBoards(res.data))
        .catch((err) => console.error("Error fetching boards:", err))
}
```

**Itt is érdemes figyelni a típusozásra:**
- Semmi sem garantálja, hogy a backend valóban egy `Board[]` struktúrájú dolgot fog visszaadni.
- Fontos a `try/catch` vagy `.catch`.
- A `.get<Board[]>()` **csak TypeScript típus-információ** (fordítási idejű segítség), nem futásidejű validáció. Ha ezt runtime ellenőrizni akarnánk, akkor séma validációt használnánk (pl. `zod`).

A getBoards függvényünket érdemes meghívni az onAdd sikeres lefutása után, hogy a lista frissüljön az új boarddal:

```tsx
const onAdd = () => {
    axios.post(backendURL, {
        title: inputValue
    }).then((res) => {
        setInputValue("")
        getBoards()
        console.log(res.data)
    }).catch((err) => {
        console.error("Error adding board:", err)
    })
}
```

Megjelenítés `map`-pel:

```tsx
return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center">
      <div className="mt-10">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border-black border-2"
        />
        <button onClick={onAdd}>
          Add
        </button>
        <div className="overflow-auto">
          {boards.map((board) => (
            <div className="rounded-lg p-4 bg-slate-500 mt-5" key={board.id}>{board.title}</div>
          ))}
        </div>
      </div>
    </div>
  );
```

**Miért kell a `key`?**
A React a listák frissítésénél a `key` alapján tudja, melyik elemet kell módosítani/átrendezni/újrahasznosítani. Ha nincs key (vagy rossz), furcsa UI bugok tudnak megjelenni.

Első betöltéskor automatikus lekérés `useEffect`-tel:

```tsx
useEffect(() => {
    getBoards()
}, [])
```

**Miért így?**
- A `useEffect` a render után fut.
- A `[]` dependency array azt jelenti: csak egyszer, "mount"-kor fusson le.

> TIPP: React 18 Strict Mode-ban fejlesztés közben előfordulhat, hogy az effect kétszer fut le. Ez fejlesztői ellenőrzés, élesben nem így lesz.
> Emiatt dev módban a `getBoards()` kétszer is lefuthat – ezért élesben fontos, hogy a backend műveletek idempotensek legyenek, vagy legyen "dupla-hívás" védelem (pl. abort controller / cache / deduplikáció).

---

## Refaktorálás: komponens alapú architektúrára váltás
Komponens alapú architektúrára váltunk. Létrehozzuk a `BoardItem` és `BoardInput` komponenseket, valamint a `Board` típust is kiszervezzük.

**Miért refaktorálunk?**
Amíg csak 20 sor a `page.tsx`, addig oké “egybefüggő” kódot írni. De ha megjelenítés, input, listázás, szerkesztés, törlés mind bekerül, akkor gyorsan:
- átláthatatlan lesz,
- nehezebb tesztelni,
- nehezebb újrahasznosítani.

A komponensek szétválasztják a felelősségeket: a `page.tsx` inkább “összerakó” szerepet kap, a kisebb UI darabok pedig külön fájlba kerülnek.

**Új fájlok:**
*   `src/types/board.ts`
*   `src/components/BoardItem.tsx`
*  `src/components/BoardInput.tsx`

### Board típus:

```tsx
// Fájl: src/types/board.ts
export type Board = {
  id: number;
  title: string;
  createdAt: string;
}
```

### BoardItem.tsx komponens:

```tsx
// Fájl: src/components/BoardItem.tsx
import { Board } from "@/types/board";

interface BoardItemProps {
  board: Board
}

export default function BoardItem(props: BoardItemProps) {
    return(
      <div className="rounded-lg p-4 bg-slate-500 mt-5">{props.board.title}</div>
    )
}
```

**Miért kell interface a props-hoz?**
A props a komponens “szerződése”: pontosan leírja, mit vár. Így a hívó oldal (szülő komponens) sem tud véletlen rossz adatot adni.

> Megjegyzés: a `@/` import útvonal egy TypeScript path alias, ami jellemzően a `src/` mappára mutat. Ha egy projektben nincs beállítva, akkor relatív importokat kell használni (`../../types/board`).

### BoardInput.tsx komponens:

```tsx
import {useState} from "react";
import axios from "axios";

interface BoardInputProps {
    getBoards: () => void;
}

const backendURL = "/api/ticketing/boards"

export default function BoardInput(props: BoardInputProps) {
    const { getBoards } = props
    const [inputValue, setInputValue] = useState<string>("")

    const onAdd = () => {
        axios.post(backendURL, {
            title: inputValue
        }).then((res) => {
            setInputValue("")
            getBoards()
            console.log(res.data)
        }).catch((err) => {
            console.error("Error adding board:", err)
        })
    }

    return(
        <div>
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="border-black border-2"
            />
            <button onClick={onAdd}>
                Add
            </button>
        </div>
    )
}
```

Mint láthatjuk logikában itt sem történt változás, csak a kód szét lett bontva kisebb, jól körülhatárolt felelősségű komponensekre.
Ez a gyakorlatban sokkal fenntarthatóbb és olvashatóbb kódot eredményez.
Az onAdd függvény és az inputValue state ugyanazok maradtak, csak most már a `BoardInput` komponensben vannak, és a `getBoards`-ot props-ként kapják meg a szülőtől.

A props használatának egy másik módja a destrukturálás, ami egy kicsit tisztábbá teszi a kódot:

```tsx
const { getBoards } = props
```

### Fontos: Client Component határ refaktor után
A `BoardInput` és a `BoardItem` is használ `useState`-et / eseménykezelőt / axios-t, tehát **kliens oldali** komponensek.
- Ha a szülő (`page.tsx`) **Client Component** (`'use client'`), akkor ezek a komponensek **gond nélkül használhatók** alatta.
- Ha viszont egy komponensfát Server Componentként hagyunk, akkor a hook-os gyerekekhez explicit `use client` boundary kell.

Ez azért fontos, mert Next.js-ben a “server vs client” nem csak egy fájl döntése: a komponensfa határozza meg, hol lehet interaktivitás.

---

## Board címének szerkesztése
A következő funkció: egy board title módosítása.

Nagyon kényelmes, hogy a korábbi refaktorálás után a `BoardItem` egy önálló komponens lett, így ebben a fájlban most már csak a szerkesztés
logikájára kell koncentrálnunk, az alkalmazásunk többi részéről megfeledkezhetünk.

Állapotok a szerkesztéshez:

```tsx
const [isEditing, setIsEditing] = useState<boolean>(false)
const [editInput, setEditInput] = useState<string>(props.board.title)
```

**Mit jelentenek?**
- `isEditing`: megmondja, hogy az adott sor “szerkesztés módban” van-e.
- `editInput`: az input mező aktuális értéke.

PATCH kérés:

```tsx
const editBoard = () => {
    axios.patch(`/api/ticketing/boards/${props.board.id}`, {
        title: editInput
    }).then((res) => {
        console.log("Edited board with id " + props.board.id + ": " + props.board)
        props.getBoards()
    })
}
```

**Miért PATCH?**
Mert részlegesen módosítunk egy entity-t (csak a `title` mezőt). REST konvencióban erre gyakran PATCH-et használunk.

**PATCH felépítése:**
- URL-ben megadjuk, melyik boardot akarjuk módosítani (`${props.board.id}`).
- A body-ban megadjuk, hogy mit akarunk módosítani (`{ title: editInput }`).

Props bővítése (szülőből kapott frissítő függvény):

```tsx
interface BoardItemProps {
    board: Board,
    getBoards: () => void
}
```

**Miért adjuk le a `getBoards`-ot?**
Mert szerkesztés után a listát újra kell tölteni. Ezzel a `BoardItem` közvetlenül tud szólni a szülőnek, hogy "frissítsd az adatokat".

Szerkesztés gomb logikája:

```tsx
const handleEdit = () => {
    if (isEditing){
        editBoard()
    }
    setIsEditing(!isEditing)
}
```

**Miért így?**
- Ha eddig szerkesztettünk, akkor a gomb most “Save” szerepben van → mentünk.
- Utána átváltjuk a módot.

UI: input vs szöveg (feltételes renderelés):

```tsx
return(
    <div className="flex rounded-lg p-4 bg-slate-500 mt-5 gap-4">
        {isEditing ? (
            <input value={editInput} onChange={(e) => setEditInput(e.target.value)} className="bg-white max-h-10 rounded-lg border-black border-2" />
        ) : (
            <span>{props.board.title}</span>
        )}
        <div className="ml-auto flex flex-col gap-2">
            <button className="bg-green-500 px-4 rounded-md" onClick={handleEdit}>{isEditing ? "Save" : "Edit"}</button>
            <button className="bg-red-500 px-4 rounded-md">Delete</button>
        </div>
    </div>
)
```

**Mit tanulunk ebből?**
- Feltételes UI: ugyanaz a komponens kétféle “nézetet” ad az állapot alapján.
- A React itt is deklaratív: nem átírjuk a DOM-ot, hanem a state alapján mást renderelünk.

---

## Boardok törlése
A törlés már nagyon hasonló a szerkesztéshez: egy HTTP kérés, majd adatfrissítés.

```tsx
const deleteBoard = () => {
    axios.delete(`/api/ticketing/boards/${props.board.id}`).then(() => {
        console.log("Deleted board with id " + props.board.id + ": " + props.board)
        props.getBoards()
    })
}
```

```tsx
<button className="bg-red-500 px-4 rounded-md" onClick={deleteBoard}>Delete</button>
```

**Élesben még ezek kellenének hozzá:**
- “Biztos törlöd?” megerősítés (confirm modal)
- hibakezelés
- optimista frissítés (a UI rögtön eltünteti, és ha hiba van, visszateszi)

---

## Összefoglalás
- A Reactben a felületet nem DOM-manipulációval építjük, hanem **állapotból rendereljük**.
- A `useState` ad memóriát a komponensnek; a setter hívása **újrarenderelést** triggerel.
- A `useEffect` a “render után futó” logika helye (pl. első adatlekérés).
- Next.js App Router-ben a state és event handling miatt gyakran kell a **`'use client'`**.
- A backend kommunikáció (axios) ugyanúgy része a frontend munkának, mint a UI.
- Amint nő a kód, érdemes refaktorálni és komponensekre bontani.

> Következő alkalomra ötletek: error/loading state-ek, form validáció, és egy rendes “data fetching” megoldás (pl. TanStack Query / SWR).
