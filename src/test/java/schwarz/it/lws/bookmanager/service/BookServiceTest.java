package schwarz.it.lws.bookmanager.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import schwarz.it.lws.bookmanager.model.Book;
import schwarz.it.lws.bookmanager.model.BookStatus;
import schwarz.it.lws.bookmanager.repository.BookRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class BookServiceTest {
    @Autowired
    BookService bookService;

    @MockBean
    BookRepository bookRepository;

    @Test
    void createBookWithStatus() {
        // Given
        Book book = new Book(1L, "Furkan", "abc", "123", BookStatus.ACCEPTED);

        when(bookRepository.save(book)).thenReturn(book);

        // When
        Book createdBook = bookService.createBookWithStatus(book, BookStatus.ACCEPTED);

        // Then
        assertThat(createdBook.getId()).isEqualTo(1);

    }

    @Test
    void deleteBook() {
        // Given
        Long id = 1L;
        Book book = new Book(id, "Furkan", "abc", "123", BookStatus.ACCEPTED);

        when(bookRepository.findById(id)).thenReturn(Optional.of(book));
        doNothing().when(bookRepository).delete(book);

        // When
        bookService.deleteBook(1L);

        // Then
        verify(bookRepository, times(1)).delete(book);
        verify(bookRepository, times(1)).findById(id);

    }

    @Test
    void updateBook() {
        // Given
        Long id = 1L;
        Book currentBook = new Book(id, "Furkan", "abc", "123", BookStatus.ACCEPTED);
        Book updatedBook = new Book(id, "abc", "abc", "123", BookStatus.ACCEPTED);

        when(bookRepository.findById(id)).thenReturn(Optional.of(currentBook));
        when(bookRepository.save(currentBook)).thenReturn(updatedBook);

        // When
        Book newUpdatedBook = bookService.updateBook(id, updatedBook);

        // Then
        assertThat(newUpdatedBook.getTitle()).isEqualTo("abc");

    }

    @Test
    void findByStatus() {
        // Given
        BookStatus statusAccepted = BookStatus.ACCEPTED;
        Book book1 = new Book(1L, "Furkan", "abc", "123", statusAccepted);
        List<Book> expectedBook = Arrays.asList(book1);

        when(bookRepository.findByStatus(statusAccepted)).thenReturn(expectedBook);

        // When
        List<Book> actualBook = bookService.findByStatus(statusAccepted);

        // Then
        assertThat(actualBook).isEqualTo(expectedBook);
    }

    @Test
    void processBookRequest() {
        // Given
        Long idCurrentBook = 1L;
        Book currentBook = new Book(idCurrentBook, "Furkan", "abc", "123", BookStatus.PENDING);

        when(bookRepository.findById(idCurrentBook)).thenReturn(Optional.of(currentBook));
        when(bookRepository.save(currentBook)).thenReturn(currentBook);

        // When
        Book result = bookService.processBookRequest(idCurrentBook);

        // Then
        assertThat(BookStatus.ACCEPTED).isEqualTo(result.getStatus());
    }
}