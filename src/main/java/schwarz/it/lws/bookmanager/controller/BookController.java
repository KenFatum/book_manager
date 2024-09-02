package schwarz.it.lws.bookmanager.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import schwarz.it.lws.bookmanager.model.Book;
import schwarz.it.lws.bookmanager.model.BookStatus;
import schwarz.it.lws.bookmanager.service.BookService;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;

    @GetMapping("/accepted")
    @PreAuthorize("hasAnyRole('user', 'admin')")
    public ResponseEntity<List<Book>> getBooksByStatusAccepted() {
        return ResponseEntity.ok(bookService.findByStatus(BookStatus.ACCEPTED));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<Book>> getBooksByStatusPending() {
        return ResponseEntity.ok(bookService.findByStatus(BookStatus.PENDING));
    }

    @PostMapping("/accepted")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Book> createBookWithStatusAccepted(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.createBookWithStatus(book, BookStatus.ACCEPTED));
    }

    @PostMapping("/pending")
    @PreAuthorize("hasAnyRole('admin', 'user')")
    public ResponseEntity<Book> createBookWithStatusPending(@RequestBody Book book) {
        return ResponseEntity.ok(bookService.createBookWithStatus(book, BookStatus.PENDING));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Book> processBookRequest(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.processBookRequest(id));
    }
}