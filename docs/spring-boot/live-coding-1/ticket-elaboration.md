---
sidebar_label: '3. Fejezet - Ticket kidolgozása'
sidebar_position: 4
label: '3. Fejezet - Ticket kidolgozása'
---

## 3. Fejezet - Ticket kidolgozása

### TicketRepository

```kotlin
@Repository
interface TicketRepository: CrudRepository<TicketEntity, Int> {
}
```

### TicketService

```kotlin
@Service
class TicketService(
    private val ticketRepository: TicketRepository,
    private val boardRepository: BoardRepository
) {

    fun createTicket(ticket: CreateTicketDto): DetailedTicketDto {
        val board = boardRepository.findById(ticket.boardId)
            .orElseThrow{ ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found") }
        return ticketRepository.save(TicketEntity(
            name = ticket.name,
            description = ticket.description?:"",
            board = board,
        )).let { DetailedTicketDto(it) }
    }

    fun getTicket(id: Int): DetailedTicketDto {
        return ticketRepository.findById(id)
            .orElseThrow{ ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found") }
            .let { DetailedTicketDto(it) }
    }

    fun getAllTickets(): List<DetailedTicketDto> {
        return ticketRepository.findAll().map { DetailedTicketDto(it) }
    }

    fun updateTicket(id: Int, ticket: UpdateTicketDto): DetailedTicketDto {
        val board = boardRepository.findById(ticket.boardId)
            .orElseThrow{ ResponseStatusException(HttpStatus.BAD_REQUEST, "Board not found") }

        return ticketRepository.findById(id).map{
            it.name = ticket.name
            it.description = ticket.description?:""
            it.status = ticket.status
            it.board = board
            ticketRepository.save(it)
        }.orElseThrow{ ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found") }
            .let { DetailedTicketDto(it) }
    }

    fun deleteTicket(id: Int) {
        ticketRepository.deleteById(id)
    }

}
```

### TicketController

```kotlin
@RestController
@RequestMapping("/ticket")
class TicketController(
    private val ticketService: TicketService
) {

    @PostMapping
    fun createTicket(@RequestBody ticket: CreateTicketDto): ResponseEntity<DetailedTicketDto> {
        val created = ticketService.createTicket(ticket)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }


    @GetMapping
    fun getAllTickets(): ResponseEntity<List<DetailedTicketDto>> {
        val tickets = ticketService.getAllTickets()
        return ResponseEntity.status(HttpStatus.OK).body(tickets)
    }


    @GetMapping("/{id}")
    fun getTicket(@PathVariable id: Int): ResponseEntity<DetailedTicketDto> {
        val ticket = ticketService.getTicket(id)
        return ResponseEntity.status(HttpStatus.OK).body(ticket)
    }


    @PatchMapping("/{id}")
    fun updateTicket(@PathVariable id: Int, @RequestBody ticket: UpdateTicketDto): ResponseEntity<DetailedTicketDto> {
        val updated = ticketService.updateTicket(id, ticket)
        return ResponseEntity.status(HttpStatus.OK).body(updated)
    }


    @DeleteMapping("/{id}")
    fun deleteTicket(@PathVariable id: Int): ResponseEntity<Void> {
        ticketService.deleteTicket(id)
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build()
    }

}
```

### Eddigi végpontok kipróbálása - 3. fejezet végén

Futtassuk az alkalmazást! Ha van már legalább egy tábla, akkor hozzunk létre a táblához egy új ticketet! Próbáljuk ki a GET `/board/{id}` végpontot is, hogy lássuk a táblában létrehozott jegyet!

---

Feladatot készítette: **[Szabó Benedek](https://github.com/SzBeni2003)**

Leírást készítette: **[Bácsi Miklós](https://github.com/MiklosBacsi)**
