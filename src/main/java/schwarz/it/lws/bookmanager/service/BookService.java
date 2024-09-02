package schwarz.it.lws.bookmanager.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import schwarz.it.lws.bookmanager.model.Book;
import schwarz.it.lws.bookmanager.model.BookStatus;
import schwarz.it.lws.bookmanager.repository.BookRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public Book processBookRequest(Long id) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setStatus(BookStatus.ACCEPTED);
                    return bookRepository.save(book);
                })
                .orElseThrow(() -> new EntityNotFoundException("Book with id " + id + " not found"));
    }

    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Book with id " + id + " not found"));
        bookRepository.delete(book);
    }

    public Book updateBook(Long id, Book book) {
        return bookRepository.findById(id)
                .map(currentBook -> {
                    currentBook.setTitle(book.getTitle());
                    currentBook.setAuthor(book.getAuthor());
                    currentBook.setIsbn(book.getIsbn());
                    currentBook.setStatus(book.getStatus());
                    return bookRepository.save(currentBook);
                })
                .orElseThrow(() -> new EntityNotFoundException("Book with id " + id + " not found"));
    }

    public Book createBookWithStatus(Book book, BookStatus bookStatus) {
        book.setStatus(bookStatus);
        return bookRepository.save(book);
    }

    public List<Book> findByStatus(BookStatus bookStatus) {
        return bookRepository.findByStatus(bookStatus);
    }
}
