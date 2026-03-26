# React Live Coding 1: Ticketing Frontend

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

---

### Kiinduló állapot:
Ez a kiindulási alap. Egy friss Next.js projekt, a szükséges könyvtárszerkezettel (`src/app/`, `public/`).

A projekt alapértelmezés szerint a `master` ágon áll, ami egy minimális Next.js kezdőoldalt tartalmaz a Kir-Dev logójával és üdvözletével. Erre fogunk építkezni a továbbiakban.

---

## Komponensek, state-k és hook-ok alapvető bemutatása

Vigyünk egy kis extra funkcionalitást a projektünkbe, hogy a gyakorlatban is megismerkedjünk a már tárgyalt React komponensekkel, a state-kezeléssel és a hook-ok használatával.

Vegyünk fel egy állapotot a `page.tsx` fájlban, amely egy számlálót fog kezelni. Ez egy egyszerű példa arra, hogyan használhatjuk a `useState` hook-ot a React-ben.

```tsx
// Fájl: src/app/page.tsx
const [counter, setCounter] = useState(0)
```

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

```tsx
'use client'
```

---

### Adatok küldése a backendnek az API és hook-ok használatával

Ebben a lépésben bővítjük a `page.tsx` fájlt, előkészítve a későbbi dinamikus tartalmat.

Az elkészítendő funkció egy egyszerű input mező és egy gomb lesz, amely lehetővé teszi a felhasználó számára, hogy új "board"-ot adjon hozzá a backendhez. Az input értékét egy `useState` hook-kal fogjuk kezelni.

```tsx
const [inputValue, setInputValue] = useState<string>("")
```

```tsx
const backendURL = "/api/ticketing/boards"
```

```tsx
import axios from "axios";
```
```tsx
const onAdd = () => {
    axios.post(backendURL, {
        title: inputValue
    }).then((res) => {
        setInputValue("")
        getBoards()
        console.log(res.data)
    })
}
```

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

---

### Adatlekérés és megjelenítés

```tsx
const [boards, setBoards] = useState<Board[]>([])
```

```tsx
type Board = {
    id: number;
    title: string;
    createdAt: string;
}
```

```tsx
const getBoards = () => {
    axios.get(backendURL).then((res) => setBoards(res.data))
}
```

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

```tsx
useEffect(() => {
    getBoards()
}, [])
```

### Refaktorálás:
Komponens alapú architektúrára váltunk. Létrehozzuk a `BoardItem` és `BoardItems` komponenseket.

**Új fájlok:**
*   `src/types/board.ts` (Típusdefiníciók)
*   `src/components/BoardItem.tsx`
*   `src/components/BoardItems.tsx`

```tsx
// Fájl: src/types/board.ts
export interface Board {
  id: string;
  title: string;
  createdAt: string;
}
```

```tsx
// Fájl: src/components/BoardItem.tsx
import { Board } from "@/types/board";

interface BoardItemProps {
  board: Board
}

export default function BoardItem (props: BoardItemProps) {
    return(
      <div className="rounded-lg p-4 bg-slate-500 mt-5">{props.board.title}</div>
    )
}
```

---

### Board címének szerkesztése
A komponensek finomhangolása, logikai bővítés.

**Módosítások:**
*   `src/components/BoardItem.tsx` frissítése: gomb hozzáadása a vásárláshoz.

```tsx
const [isEditing, setIsEditing] = useState<boolean>(false)
const [editInput, setEditInput] = useState<string>(props.board.title)
```

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

```tsx
interface BoardItemProps {
    board: Board,
    getBoards: () => void
}
```

```tsx
const handleEdit = () => {
    if (isEditing){
        editBoard()
    }
    setIsEditing(!isEditing)
}
```

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

---

### Boardok törlése
Az utolsó simítások a `BoardItem` komponensen.


```tsx
const deleteBoard = () => {
    axios.delete(`/api/ticketing/boards/${props.board.id}`).then(() => {
        console.log("Deleted board with id " + props.board.id + ": " + props.board)
        props.getData()
    })
}
```

```tsx
<button className="bg-red-500 px-4 rounded-md" onClick={deleteBoard}>Delete</button>
```

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
