---
sidebar_position: 2
---

# Spring tanfolyam - 2. alkalom

A mostani és a következő alkalmon egy ticketing alkalmazást fogunk készíteni táblákkal, címkékkel, jegyekkel és kommentekkel.

---

## 0. Fejezet - Kiinduló projekt

### Fork

Látogassuk meg a [projekt oldalát GitHub-on](https://github.com/kir-dev/ticketing-spring), majd **hozzunk létre egy új Fork-ot**, amin majd dolgozni tudunk (ez lényegében készít egy másolatot a projektről a GitHub fiókunkra).

![New Fork](../../static/img/spring/Fork.jpg)

Arra figyeljünk, hogy NE csak a `master`-et másoljuk át!

![New Fork - copy all braches](../../static/img/spring/Fork2.jpg)

Amint láthatjuk, több branch-csel (ággal) is rendelkezik a projektünk, ami a különböző fejezetekhez lett előkészítve. Ha valahol elakadnánk vagy vissza szeretnénk nézni valamit, akkor it a fejezetek között van lehetőségünk "ugrálni".

![Branches](../../static/img/spring/Branches.jpg)

### Clone

**Klónozzuk le a** frissen létrejött **projektünket** GitHubról! Ezt megtehetjük például a `git clone <URL>` paranccsal. Ezután **váltsunk át a** `chapter-0` nevű **branchre** a `git checkout chapter-0` vagy `git switch chapter-0` paranccsal (a projektmappán belül)!

A projektünk tartalmaz már egy egyszerű Spring Boot alkalmazást (`TicketingSpringApplication.kt`).

```kotlin
@SpringBootApplication
class TicketingSpringApplication

fun main(args: Array<String>) {
    runApplication<TicketingSpringApplication>(*args)
}
```

### AppService létrehozása

Egy egyszerű szolgáltatást **hozzunk létre** `AppService` néven, két metódussal:

- Legyen egy `getHello` metódusunk, ami **visszaad egy** `"Hello World!"` **sztringet**.
- Legyen egy `getPersonalizedHello` metódusunk, ami **egy nevet** (`name: String`) **és egy napot** (`day: String?`) **kap paraméterül, majd visszatér egy köszöntéssel**. Figyeljünk arra, hogy a `day` lehet `null` is!

Először hozzuk létre a szolgáltatás osztályt!

```kotlin
@Service
class AppService{
}
```

Hogy a `@Service` annotációt használni tudjuk **importáljuk be a** szükséges **könyvtárat**:

```kotlin
import org.springframework.stereotype.Service
```

Vegyük fel a `getHello` metódusunkat:

```kotlin
fun getHello(): String{
    return "Hello World!"
}
```

Majd a `getPersonalizedHello`-t is írjuk meg. Arra figyeljünk, hogy a `day` lehet `null` is, így ebben az esetben `"day"` legyen az értéke.

```kotlin
fun getPersonalizedHello(name: String, day: String?): String{
    val Day = day?:"day"
    return "Hello $name, have a nice $Day!"
}
```

Tehát a teljes osztály így néz ki:

```kotlin
@Service
class AppService{
    fun getHello(): String{
        return "Hello World!"
    }

    fun getPersonalizedHello(name: String, day: String?): String{
        val Day = day?:"day"
        return "Hello $name, have a nice $Day!"
    }
}
```

### AppController létrehozása

Hozzunk létre egy kontrollert `AppController` néven, ami két végpontot definiál:

- A `/` végponton a szolgáltatásunk `getHello` köszönő metódusát, míg
- a `/hello/{name}` végponton a személyre szabott `getPersonalizedHello` köszönést használja.

Kezdjük megint az osztály létrehozásával, ami kap egy `@RestController` annotációt, és paraméterül fogadja az `appService` szolgáltatást:

```kotlin
@RestController
class AppController(private val appService: AppService) {
}
```

Vegyük fel a GET típusú `/` végpontot, ami a szolgáltatás `getHello` metódusát használja:

```kotlin
@GetMapping("/")
fun getHello(): String{
    return appService.getHello()
}
```

Vegyük fel a GET típusú `/hello/{name}` végpontot, ami a szolgáltatás `getPersonalizedHello(name: String, day: String?)` metódusát használja. `@Param` ???????????????????????????? nem `@RequestParam`???

```kotlin
@GetMapping("/hello/{name}")
fun getPersonalizedHello(@PathVariable name: String, @Param("day") day: String?): String{
    return appService.getPersonalizedHello(name, day)
}
```

A teljes kontroller:

```kotlin
@RestController
class AppController(private val appService: AppService) {

    @GetMapping("/")
    fun getHello(): String{
        return appService.getHello()
    }

    @GetMapping("/hello/{name}")
    fun getPersonalizedHello(@PathVariable name: String, @Param("day") day: String?): String{
        return appService.getPersonalizedHello(name, day)
    }
}
```

### Eddigi működés bemutatása - 0. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 1. Fejezet - Board váza

Létre szeretnénk hozni táblákat (`Board`), amikre jegyeket tudunk rakni, de ehhez először tervezzük meg a szolgáltatás és kontroller vázát.

### DTOk felvétele

Vegyünk fel egy `board` mappát, és abba dolgozzunk. Itt hozzunk létre egy `BoardDtos` nevű fájlt, amiben elhelyezünk két adatosztályt (`CreateBoardDto` és `UpdateBoardDto`), amiknek egyelőre csak címet adunk.

```kotlin
data class CreateBoardDto(
    val title: String
)

data class UpdateBoardDto(
    val title: String
)
```

### BoardService hozzáadása

Hozzunk létre egy `BoardService` nevű szolgáltatást (szintén a `board` mappában), aminek legyen `createBoard`, `getBoard`, `getAllBoards`, `updateBoard` és `deleteBoard` metódusa. Ezeket a tagfüggvényeket egyelőre placeholderekekkel töltsük fel, majd később fogjuk ténylegesen implementálni.

```kotlin
@Service
class BoardService() {

    fun createBoard(board: CreateBoardDto): String {
        return "This action adds a new board"
    }

    fun getBoard(id: Int): String {
        return "This action returns a #${id} board"
    }

    fun getAllBoards(): String {
        return "This action returns all boards"
    }

    fun updateBoard(id: Int, board: UpdateBoardDto): String {
        return "This action updates a #${id} board"
    }

    fun deleteBoard(id: Int): String {
        return "This action removes a #${id} board"
    }

}
```

### BoardController hozzáadása

Hozzunk létre egy `BoardController` nevű REST kontrollert (szintén a `board` mappában), ami a `/board` kezdető végpontokért fog felelni. Legyen neki `createBoard`, `getAllBoards`, `getBoard`, `updateBoard` és `deleteBoard` metódusa, ami a BoardService szolgáltatást fogja használni. A szolgáltatáshoz hasonlóan, itt is csak a vázat fogjuk felépíteni, és később írjuk meg a függvényeket.

```kotlin
@RestController
@RequestMapping("/board")
class BoardController(private val boardService: BoardService) {

    @PostMapping
    fun createBoard(@RequestBody board: CreateBoardDto): String {
        val created = boardService.createBoard(board)
        return created
    }

    @GetMapping
    fun getAllBoards(): String {
        val boards = boardService.getAllBoards()
        return boards
    }

    @GetMapping("/{id}")
    fun getBoard(@PathVariable id: Int): String {
        val board = boardService.getBoard(id)
        return board
    }

    @PatchMapping("/{id}")
    fun updateBoard(@PathVariable id: Int, @RequestBody board: UpdateBoardDto): String {
        val updated = boardService.updateBoard(id, board)
        return updated
    }

    @DeleteMapping("/{id}")
    fun deleteBoard(@PathVariable id: Int): String {
        val res = boardService.deleteBoard(id)
        return res
    }

}
```

### Eddigi működés bemutatása - 1. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 2. Fejezet - Board és Ticket entitás, Board kidolgozása

### Entitások felvétele

xd

### Eddigi működés bemutatása - 2. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 3. Fejezet - xd

### Eddigi működés bemutatása - 3. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 4. Fejezet - xd

### Eddigi működés bemutatása - 4. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 5. Fejezet - xd

### Eddigi működés bemutatása - 5. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 6. Fejezet - xd

### Eddigi működés bemutatása - 6. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

## 7. Fejezet - xd

### Eddigi működés bemutatása - 7. fejezet végén

MŰKÖDÉS BEMUTATÁSA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

---

Feladatot készítette: **[Szabó Benedek](https://github.com/SzBeni2003)**
Leírást készítette: **[Bácsi Miklós](https://github.com/MiklosBacsi)**
