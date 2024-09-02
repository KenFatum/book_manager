// Globale Variablen
let currentUser = null;
let books = [];
let requestBooks = [];
let jwtToken = null;

// DOM-Elemente
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const bookContainer = document.getElementById("bookList");
const bookList = document.getElementById("books");
const bookForm = document.getElementById("bookForm");
const addEditBookForm = document.getElementById("addEditBookForm");

const displayUsername = document.getElementById("displayUsername");

const optionForm = document.getElementById("optionForm");
const editBtn = document.getElementById("editBtn");
const readBtn = document.getElementById("readBtn");
const booksRequestBtn = document.getElementById("booksRequestBtn");
const editRequestBtn = document.getElementById("editRequestBtn");

const searchForm = document.querySelector(".search-container");
const searchButton = document.getElementById("searchButton");

const requestForm = document.getElementById("requestForm");
const requestContainer = document.getElementById("requestContainer");

const editRequestForm = document.getElementById("editRequestForm");
const requestBooksList = document.getElementById("editRequestBooks");

const logoutOptions = {redirectUri: "https://127.0.0.1:8443/index.html"};

loginBtn.onclick = () => keycloak.login();
logoutBtn.onclick = () => keycloak.logout(logoutOptions);
registerBtn.onclick = () => keycloak.register();
addEditBookForm.addEventListener("submit", handleBookSubmit);
searchButton.addEventListener("click", searchBook);
requestContainer.addEventListener("submit", submitBookRequest);

const updateButtons = (authenticated) => {
    loginBtn.style.display = authenticated ? "none" : "inline-block";
    logoutBtn.style.display = authenticated ? "inline-block" : "none";
    registerBtn.style.display = authenticated ? "none" : "inline-block";
};

const keycloak = new Keycloak({
    url: "http://localhost:8081/",
    realm: "bookmanager",
    clientId: "bookmanager",
});

window.onload = function () {
    toggleBookList(false);
    keycloak
        .init({
            onLoad: "check-sso",
            silentCheckSsoRedirectUri:
                window.location.origin + "silent-check-sso.html",
            pkceMethod: "S256",
            checkLoginIframe: false,
        })
        .then(function (authenticated) {
            console.log(authenticated ? "Authenticated" : "Not authenticated");
            updateButtons(authenticated);
            if (authenticated) {
                jwtToken = keycloak.token;
                console.log("JWT Token:" + jwtToken);
                showDashboard();
                fetchBooks();
                toggleBookList(true);
            }
        })
        .catch(function (error) {
            console.log("Failed to initilaice keycloak", error);
        });
};

function toggleBookList(show) {
    bookContainer.style.display = show ? "block" : "none";
}

function showDashboard() {
    if (keycloak.tokenParsed) {
        const userName = keycloak.tokenParsed.preferred_username;
        const roles = keycloak.realmAccess.roles;

        optionForm.style.display = "inline-block";

        console.log("Logged in user: ", userName);
        console.log("User roles: ", roles);

        if (roles.includes("admin")) {
            showAdminDashBoard(userName);
        } else if (roles.includes("user")) {
            showUserDashboard(userName);
        } else {
            console.log("User has no specific role");
        }
    }
}

function showAdminDashBoard(userName) {
    displayUsername.innerHTML = `Welcome, Admin ${userName}`;
    setAdminPermissions();
    fetchBookRequest();
}

function showUserDashboard(userName) {
    displayUsername.innerHTML = `Welcome, ${userName}`;
    setUserPermissions();
}

setInterval(() => {
    keycloak
        .updateToken(70)
        .then((refreshed) => {
            if (refreshed) {
                console.log("Token is refreshed");
            } else {
                console.log("Token is already valid");
            }
        })
        .catch(() => {
            console.error("Failed to refresh Token");
        });
}, 60000);

function setAdminPermissions() {
    editBtn.style.display = "inline";
    readBtn.style.display = "inline";
    booksRequestBtn.style.display = "inline";
    editRequestBtn.style.display = "inline";
    bookForm.style.display = "none";
}

function setUserPermissions() {
    editBtn.style.display = "none";
    readBtn.style.display = "inline";
    booksRequestBtn.style.display = "inline";
    editRequestBtn.style.display = "none";
    bookList.innerHTML = "";
}

editBtn.onclick = () => {
    if (bookForm.style.display === "none" || bookForm.style.display === "") {
        bookForm.style.display = "block";
    } else {
        bookForm.style.display = "none";
    }
};

readBtn.onclick = () => {
    if (searchForm.style.display === "none" || searchForm.style.display === "") {
        searchForm.style.display = "block";
    } else {
        searchForm.style.display = "none";
    }
};

booksRequestBtn.onclick = () => {
    if (requestForm.style.display === "none" || requestForm.style.display === "") {
        requestForm.style.display = "block";
        bookContainer.style.display = "none";
    } else {
        requestForm.style.display = "none";
        bookContainer.style.display = "block";
    }
}

editRequestBtn.onclick = () => {
    if (editRequestForm.style.display === "none" || editRequestForm.style.display === "") {
        editRequestForm.style.display = "block";
        bookContainer.style.display = "none";
    } else {
        editRequestForm.style.display = "none";
        bookContainer.style.display = "block";
    }
}

async function fetchBooks() {
    if (!keycloak.authenticated) {
        console.log("User is not authenticated. Cannot fetch books.");
        return;
    }
    try {
        const response = await fetch("https://localhost:8443/api/books", {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
        const allBooks = await response.json();
        books = allBooks.filter(book => book.status === 'ACCEPTED');
        console.log("Verfügbare Bücher: ", books);
        renderBooks();
        toggleBookList(true);
    } catch (error) {
        console.error("Fehler beim Abrufen der Bücher:", error);
        toggleBookList(false);
    }
}

function searchBook() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    // Bücherliste leeren
    bookList.innerHTML = "";

    let foundBooks = false;

    books.forEach((book) => {
        if (
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        ) {
            // Wenn ein Buch gefunden wurde, zeige es an
            const li = document.createElement("li");
            li.innerHTML = `
           ${book.title} von ${book.author} (ISBN: ${book.isbn})
           <div>
               ${keycloak.hasRealmRole('admin') ? `
                   <button onclick="editBook(${book.id})">Bearbeiten</button>
                   <button onclick="deleteBook(${book.id})">Löschen</button>
               ` : ''}
           </div>
       `;
            bookList.appendChild(li);
            foundBooks = true;
        }
    });

    if (!foundBooks) {
        // Wenn kein Buch gefunden wurde, zeige eine Nachricht an
        bookList.innerHTML = "<li>Kein Buch gefunden.</li>";
    }
}

function renderBooks() {
    bookList.innerHTML = "";
    books.forEach((book) => {
        const li = document.createElement("li");
        li.innerHTML = `
             ${book.title} von ${book.author} (ISBN: ${book.isbn})
             <div>
                 ${
            keycloak.hasRealmRole("admin")
                ? `
                     <button onclick="editBook(${book.id})">Bearbeiten</button>
                     <button onclick="deleteBook(${book.id})">Löschen</button>
                 `
                : ""
        }
             </div>
     `;
        bookList.appendChild(li);
    });
}

async function handleBookSubmit(e) {
    e.preventDefault();
    const bookData = {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        isbn: document.getElementById("isbn").value,
        status: "ACCEPTED",
    };
    const bookId = document.getElementById("bookId").value;

    try {
        if (bookId) {
            await updateBook(bookId, bookData);
        } else {
            await createBook(bookData);
        }
        resetForm();
        fetchBooks();
    } catch (error) {
        console.error("Fehler beim Speichern des Buches:", error);
    }
}

async function createBook(bookData) {
    await fetch("https://localhost:8443/api/books", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(bookData),
    });
}

async function updateBook(id, bookData) {
    await fetch(`https://localhost:8443/api/books/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(bookData),
    });
}

function editBook(id) {
    const book = books.find((b) => b.id === id);
    if (book) {
        document.getElementById("bookId").value = book.id;
        document.getElementById("bookStatus").value = "ACCEPTED";
        document.getElementById("title").value = book.title;
        document.getElementById("author").value = book.author;
        document.getElementById("isbn").value = book.isbn;
    }
}

async function deleteBook(id) {
    if (confirm("Sind Sie sicher, dass Sie dieses Buch löschen möchten?")) {
        try {
            await fetch(`https://localhost:8443/api/books/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            fetchBooks();
        } catch (error) {
            console.error("Fehler beim Löschen des Buches:", error);
        }
    }
}

function resetForm() {
    document.getElementById("bookId").value = "";
    addEditBookForm.reset();
}

// REQUEST BOOKS

async function fetchBookRequest() {
    try {
        const response = await fetch('https://localhost:8443/api/books/requests', {
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        });
        const allBooks = await response.json();
        requestBooks = allBooks.filter(book => book.status === 'PENDING');
        console.log("Die angefragten Bücher: ", requestBooks);
        renderBookRequests();
    } catch (error) {
        console.log('Error fetching book requests:', error);
    }
}

function renderBookRequests() {
    requestBooksList.innerHTML = "";
    requestBooks.forEach(requestBook => {
        const li = document.createElement('li');
        li.innerHTML = `
        ${requestBook.title} by ${requestBook.author} (ISBN: ${requestBook.isbn})
            <div>
                <button onclick="acceptBookRequest(${requestBook.id})">Akzeptieren</button>
                <button onclick="rejectBookRequest(${requestBook.id})">Ablehnen</button>
            </div>
        `;
        requestBooksList.appendChild(li);
    });
}

async function submitBookRequest(e) {
    e.preventDefault();
    const bookData = {
        title: document.getElementById('requestTitle').value,
        author: document.getElementById('requestAuthor').value,
        isbn: document.getElementById('requestIsbn').value,
        status: 'PENDING'
    };

    try {
        await requestBook(bookData);
        resetRequestForm();
        await fetchBookRequest();

    } catch (error) {
        console.log("Fehler beim Speichern des Buches: ", error);
    }
}

async function requestBook(bookData) {

    await fetch('https://localhost:8443/api/books/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(bookData)
    });
    console.log('Sending book data:', JSON.stringify(bookData));
}

async function acceptBookRequest(id) {
    try {
        const response = await fetch(`https://localhost:8443/api/books/request/${id}?action=accept`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${jwtToken}`
            }
        });
        await fetchBookRequest();  // Diese Funktion sollte aktualisiert werden, um beide Listen zu aktualisieren

    } catch (error) {
        console.error('Error accepting book request:', error);
    }
}

async function rejectBookRequest(id) {
    try {
            await fetch(`https://localhost:8443/api/books/request/${id}?action=reject`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${jwtToken}`
            }
        });
        await fetchBookRequest();  // Diese Funktion sollte aktualisiert werden, um beide Listen zu aktualisieren

    } catch (error) {
        console.error('Error rejecting book request:', error);
    }
}

function resetRequestForm() {
    document.getElementById("requestBookId").value = "";
    requestContainer.reset();
}