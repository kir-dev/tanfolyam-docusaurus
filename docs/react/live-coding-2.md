# React tanfolyam — 3. alkalom, Live Coding 2

## Az alkalom célja röviden
Ezen az alkalmon a **korábban elkészített ticketing frontend alkalmazást** fejlesztjük tovább: lecseréljük a kézi adatlekérést és állapotkezelést professzionális megoldásokra, bevezetünk egy komponens könyvtárat, és megismerkedünk a Next.js App Router mintáival.

- **TanStack Query:** szerver-oldali állapot kezelése (cache, loading, error state-ek automatikusan).
- **React Hook Form:** űrlapkezelés egyszerűen, `useState` nélkül.
- **shadcn/ui:** előre elkészített, szép és akadálymentes UI komponensek.
- **Next.js App Router minták:** route-ok, layout-ok, provider-ek helyes szervezése.

Az előző alkalomhoz hasonlóan „építőkockákat" adunk: minimális kódrészlet + magyarázat, amit együtt építünk fel.

## Ismétlés az előző alkalomról
Az előző live coding alkalmon felépítettünk egy működő ticketing frontend alkalmazást Next.js-ben. Megismertük a `useState` és `useEffect` hook-okat, az `axios`-szal történő HTTP kommunikációt, és a komponens alapú refaktorálást (`BoardItem`, `BoardInput`). A `page.tsx`-ben manuálisan kezeltük a boardok listáját (`useState<Board[]>`), a `getBoards()` függvénnyel kértük le az adatokat, és props-ként adtuk le a gyerek komponenseknek.

> Az alkalomhoz a [ticketing-frontend-2026](https://github.com/kir-dev/ticketing-frontend-2026) repóban dolgozunk tovább. Ha még nem klónoztad, vagy friss verzióra van szükséged:
> ```bash
> git clone https://github.com/kir-dev/ticketing-frontend-2026.git
> cd ticketing-frontend-2026
> npm install
> npm run dev
> ```

Az előző alkalom végállapota a chapter-5 branchen van, ha valami hiányozna a saját projektedből, akkor itt tudod elérni.
> ```bash
> git checkout chapter-5
> ```

---

## TanStack Query (React Query)

### Mi a probléma a jelenlegi megoldással?
Az előző alkalmon a `page.tsx`-ben `useState`-tel tároltuk a boardok listáját, és `useEffect`-tel kértük le az adatokat. Minden CRUD művelet után manuálisan hívtuk a `getBoards()` függvényt, és a `getBoards` referenciáját props-ként adtuk le minden gyerek komponensnek.

Ez kis alkalmazásnál még működik, de ahogy nő a projekt:
- Nincs **cache**: minden navigáció vagy mount újra lekéri az adatokat.
- Nincs **loading/error state** kezelés automatikusan.
- A `getBoards` props-ként való továbbadása "prop drilling"-hez vezet.
- Nincs deduplikáció: ha két komponens is lekéri ugyanazt, két kérés megy el.

### Telepítés

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Custom hook-ok létrehozása

A TanStack Query lényege, hogy az adatlekérést és -módosítást **hook-okba** szervezzük, és a könyvtár kezeli a cache-t, loading/error állapotokat, és az újralekérést.

#### useBoards — adatlekérés

```tsx
// Fájl: src/hooks/useBoards.ts
import axios from "axios";
import { Board } from "@/types/board";
import { useQuery } from "@tanstack/react-query";

const backendURL = "/api/ticketing/boards"

export function useBoards() {
    return useQuery<Board[]>({
        queryKey: ["boards"],
        queryFn: async () => {
            const response = await axios.get<Board[]>(backendURL)
            return response.data
        }
    })
}
```

**Mi történik itt?**
- `queryKey: ["boards"]` — ez az adat egyedi azonosítója a cache-ben. Ha más komponens is `["boards"]` kulccsal kér le, **nem** megy újabb HTTP kérés, hanem a cache-ből kapja az adatot.
- `queryFn` — az a függvény, ami ténylegesen lekéri az adatot (itt az axios GET).
- A `useQuery` visszaad nekünk `data`, `isFetching`, `isError` és még sok más hasznos mezőt.

#### useAddBoard — board létrehozása

```tsx
// Fájl: src/hooks/useAddBoard.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const backendURL = "/api/ticketing/boards"

export default function useAddBoard() {
    return useMutation({
        mutationFn: async (title: string) => {
            const response = await axios.post(backendURL, {
                title: title
            })
            return response.data
        }
    })
}
```

**Mi a különbség `useQuery` és `useMutation` között?**
- `useQuery` → **olvasás** (GET). Automatikusan lefut mount-kor, cache-el, újrapróbál hiba esetén.
- `useMutation` → **írás** (POST/PATCH/DELETE). Nem fut le automatikusan, hanem mi hívjuk meg a `.mutateAsync()` metódussal. Visszaadja az `isPending` állapotot is.

#### useEditBoard — board szerkesztése

```tsx
// Fájl: src/hooks/useEditBoard.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useEditBoard() {
    return useMutation({
        mutationFn: async (data: {id: number, title: string}) => {
            const response = await axios.patch(`/api/ticketing/boards/${data.id}`, {
                title: data.title
            })
            return response.data
        }
    })
}
```

#### useDeleteBoard — board törlése

```tsx
// Fájl: src/hooks/useDeleteBoard.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function useDeleteBoard() {
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await axios.delete(`/api/ticketing/boards/${id}`)
            return response.data
        }
    })
}
```

### QueryClientProvider beállítása

A TanStack Query-nek szüksége van egy **provider**-re, amely az egész alkalmazást körbeveszi. Ez tárolja a cache-t és kezeli az összes query-t.

```tsx
// Fájl: src/app/page.tsx
'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "@/app/app";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient()

export default function Home() {
    return (
        <QueryClientProvider client={queryClient}>
            <App/>
            <ReactQueryDevtools/>
        </QueryClientProvider>
    );
}
```

**Mi az a `ReactQueryDevtools`?**
Egy fejlesztői eszköz, amely a böngészőben megmutatja az összes aktív query-t, azok állapotát, cache tartalmát. Fejlesztéskor nagyon hasznos, éles buildben automatikusan kimarad.

### A főkomponens átírása

Az alkalmazás logikáját egy külön `App` komponensbe szervezzük, hogy a `page.tsx` csak a provider beállítással foglalkozzon:

```tsx
// Fájl: src/app/app.tsx
import BoardInput from "@/components/BoardInput";
import BoardItem from "@/components/BoardItem";
import { useBoards } from "@/hooks/useBoards";

export default function App () {
    const {data, isFetching} = useBoards()

    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center">
            <div className="mt-10">
                <BoardInput />
                {isFetching ? "Loading..." : (
                    <div className="overflow-auto">
                        {data?.map((board) => (
                            <BoardItem board={board} key={board.id} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
```

**Mi változott az előzőhöz képest?**
- Nincs `useState<Board[]>` — a `useBoards()` hook kezeli az adatot.
- Nincs `useEffect` — a `useQuery` automatikusan lekéri az adatot mount-kor.
- Nincs `getBoards` props — a gyerek komponenseknek nem kell átadni semmit az adatfrissítéshez.
- Van `isFetching` — a loading state automatikusan jön a hook-ból.

### Komponensek frissítése

A `BoardInput` és `BoardItem` is egyszerűsödik. A props-ból eltűnik a `getBoards`, helyette a TanStack Query **invalidation** mechanizmusát használjuk:

```tsx
// Fájl: src/components/BoardInput.tsx (lényegi részek)
import useAddBoard from "@/hooks/useAddBoard";
import { useQueryClient } from "@tanstack/react-query";

export default function BoardInput() {
    const addBoard = useAddBoard()
    const [inputValue, setInputValue] = useState<string>("")
    const queryClient = useQueryClient();

    const onAdd = () => {
        addBoard.mutateAsync(inputValue).then(() => {
            queryClient.invalidateQueries({queryKey: ["boards"]})
        }).then(() =>{
            setInputValue("")
        })
    }
    // ...
}
```

**Mi az a `invalidateQueries`?**
Azt mondjuk a TanStack Query-nek: "a `boards` kulcsú adat elavult, kérd le újra". Ez automatikusan frissíti az összes komponenst, amely a `useBoards()` hook-ot használja — **nincs szükség props-ra vagy callback-re**.

A `BoardItem`-ben hasonlóan:

```tsx
// Fájl: src/components/BoardItem.tsx (lényegi részek)
import useEditBoard from "@/hooks/useEditBoard";
import useDeleteBoard from "@/hooks/useDeleteBoard";
import { useQueryClient } from "@tanstack/react-query";

export default function BoardItem (props: BoardItemProps) {
    const queryClient = useQueryClient();
    const boardEdit = useEditBoard()
    const boardDelete = useDeleteBoard()

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["boards"] })
    }

    const editBoard = () => {
        boardEdit.mutateAsync({id: props.board.id, title: editInput})
    }

    const deleteBoard = () => {
        boardDelete.mutateAsync(props.board.id)
    }
    // ...
}
```

**Az eredmény:**
- Nem kell `getBoards` props-t lepasszolni.
- Bármelyik komponens képes „frissíteni" az adatot anélkül, hogy tudná, ki más használja azt.
- A loading/error state-ek automatikusan elérhetők.

---

## React Hook Form

### Mi a probléma a jelenlegi megoldással?
A `BoardInput`-ban az input értékét manuálisan kezeltük `useState`-tel. Ez egyetlen mezőnél még oké, de ha egy űrlapon 5-10 mező van, mindegyikhez külön state + onChange handler kell. Ezen kívül a validáció (pl. "nem lehet üres", "minimum 3 karakter") is kézzel kellene.

### Telepítés

```bash
npm install react-hook-form
```

### BoardInput átírása React Hook Form-mal

```tsx
// Fájl: src/components/BoardInput.tsx
import useAddBoard from "@/hooks/useAddBoard";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface AddBoardProp {
    title: string
}

export default function BoardInput() {
    const addBoard = useAddBoard()
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<AddBoardProp>()

    const onSubmit = handleSubmit((values) => {
        addBoard.mutateAsync(values.title).then(() => {
            queryClient.invalidateQueries({queryKey: ["boards"]})
        })
        reset()
    })

    return(
        <div>
            <form onSubmit={onSubmit}>
                <input
                    className="border-black border-2"
                    {...register("title")}
                />
                <button type="submit">
                    {addBoard.isPending ? "Loading..." : "Add"}
                </button>
            </form>
        </div>
    )
}
```

**Mi változott?**
- Nincs `useState<string>("")` az input értékhez.
- A `useForm<AddBoardProp>()` hook kezeli az összes form state-et.
- `register("title")` — összeköti az input mezőt a form-mal. A `{...register("title")}` spread operátorral adja hozzá a szükséges `onChange`, `value`, `ref` stb. prop-okat.
- `handleSubmit` — körbecsomagolja a submit logikát; automatikusan validál (ha van validáció beállítva), és a callback-ben megkapjuk a form értékeit típusosan.
- `reset()` — az összes mező visszaáll az alapértékre submit után.

**Miért `<form>` és `type="submit"`?**
Ez natív HTML form viselkedés: Enter-re is submitol, és a böngésző is jobban kezeli (pl. akadálymentesség, autofill). Korábban `onClick`-kel oldottuk meg, ami nem volt teljesen szabályos.

---

## shadcn/ui

### Mi az a shadcn/ui?
A shadcn/ui nem egy hagyományos npm csomag, hanem egy **komponens gyűjtemény**, amelyet a projektedbe másolsz. Az előnye:
- **Szép, modern UI** — alapból jól néz ki, sötét/világos mód támogatással.
- **Akadálymentes** — a Radix UI primitívekre épül, ami gondoskodik a keyboard navigációról, screen reader támogatásról stb.
- **Testreszabható** — a komponens kódja a te projektedben van, szabadon módosíthatod.
- **Tailwind CSS alapú** — illeszkedik a már használt stílus megoldásunkhoz.

### Telepítés

A shadcn/ui inicializálása létrehozza a `components.json` konfigurációs fájlt és beállítja a szükséges path alias-okat:

```bash
npx shadcn@latest init
```

Ezután egyesével tudjuk hozzáadni a szükséges komponenseket:

```bash
npx shadcn@latest add button card input label badge
```

Ez a parancs a `src/components/ui/` mappába másolja a komponensek forráskódját. Létrejön egy `src/lib/utils.ts` is, amely a `cn()` segédfüggvényt tartalmazza — ez a `clsx` és `tailwind-merge` kombinációja, ami lehetővé teszi a Tailwind class-ok biztonságos összeolvasztását.

### Komponensek átírása shadcn/ui-ra

#### App komponens

```tsx
// Fájl: src/app/app.tsx
import BoardInput from "@/components/BoardInput";
import BoardItem from "@/components/BoardItem";
import { useBoards } from "@/hooks/useBoards";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";

export default function App() {
    const { data, isFetching } = useBoards();

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg tracking-tight">Ticketing</span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your project boards</p>
                </div>

                <BoardInput />

                <div className="mt-10">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Your Boards
                        </h2>
                        {data && (
                            <Badge variant="secondary">{data.length}</Badge>
                        )}
                    </div>

                    {isFetching ? (
                        <div className="flex justify-center py-16">
                            <Spinner />
                        </div>
                    ) : data?.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No boards yet. Create one above!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {data?.map((board) => (
                                <BoardItem board={board} key={board.id} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
```

**Mit jelent a `bg-muted/30`, `text-muted-foreground`, `text-primary`?**
Ezek **shadcn/ui CSS változók**, amelyeket a `globals.css`-ben definiálunk. A shadcn/ui egy teljes téma rendszert ad: light/dark mód, konzisztens színek, spacing. A `/30` az opacity (30%).

**Mi az a `lucide-react`?**
A shadcn/ui a **Lucide** ikon könyvtárat használja. Minden ikon egy React komponens, amit közvetlenül importálhatunk (`LayoutDashboard`, `Plus`, `Pencil`, `Trash2` stb.).

#### BoardInput komponens

```tsx
// Fájl: src/components/BoardInput.tsx
import useAddBoard from "@/hooks/useAddBoard";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface AddBoardProp {
    title: string;
}

export default function BoardInput() {
    const addBoard = useAddBoard();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<AddBoardProp>();

    const onSubmit = handleSubmit((values) => {
        addBoard.mutateAsync(values.title).then(() => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
        });
        reset();
    });

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">New Board</CardTitle>
                <CardDescription>Give your board a name to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1.5">
                        <Label htmlFor="board-title" className="sr-only">Board title</Label>
                        <Input
                            id="board-title"
                            placeholder="e.g. Sprint Planning, Bug Tracker..."
                            {...register("title")}
                        />
                    </div>
                    <Button type="submit" disabled={addBoard.isPending} className="shrink-0">
                        {addBoard.isPending ? (
                            <Spinner />
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
```

**Mit látunk itt?**
- A sima `<input>` és `<button>` helyett `<Input>`, `<Button>`, `<Card>` shadcn/ui komponenseket használunk.
- A `<Label className="sr-only">` egy screen reader-only label — vizuálisan nem látszik, de a képernyőolvasók számára elérhető (akadálymentesség).
- A `<Spinner />` komponens automatikus loading indikátort ad a gombban.
- A `disabled={addBoard.isPending}` letiltja a gombot, amíg a kérés fut — megakadályozza a dupla kattintást.

#### BoardItem komponens

```tsx
// Fájl: src/components/BoardItem.tsx
import { Board } from "@/types/board";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useEditBoard from "@/hooks/useEditBoard";
import useDeleteBoard from "@/hooks/useDeleteBoard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface BoardItemProps {
    board: Board;
}

export default function BoardItem({ board }: BoardItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editInput, setEditInput] = useState(board.title);
    const queryClient = useQueryClient();
    const boardEdit = useEditBoard();
    const boardDelete = useDeleteBoard();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["boards"] });
    };

    const handleSave = () => {
        boardEdit.mutateAsync({ id: board.id, title: editInput }).then(handleRefresh);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditInput(board.title);
        setIsEditing(false);
    };

    const handleDelete = () => {
        boardDelete.mutateAsync(board.id).then(handleRefresh);
    };

    return (
        <Card className="transition-all hover:shadow-sm group">
            <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />

                {isEditing ? (
                    <Input
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                        }}
                        className="flex-1 h-8"
                        autoFocus
                    />
                ) : (
                    <span className="flex-1 font-medium text-sm">{board.title}</span>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                        <>
                            <Button size="icon" variant="ghost" onClick={handleSave}
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={boardEdit.isPending}>
                                <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8">
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8">
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleDelete}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={boardDelete.isPending}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
```

**Mik az újdonságok?**
- `variant="ghost"` — átlátszó gomb, ami hover-re kap hátteret. A shadcn/ui Button-nek több variánsa van: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
- `size="icon"` — kis, négyzet alakú gomb, ikonokhoz ideális.
- `group` és `group-hover:opacity-100` — Tailwind "group" minta: az egész kártya hover-jére jelennek meg a gombok. Ez tisztább UX-et ad.
- `onKeyDown` — Enter-rel mentés, Escape-szel mégse. Ez billentyűzettel is használhatóvá teszi az alkalmazást.
- `text-destructive` — shadcn/ui szín a "veszélyes" műveletekhez (törlés).

---

## Next.js App Router minták

### Miért van erre szükség?
Eddig minden egy `page.tsx`-ben volt, ami egyben a provider setup-ot és az üzleti logikát is tartalmazta. Egy valódi alkalmazásban:
- Több **oldal** (route) van.
- A **provider-eket** (QueryClientProvider, theme, auth stb.) egyszer, globálisan kell beállítani.
- A **navigáció** (navbar) minden oldalon megjelenik.

### Providers kiszervezése

A `QueryClientProvider`-t és a devtools-t egy külön `Providers` komponensbe szervezzük:

```tsx
// Fájl: src/app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

**Miért `useState(() => new QueryClient())` és nem `const queryClient = new QueryClient()`?**
A `useState` inicializáló függvénye **csak egyszer** fut le. Ha a `new QueryClient()`-et közvetlenül hívnánk, minden rendereléskor új instance jönne létre, ami elveszítené a cache-t. A `useState`-es megoldás garantálja, hogy egyetlen `QueryClient` példány él a komponens teljes életciklusa alatt.

**Miért kell a `"use client"`?**
A `QueryClientProvider` React context-et használ, ami kliens-oldali funkció. A layout.tsx viszont Server Component marad — ezért kell a provider-eket külön Client Componentbe tenni.

### Layout frissítése

```tsx
// Fájl: src/app/layout.tsx (módosított részek)
import Navbar from "@/components/Navbar";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Mit jelent ez?**
- A `Providers` körbeveszi az egész alkalmazást → minden oldal hozzáfér a `QueryClient`-hez.
- A `Navbar` minden oldalon megjelenik (mert a layout-ban van).
- A `{children}` az aktuális oldal tartalma.

### Navbar komponens

A header-t, amit korábban az `app.tsx`-ben volt, kiszervezzük egy önálló komponensbe:

```tsx
// Fájl: src/components/Navbar.tsx
import { LayoutDashboard } from "lucide-react";

export default function Navbar() {
    return (
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg tracking-tight">Ticketing</span>
            </div>
        </header>
    )
}
```

> Megjegyzés: ez a komponens nem használ hook-ot vagy event handler-t, ezért **Server Component** maradhat — nem kell hozzá `'use client'`.

### File-based routing: Boards oldal

A Next.js App Router-ben az **útvonalakat a mappastruktúra** határozza meg. Ha létrehozunk egy `app/boards/page.tsx` fájlt, az automatikusan a `/boards` útvonalon lesz elérhető.

```tsx
// Fájl: src/app/boards/page.tsx
'use client'

import App from "@/app/app";

export default function Home() {
    return (
        <App/>
    );
}
```

A főoldal pedig egy egyszerű navigációs link lesz:

```tsx
// Fájl: src/app/page.tsx
'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <Link href={"/boards"} className="flex mx-auto">
            <Button className="p-10 text-lg">
                Boards
            </Button>
        </Link>
    );
}
```

**Mi a `Link` komponens?**
A Next.js `Link` komponense **kliens-oldali navigációt** végez: nem tölt be új oldalt a szerverről, hanem csak a szükséges komponenseket cseréli le. Ez gyorsabb és SPA-szerű élményt ad.

**A végeredmény mappastruktúra:**
```
src/
├── app/
│   ├── layout.tsx          ← globális layout (Providers + Navbar)
│   ├── providers.tsx       ← QueryClientProvider + devtools
│   ├── page.tsx            ← főoldal (/)
│   ├── app.tsx             ← board lista logika
│   └── boards/
│       └── page.tsx        ← boards oldal (/boards)
├── components/
│   ├── Navbar.tsx
│   ├── BoardInput.tsx
│   ├── BoardItem.tsx
│   └── ui/                 ← shadcn/ui komponensek
├── hooks/
│   ├── useBoards.ts
│   ├── useAddBoard.ts
│   ├── useEditBoard.ts
│   └── useDeleteBoard.ts
├── types/
│   └── board.ts
└── lib/
    └── utils.ts            ← cn() helper (shadcn/ui)
```

---

## Összefoglalás
- A **TanStack Query** átveszi a szerver-oldali állapot kezelését: automatikus cache, loading/error state-ek, és `invalidateQueries` az adatfrissítéshez — nem kell `getBoards` props-t lepasszolni.
- A **React Hook Form** egyszerűsíti az űrlapkezelést: `register`, `handleSubmit`, `reset` — nem kell minden mezőhöz külön `useState`.
- A **shadcn/ui** előre elkészített, akadálymentes és testreszabható UI komponenseket ad (`Button`, `Card`, `Input`), amelyek Tailwind CSS-re épülnek.
- A **Next.js App Router** file-based routing-ot, layout rendszert és Server/Client Component szétválasztást biztosít — a provider-eket a `layout.tsx`-ben, az útvonalakat a mappastruktúrában definiáljuk.

> Ezzel a három alkalommal egy teljes CRUD frontendet építettünk fel, a nyers `useState`+`axios`-tól a profeszionális tooling-ig (TanStack Query, React Hook Form, shadcn/ui, Next.js routing).
