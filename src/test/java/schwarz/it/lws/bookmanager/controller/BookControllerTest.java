package schwarz.it.lws.bookmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import schwarz.it.lws.bookmanager.model.Book;
import schwarz.it.lws.bookmanager.model.BookStatus;
import schwarz.it.lws.bookmanager.service.BookService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookController.class)
class BookControllerTest {
    @MockBean
    BookService bookService;

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;


    @Test
    @WithMockUser(username = "azubi001", roles = {"admin"})
    void getBooksByStatusAccepted() throws Exception {
        // Given
        when(bookService.findByStatus(BookStatus.ACCEPTED)).thenReturn(
                List.of(
                        new Book(),
                        new Book(),
                        new Book()
                )
        );

        // When / Then
        mvc.perform(get("/api/books/accepted"))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.size()").value(3));


    }

    @Test
        //@WithMockUser(username = "owner", roles = {"admin"})
    void createBookWithStatusAccepted() throws Exception {
        // Given
        Book book = new Book();


        // When / Then
        mvc.perform(post("/api/books/accepted")
                .with(user("owner").roles("admin", "user", "manager"))
        ).andExpect(status().is2xxSuccessful());


    }

    @Test
    void deleteBook() {
        // Given


        // When


        // Then


    }
}