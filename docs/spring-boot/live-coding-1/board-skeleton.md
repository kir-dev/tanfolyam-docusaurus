---
sidebar_label: '1. Fejezet - Board váz'
sidebar_position: 2
label: '1. Fejezet - Board váz'
---

## 1. Fejezet - Board váz

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

### Új végpontok kipróbálása

Futtassuk az alkalmazást! Az IntelliJ IDE-ben van egy beépített eszköz a REST végpontok kipróbálására, de használhatunk külső eszközt is, például a Postman-t.

![IntelliJ REST Client](../../../static/img/spring/endpoints.png)

---

Feladatot készítette: **[Szabó Benedek](https://github.com/SzBeni2003)**

Leírást készítette: **[Bácsi Miklós](https://github.com/MiklosBacsi)**
