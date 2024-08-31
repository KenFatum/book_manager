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
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String description;
    private String requestedBy;

    @Enumerated(EnumType.STRING)
    private BookStatus status;

    public enum BookStatus {
        AVAILABLE, REQUESTED, ACCEPTED, REJECTED
    }
}