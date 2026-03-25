# React Live Coding 1: Ticketing Frontend

## Ismétlés az előző alkalomról
A korábbi előadáson áttekintettük a modern webfejlesztés alapjait, különös tekintettel a **React** komponens-alapú architektúrájára és a **Next.js** keretrendszer nyújtotta előnyökre (mint a *Server Components* és az egyszerűsített útvonalválasztás). Megismertük a deklaratív UI építés lényegét, a komponensek közötti kommunikációt (props) és az alapvető állapotkezelést (*useState*).

## Repó áttekintése
A [ticketing-frontend-2026](https://github.com/kir-dev/ticketing-frontend-2026) repó egy jegyértékesítő rendszer felhasználói felületének alapjait építi fel lépésről lépésre, Next.js alapokon. A kód az alábbi ágakon keresztül fejlődik, ahol minden ág egy-egy funkcionális mérföldkövet jelent.

---

### 1. Ág: `bevezető`
Ez a kiindulási alap. Egy friss Next.js projekt, a szükséges könyvtárszerkezettel (`src/app/`, `public/`).

**Nincs szükség módosításra, ez a projekt alapja.**

---

### 2. Ág: `chapter-1`
Itt vezetjük be a Next.js konfigurációt és frissítjük a kezdőoldalt.

**Módosítások:**
*   `next.config.ts` frissítése.
*   `src/app/page.tsx` komponens strukturális frissítése.

```tsx
// Fájl: src/app/page.tsx
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Jegyértékesítő Rendszer</h1>
      <p>Üdvözöljük a felületen!</p>
    </main>
  );
}
```
*Ez a kód egy alapvető címsort jelenít meg a főoldalon.*

---

### 3. Ág: `chapter-2`
Ebben a lépésben bővítjük a `page.tsx` fájlt, előkészítve a későbbi dinamikus tartalmat.

**Módosítások:**
*   `src/app/page.tsx` továbbfejlesztése.

```tsx
// Fájl: src/app/page.tsx
// (Az előző tartalom kiegészítése)
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Jegyértékesítő Rendszer</h1>
      <div className="mt-4">
        <p>Itt hamarosan megjelennek a jegyek.</p>
      </div>
    </main>
  );
}
```

---

### 4. Ág: `chapter-3`
Komponens alapú architektúrára váltunk. Létrehozzuk a `BoardItem` és `BoardItems` komponenseket.

**Új fájlok:**
*   `src/types/board.ts` (Típusdefiníciók)
*   `src/components/BoardItem.tsx`
*   `src/components/BoardItems.tsx`

```tsx
// Fájl: src/types/board.ts
export interface BoardItemType {
  id: string;
  title: string;
}
```

```tsx
// Fájl: src/components/BoardItem.tsx
import { BoardItemType } from "../types/board";

export default function BoardItem({ item }: { item: BoardItemType }) {
  return <div className="border p-2 my-1">{item.title}</div>;
}
```

```tsx
// Fájl: src/components/BoardItems.tsx
import BoardItem from "./BoardItem";
import { BoardItemType } from "../types/board";

export default function BoardItems({ items }: { items: BoardItemType[] }) {
  return (
    <div>
      {items.map(item => <BoardItem key={item.id} item={item} />)}
    </div>
  );
}
```

---

### 5. Ág: `chapter-4`
A komponensek finomhangolása, logikai bővítés.

**Módosítások:**
*   `src/components/BoardItem.tsx` frissítése: gomb hozzáadása a vásárláshoz.

```tsx
// Fájl: src/components/BoardItem.tsx
import { BoardItemType } from "../types/board";

export default function BoardItem({ item }: { item: BoardItemType }) {
  return (
    <div className="border p-4 my-2 flex justify-between">
      <span>{item.title}</span>
      <button className="bg-blue-500 text-white p-1 rounded">Vásárlás</button>
    </div>
  );
}
```

---

### 6. Ág: `chapter-5`
Az utolsó simítások a `BoardItem` komponensen.

**Módosítások:**
*   Apróbb stílusbeli finomítások a `BoardItem`-ben.

```tsx
// Fájl: src/components/BoardItem.tsx
// (Frissítés: hover effekt hozzáadása)
<button className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600">
  Vásárlás
</button>
```

---
*A projekt most már készen áll az alapvető működésre. A hallgatók a fenti kódok bemásolásával eljutnak a repó végleges állapotáig.*

### Projekt indítása (diákoknak)
Miután bemásolták a kódokat a megfelelő fájlokba, a fejlesztői környezet elindításához az alábbi parancsokat kell futtatniuk a projekt gyökérkönyvtárában:

1.  **Függőségek telepítése:**
    ```bash
    npm install
    ```

2.  **Fejlesztői szerver indítása:**
    ```bash
    npm run dev
    ```
