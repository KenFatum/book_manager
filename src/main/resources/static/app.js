// Globale Variablen
let currentUser = null;
let books = [];
let jwtToken = null;

// DOM-Elemente
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const bookList = document.getElementById('books');
const bookForm = document.getElementById('bookForm');
const addEditBookForm = document.getElementById('addEditBookForm');

// Event Listener
loginBtn.addEventListener('click', () => window.location.href = '/oauth2/authorization/keycloak');
registerBtn.addEventListener('click', () => window.location.href = 'http://localhost:8081/realms/bookmanager/protocol/openid-connect/registrations?client_id=bookmanager&response_type=code&scope=openid&redirect_uri=http://localhost:8080/');
logoutBtn.addEventListener('click', logout);
addEditBookForm.addEventListener('submit', handleBookSubmit);

// Initialisierung
checkLoginStatus();

// Funktionen
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        if (response.ok) {
            currentUser = await response.text();
            // Extrahiere das JWT-Token aus der Antwort
            const authHeader = response.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                jwtToken = authHeader.substring(7);
            }
            updateUIForLoggedInUser();
            fetchBooks();
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Fehler beim Prüfen des Login-Status:', error);
    }
}

function updateUIForLoggedInUser() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
    bookForm.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline';
    registerBtn.style.display = 'inline';
    logoutBtn.style.display = 'none';
    bookForm.style.display = 'none';
    bookList.innerHTML = '';
}

async function logout() {
    try {
        await fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        jwtToken = null;
        currentUser = null;
        updateUIForLoggedOutUser();
    } catch (error) {
        console.error('Fehler beim Abmelden:', error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/books', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        books = await response.json();
        renderBooks();
    } catch (error) {
        console.error('Fehler beim Abrufen der Bücher:', error);
    }
}

function renderBooks() {
    bookList.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${book.title} von ${book.author} (ISBN: ${book.isbn})
            <div>
                <button onclick="editBook(${book.id})">Bearbeiten</button>
                <button onclick="deleteBook(${book.id})">Löschen</button>
            </div>
        `;
        bookList.appendChild(li);
    });
}

async function handleBookSubmit(e) {
    e.preventDefault();
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value
    };
    const bookId = document.getElementById('bookId').value;

    try {
        if (bookId) {
            await updateBook(bookId, bookData);
        } else {
            await createBook(bookData);
        }
        resetForm();
        fetchBooks();
    } catch (error) {
        console.error('Fehler beim Speichern des Buches:', error);
    }
}

async function createBook(bookData) {
    await fetch('/api/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(bookData)
    });
}

async function updateBook(id, bookData) {
    await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(bookData)
    });
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        document.getElementById('bookId').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
    }
}

async function deleteBook(id) {
    if (confirm('Sind Sie sicher, dass Sie dieses Buch löschen möchten?')) {
        try {
            await fetch(`/api/books/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            fetchBooks();
        } catch (error) {
            console.error('Fehler beim Löschen des Buches:', error);
        }
    }
}

function resetForm() {
    document.getElementById('bookId').value = '';
    addEditBookForm.reset();
}
