---
sidebar_label: '0. Fejezet - Kiinduló projekt'
sidebar_position: 1
label: '0. Fejezet - Kiinduló projekt'
---

# Spring tanfolyam - 2. alkalom

A mostani és a következő alkalmon egy ticketing alkalmazást fogunk készíteni táblákkal, címkékkel, jegyekkel és kommentekkel.

---

## 0. Fejezet - Kiinduló projekt

### Fork

Látogassuk meg a [projekt oldalát GitHub-on](https://github.com/kir-dev/ticketing-spring), majd **hozzunk létre egy új Fork-ot**, amin majd dolgozni tudunk (ez lényegében készít egy másolatot a projektről a GitHub fiókunkra).

![New Fork](../../../static/img/spring/Fork.jpg)

Arra figyeljünk, hogy NE csak a `master`-et másoljuk át!

![New Fork - copy all braches](../../../static/img/spring/Fork2.jpg)

Amint láthatjuk, több branch-csel (ággal) is rendelkezik a projektünk, ami a különböző fejezetekhez lett előkészítve. Ha valahol elakadnánk vagy vissza szeretnénk nézni valamit, akkor it a fejezetek között van lehetőségünk "ugrálni".

![Branches](../../../static/img/spring/Branches.jpg)

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

### Használható végpontok

Futtassuk az alkalmazást, és látogassunk el a következő URL-ekre:

```
http://localhost:8080/
http://localhost:8080/hello/Miki
```

---

Feladatot készítette: **[Szabó Benedek](https://github.com/SzBeni2003)**
Leírást készítette: **[Bácsi Miklós](https://github.com/MiklosBacsi)**
