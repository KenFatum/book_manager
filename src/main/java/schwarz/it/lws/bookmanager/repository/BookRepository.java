package schwarz.it.lws.bookmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import schwarz.it.lws.bookmanager.model.Book;
import schwarz.it.lws.bookmanager.model.BookStatus;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStatus(BookStatus status);
}