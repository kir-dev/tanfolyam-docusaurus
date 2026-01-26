---
sidebar_position: 1
---

# Webes alapok

## A Web működése

A web egy **kliens-szerver modell**en alapuló hálózat, ahol **kliens** (például egy böngésző) egy **URL** megadásakor (pl. kir-dev.hu), a DNS segítségével kideríti a **szerver** pontos IP-címét. Ezt követően a kliens egy **HTTP-kérés**sel lekéri tőle a weboldal vázát adó HTML-fájlt. Amint a kliens elkezdi feldolgozni ezt a kódot, automatikusan behívja a többi szükséges elemet is (CSS, JavaScript, képek stb.), amíg végül megjeleníti a teljes weboldalt a felhasználó számára.

![HTTP Request](https://media.geeksforgeeks.org/wp-content/uploads/20231128175510/Client-Server-Model-2.png)

_**[Web működése - videó (angol)](https://www.youtube.com/watch?v=BGN0KP4aOR8)**_

## Webes technológiák

### Alapvető technológiák

- **HTML (HyperText Markup Language)**: Weboldalak **szerkezetének leírásához** használt nyelv.
- **CSS (Cascading Style Sheets)**: **Megjelenésért és elrendezésért** felelős stíluslapok.
- **JavaScript**: **Interaktív, dinamikus tartalom** létrehozásáért felelős programozási nyelv.

_**Rövid videók (YouTube: Fireship): [HTML](https://www.youtube.com/watch?v=ok-plXXHlWw), [CSS](https://www.youtube.com/watch?v=OEV8gMkCHXQ), [JavaScript](https://www.youtube.com/watch?v=DHjqpvDnNGE)**._

### Absztrakt technológiák

- **Node.js**: Szerveroldali JavaScript futtatókörnyezet, segítségével JS kódot is futtathatunk a szerveren. _Bővebben **[NodeJS tanfolyam](/docs/node-js/intro.md)**._
- **React**: Komponens-alapú JavaScript könyvtár, interaktív felhasználói felületek építésére. _Bővebben **[React tanfolyam](/docs/react/intro.md)**._
- **Spring Boot**: Java-alapú keretrendszer, amely megkönnyíti a webalkalmazások fejlesztését. _Bővebben **[Spring Boot tanfolyam](/docs/spring-boot/intro.md)**._

## HTML - HyperText Markup Language

Weboldalak szerkezetének leírására szolgáló nyelv, jellegzetessége a **tag**-ek (címkék) használata. Általános formátuma:
`<tag attribútumok>tartalom</tag>`.

_**[HTML tag-ek listája](https://www.tutorialspoint.com/html/html_basic_tags.htm)**_

Tag-ek közti tartalom lehet tetszőleges szöveg vagy akár más tag-ek is.

```
<html>
  <body>
    <h1>Kir-Dev tanfolyam</h1>
    <p>HTML alapok</p>
  </body>
</html>
```

Továbbá a tag-ek tartalmazhatnak **attribútumokat** is, melyek további funkcióval látják el az adott sort:
`<a href="https://kir-dev.hu">Kir-Dev</a>`, ahol a `href` attribútum határozza meg a hivatkozás címét. Egy tag **egyszerre több attribútumot is tartalmazhat**.

Egyszerű Log In form HTML-ben:

#### **#TODO: előadáson bemutatott form beillesztése**

## CSS - Cascading Style Sheets

### CSS alapok

A weboldalak megjelenéséért és elrendezéséért felelős stíluslapok. Segítségével a HTML elemek kinézetét és elrendezését szabályozhatjuk.

Minden HTML taghez hozzárendelhetünk különböző stílusokat a következő szintaxis szerint:

```
selector {
  property1: value;
  property2: value;
}
```

Előző bekezdésben szereplő HTML kódot kiegészíthetjük CSS-sel:

```
html {
  background-color: white;
}
h1 {
  color: black;
  font-size: 40px;
}
p {
  color: gray;
  font-size: 20px;
}
```

Egy **selector** lehet egy HTML tag neve (`h1`), egy osztály neve (`.class-name`), vagy egy azonosító neve (`#id`).
Ezeket akár kombinálhatjuk is, ha szükséges: `div.class-name`, `#id p`, stb.

### CSS alkalmazása

CSS használatának 3 formáját különböztetjük meg:

- **Inline**: Közvetlenül a HTML tag-en belül írjuk meg a stílust `style` attribútum segítségével `<h1 style="color: green">Kir-Dev tanfolyam</h1>`
- **Style element**: A `<head>` konténer tag-en belül egy `<style>` tag-ben definiáljuk a stílusokat.

```
<head>
  <style>
    h1 {
      color: blue;
    }
  </style>
</head>
```

- **Külső CSS fájl (preferált)**: Formázásra készítünk egy külön `.css` kiterjesztésű fájlt, majd azt a HTML kódunkban egy `<link>` tag-en belül hivatkoztatjuk. `<link rel="stylesheet" href="style.css">`

### Box Model, pozícionálás és layout

Minden tartalmat egy úgynevezett **Box Model**-ben helyezünk el, amely négy fő részből áll:

1. **Content**: Tényleges tartalom
2. **Padding**: A tartalom és a keret közötti tér
3. **Border**: A doboz kerete
4. **Margin**: A doboz és a többi elem közötti tér

![Box Model](https://media.gcflearnfree.org/content/5ef2084faaf0ac46dc9c10be_06_23_2020/box_model.png)

A megírt komponenseket tudjuk pozícionálni a weboldalon a következő tulajdonságok segítségével:

- `static`: Alapértelmezett pozíció.
- `relative`: Az elem az eredeti pozíciójához képest elmozdulhat.
- `absolute`: Az elem a legközelebbi pozícionált őshöz képest helyezkedik el.
- `fixed`: Az elem az oldalhoz képest rögzített pozícióban marad, görgetéskor sem mozdul el.
- `sticky`: Az elem a görgetés során változtatja a pozícióját, amíg el nem éri a megadott pozíciót.

![Positioning](https://www.csssolid.com/images/csspositions/css-position-all.png)

Léteznek különöző **layout modellek** is, ami abban segít hogy a komponensek hogyan helyezkedjenek el egymáshoz képest:

- **Flexbox**: Lehetővé teszi a komponensek rugalmas elrendezését egy sorban vagy oszlopban.
- **Grid**: Kétdimenziós elrendezés, lehetővé teszi a komponensek elrendezését sorok és oszlopok mentén.

![Layouts](https://blog.nashtechglobal.com/wp-content/uploads/2023/09/download-1-3-1024x538.png)

CSS-ben pseudo-osztályok segítségével különböző állapotokat írhatunk le egy elemhez:

- `:hover`, `focused`, `first-child`, `nth-child(n)` stb.

Stílusformázásra is kitaláltak különböző **keretrendszereket** (framework), hogy a fejleszőknek ne kelljen mindig minden stílust újra és újra megírniuk. Ilyen ismert keretrendszerek például a **Tailwind CSS** vagy a **Bootstrap**.

Most, hogy minden tudásnak bírtokában vagyunk, egészítsük ki a Log In formunkat CSS-sel:

#### **#TODO: előadáson bemutatott form beillesztése**

## JavaScript

A JavaScript elengedhetetlen ahhoz, hogy valaki egy dinamikus, interaktív weboldalt készítsen. JS egy nagy előnye, hogy a **böngésző futtatja**, így nincs szükség külön szerveroldali környezetre a kód futtatásához. Ezáltal a weboldal képes gyorsan reagálni különböző felhasználói inputokra, eseményekre.

### Kód beágyazása HTML-be

JS kódok beágyazása HTML kódba a `<script>` tag-ek között történik, rá is igaz, hogy lehet külső fájlból betölteni kódot vagy közvetlenül a tag-ek közé írni:

```
<script src="app.js"></script>

VAGY

<script>
  // JS kód helye
</script>
```

### DOM manipuláció

JavaScript DOM (Document Object Model) manipulációval képesek vagyunk dinamikusan módosítani a weboldalunk szerkezetét, tartalmát vagy stílusát anélkül, hogy az egész oldalt újra kellene tölteni.

Képesek vagyunk:

- Hivatkozni HTML elemekre - `const pwInput = document.getElementById('password');`
- Elemeket szerkeszteni - `pwInput.hidden = true;`
- Eseményeket kezelni - `<button onclick="buttonPressed()"> Approve <button>;`

Ezek ismeretében tegyük interaktívvá a Log In formunkat:

#### **#TODO: előadáson bemutatott form beillesztése**
