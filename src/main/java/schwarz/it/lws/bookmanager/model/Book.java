package schwarz.it.lws.bookmanager.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "book")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;
    private String isbn;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookStatus status;

    public enum BookStatus {
        AVAILABLE, REQUESTED, ACCEPTED, REJECTED
    }
}