---
sidebar_label: '2. Fejezet - Board és Ticket entitás, Board kidolgozása'
sidebar_position: 3
label: '2. Fejezet - Board és Ticket entitás, Board kidolgozása'
---

## 2. Fejezet - Board és Ticket entitás, Board kidolgozása

### Entitások felvétele

Mielőtt kidolgoznánk a táblát, készítsük el a jegyet, ami kitűzhetünk rá. Vegyünk fel egy `ticket` mappát (a `board` mellé), és hozzunk létre egy `TicketEntity` osztályt, amit most csak egy azonosítóval látunk el, illetve a jegy-tábla kapcsolattal.

```kotlin
@Entity
@Table(name = "ticket")
data class TicketEntity(

    @Id
    @GeneratedValue
    @Column(nullable = false)
    val id: Int = 0,

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    var board: BoardEntity = BoardEntity()
)
```

Akkor most hozzunk létre egy `BoardEntity` entitást (a `board` mappában), ami egy táblának a tulajdonságait írja le.

```kotlin
@Entity
@Table(name = "board")
data class BoardEntity(
    @Id
    @GeneratedValue
    @Column(nullable = false)
    val id: Int = 0,

    @Column(nullable = false)
    var title: String = "",

    @Column(nullable = false)
    var createdAt: Date = Date(),

    @OneToMany(mappedBy = "board")
    var tickets: MutableList<TicketEntity> = mutableListOf(),

    ) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is BoardEntity) return false
        if (id != other.id) return false
        return true
    }

    override fun hashCode(): Int = javaClass.hashCode()

    override fun toString(): String {
        return this::class.simpleName + "(id = $id)"
    }
}
```

### BoardRepository hozzáadása

Először bővítsük az `application.properties` nevű fájlt, hogy az jól tudjon működni a H2 adatbázissal.

```kotlin
spring.application.name=ticketing-spring

spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.datasource.url=jdbc:h2:file:./temp/db
spring.jpa.hibernate.ddl-auto=update
```

Hozzunk létre egy `BoardRepository` névvel rendelkező interfészt:

```kotlin
@Repository
interface BoardRepository: CrudRepository<BoardEntity, Int> {
}
```

### További DTOk felvétele

A korábban létrehozott `BoardDtos.kt` fájlban adjuk még hozzá két adatosztályt: BoardDto és DetailedBoardDto.

```kotlin
data class CreateBoardDto(
    val title: String,
)

data class UpdateBoardDto(
    val title: String,
)

data class BoardDto(
    val id: Int,
    val title: String,
    val createdAt: Date,
){
    constructor(board: BoardEntity): this(
        id = board.id,
        title = board.title,
        createdAt = board.createdAt,
    )
}

data class DetailedBoardDto(
    val id: Int,
    val title: String,
    val createdAt: Date,
    val tickets: List<TicketDto>,
){
    constructor(board: BoardEntity): this(
        id = board.id,
        title = board.title,
        createdAt = board.createdAt,
        tickets = board.tickets.map { TicketDto(it) }
    )
}
```

### BoardService kidolgozása

Végre eljött az idő, hogy implementájuk a tábla szolgáltatását.

```kotlin
@Service
class BoardService(private val boardRepository: BoardRepository) {

    fun createBoard(board: CreateBoardDto): DetailedBoardDto {
        return boardRepository.save(BoardEntity(
            title = board.title
        )).let { DetailedBoardDto(it) }
    }

    fun getBoard(id: Int): DetailedBoardDto {
        return boardRepository.findById(id)
            .orElseThrow{ ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found") }
            .let { DetailedBoardDto(it) }
    }

    fun getAllBoards(): List<DetailedBoardDto> {
        return boardRepository.findAll().map { DetailedBoardDto(it) }
    }

    fun updateBoard(id: Int, board: UpdateBoardDto): DetailedBoardDto {
        return boardRepository.findById(id).map {
            val toUpdate = it
            toUpdate.title = board.title
            boardRepository.save(toUpdate)
        }.orElseThrow{ ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found") }
            .let { DetailedBoardDto(it) }
    }

    fun deleteBoard(id: Int) {
        boardRepository.deleteById(id)
    }

}
```

### BoardController kidolgozása

Hasonlóan mint a szolgáltatásnál, itt is most implementáljuk a függvényeket.

```kotlin
@RestController
@RequestMapping("/board")
class BoardController(
    private val boardService: BoardService
) {

    @PostMapping
    fun createBoard(@RequestBody board: CreateBoardDto): ResponseEntity<DetailedBoardDto> {
        val created = boardService.createBoard(board)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }


    @GetMapping
    fun getAllBoards(): ResponseEntity<List<DetailedBoardDto>> {
        val boards = boardService.getAllBoards()
        return ResponseEntity.ok(boards)
    }


    @GetMapping("/{id}")
    fun getBoard(@PathVariable id: Int): ResponseEntity<DetailedBoardDto> {
        val board = boardService.getBoard(id)
        return ResponseEntity.ok(board)
    }


    @PatchMapping("/{id}")
    fun updateBoard(@PathVariable id: Int, @RequestBody board: UpdateBoardDto): ResponseEntity<DetailedBoardDto> {
        val updated = boardService.updateBoard(id, board)
        return ResponseEntity.ok(updated)
    }


    @DeleteMapping("/{id}")
    fun deleteBoard(@PathVariable id: Int): ResponseEntity<Void> {
        boardService.deleteBoard(id)
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

}
```

### TicketEntity részletezése

```kotlin
enum class TicketStatus {
    CREATED,
    IN_PROGRESS,
    UNDER_REVIEW,
    CLOSED,
}


@Entity
@Table(name = "ticket")
data class TicketEntity(
    @Id
    @GeneratedValue
    @Column(nullable = false)
    val id: Int = 0,

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = true)
    var description: String = "",

    @Column(nullable = false)
    var status: TicketStatus = TicketStatus.CREATED,

    @Column(nullable = false)
    val createdAt: Date = Date(),

    @Column(nullable = false)
    var updatedAt: Date = Date(),

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    var board: BoardEntity = BoardEntity(),

) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is TicketEntity) return false
        if (id != other.id) return false
        return true
    }

    override fun hashCode(): Int = javaClass.hashCode()

    override fun toString(): String {
        return this::class.simpleName + "(id = $id)"
    }

    @PreUpdate
    fun onUpdate() {
        updatedAt = Date()
    }
}
```

### Ticket DTOk

A `ticket` mappába vegyük fel az alábbi DTO-kat:

```kotlin
data class CreateTicketDto(
    val name: String,
    val description: String?,
    var boardId: Int,
)

data class UpdateTicketDto(
    val name: String,
    val description: String?,
    var status: TicketStatus,
    var boardId: Int,
)

data class TicketDto(
    val id: Int,
    val name: String,
    val description: String,
    val status: TicketStatus,
    val createdAt: Date,
    val updatedAt: Date,
){
    constructor(ticket: TicketEntity): this(
        id = ticket.id,
        name = ticket.name,
        description = ticket.description,
        status = ticket.status,
        createdAt = ticket.createdAt,
        updatedAt = ticket.updatedAt,
    )
}

data class DetailedTicketDto(
    val id: Int,
    val name: String,
    val description: String,
    val status: TicketStatus,
    val board: BoardDto,
    val createdAt: Date,
    val updatedAt: Date,
){
    constructor(ticket: TicketEntity): this(
        id = ticket.id,
        name = ticket.name,
        description = ticket.description,
        status = ticket.status,
        board = BoardDto(ticket.board),
        createdAt = ticket.createdAt,
        updatedAt = ticket.updatedAt,
    )
}

```

### Eddigi végpontok kipróbálása - 2. fejezet végén

Futtassuk az alkalmazást! Hozzunk létre egy új táblát a POST `/board` végpont segítségével, majd próbáljuk ki a többi végpontot is!

---

Feladatot készítette: **[Szabó Benedek](https://github.com/SzBeni2003)**, Leírást készítette: **[Bácsi Miklós](https://github.com/MiklosBacsi)**
