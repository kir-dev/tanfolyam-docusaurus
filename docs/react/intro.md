---
sidebar_position: 1
---

# React tanfolyam - 1. alkalom

## A tanfolyam célja

Ez a kurzus a modern frontend fejlesztés alapjait mutatja be.

A webes és backend kurzusok után itt azt tanuljuk meg, hogyan készítünk felhasználói felületet (UI-t), ami:
•	backendhez csatlakozik
•	adatot jelenít meg
•	interaktív
•	skálázható
•	és production-ready

A Kir-Dev projektjeiben elsősorban a
React
és a
Next.js
keretrendszert használjuk.

## Mi az a frontend?

A _**[Webes alapok](/docs/webes-alapok/intro.md)**_ tanfolyamon megismerkedhettetek a webfejlesztés alapjaival, mint például a HTML, CSS és JavaScript. Ezek az eszközök a frontend fejlesztés alapját képezik.

A frontend az a része az alkalmazásnak, amit a felhasználó lát és használ.

Ez fut:
•	a böngészőben
•	a felhasználó gépén
•	JavaScript környezetben

A backend ezzel szemben:
•	adatot tárol
•	üzleti logikát futtat
•	API-t biztosít

### Mentális modell

Felhasználó ↔ Frontend ↔ Backend ↔ Adatbázis

A frontend feladata:
1.	Adat lekérése a backendtől
2.	Az adat állapotként való kezelése
3.	Az állapot megjelenítése a felhasználó számára



## Hogyan működik a web?

### Request–Response modell

A web alapja a HTTP kérés–válasz modell.
1.	A böngésző elküld egy HTTP requestet
2.	A szerver visszaküld egy HTTP response-t
3.	A böngésző kirendereli az oldalt

Ezt már a webes alapok kurzuson láttuk — itt most azt vizsgáljuk meg, mi történik a böngészőben a válasz után.



### Mi történik a böngészőben?

A böngésző:
•	HTML-ből DOM fát készít
•	CSS-ből stílusfát épít
•	JavaScriptet futtat
•	ezekből renderelt képet készít

Fontos megérteni:

A böngésző nem “oldalakat” kezel, hanem egy élő dokumentumot (DOM).



## Klasszikus web vs Modern web

### Klasszikus szerveroldali renderelés

Régebben minden kattintás:
•	új HTTP kérés
•	új HTML oldal
•	teljes újratöltés

Ez egyszerű volt, de:
•	lassú
•	UX-ben gyenge
•	nem alkalmazás-szerű



### Single Page Application (SPA)

A modern webalkalmazások gyakran SPA-k.

Egy HTML oldal töltődik be,
és utána a JavaScript frissíti a tartalmat.

Itt jön képbe a
React.



## Miért nem elég a sima JavaScript?

Tegyük fel, hogy:
•	van egy lista
•	hozzáadunk elemeket
•	törlünk elemeket
•	szűrünk

Vanilla JavaScriptben:
•	manuálisan kell DOM elemeket létrehozni
•	manuálisan frissíteni
•	figyelni, hogy mi változott

Ez hamar kaotikussá válik.

A valódi probléma:

Hogyan tartjuk szinkronban az alkalmazás állapotát és a felhasználói felületet?



## A React gondolkodásmód

### Deklaratív programozás

Nem azt mondjuk:

“módosítsd ezt az elemet”

Hanem azt:

“ha ez az állapot, akkor így nézzen ki a felület”

Ez egy szemléletváltás.



### UI = f(state)

Ez az egyik legfontosabb mentális modell.

A felhasználói felület az állapot függvénye.

Ha az állapot változik → újrarenderelés történik.



### Komponensek

A Reactben a UI kis, újrafelhasználható egységekből áll:
•	gomb
•	kártya
•	lista
•	oldal

Ezeket komponenseknek nevezzük.



### Egyirányú adatfolyam

Az adat:
•	fentről lefelé áramlik
•	szülő → gyerek komponensekbe

Ez kiszámíthatóbbá teszi az alkalmazást.



## Mi az a NextJS?

A
Next.js
egy React alapú framework.

Mit ad hozzá a Reacthez?
•	Routing
•	Szerveroldali renderelés
•	Projekt struktúra
•	Production optimalizálás

A Kir-Dev projektjeiben ezt használjuk.



## Styling modern frontendben

A projektjeinkben
Tailwind CSS
keretrendszert használunk.

Ez:
•	utility-first megközelítést alkalmaz
•	nem külön CSS fájlokra épít
•	gyors prototípus készítést tesz lehetővé
•	jól skálázható



## Hogyan kapcsolódik a backendhez?

A következő alkalomtól:
•	a Node backendhez
•	illetve a Spring ticketing API-hoz

fogunk frontendet készíteni.

A frontend:
•	HTTP kéréseket küld
•	JSON adatot kap
•	állapotként eltárolja
•	megjeleníti



## Következő alkalom?
•	NextJS projekt létrehozás
•	alap komponensek
•	backendhez csatlakozás
•	lista megjelenítés

