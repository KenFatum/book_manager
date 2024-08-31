package schwarz.it.lws.bookmanager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import schwarz.it.lws.bookmanager.model.Book;
import org.springframework.security.access.prepost.PreAuthorize;
import schwarz.it.lws.bookmanager.repository.BookRepository;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('user', 'admin')")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public Book createBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('user', 'admin')")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(bookDetails.getTitle());
                    book.setAuthor(bookDetails.getAuthor());
                    book.setIsbn(bookDetails.getIsbn());
                    return ResponseEntity.ok(bookRepository.save(book));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(book -> {
                    bookRepository.delete(book);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    //REQUEST

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('user', 'admin')")
    public Book requestBook(@RequestBody Book book) {
        book.setStatus(Book.BookStatus.REQUESTED);
        return bookRepository.save(book);
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('admin')")
    public List<Book> getBookRequests() {
        return bookRepository.findByStatus(Book.BookStatus.REQUESTED);
    }

    @PutMapping("/request/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Book> processBookRequest(@PathVariable Long id, @RequestParam String action) {
        return bookRepository.findById(id)
                .map(book -> {
                    if ("accept".equals(action)) {
                        book.setStatus(Book.BookStatus.ACCEPTED);
                    } else if ("reject".equals(action)) {
                        book.setStatus(Book.BookStatus.REJECTED);
                    }
                    return ResponseEntity.ok(bookRepository.save(book));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}