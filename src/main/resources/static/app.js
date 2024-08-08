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

loginBtn.onclick= ()=> keycloak.login();
logoutBtn.onclick= ()=> keycloak.logout();

const updateButtons = (authenticated)=> {
    loginBtn.style.display = authenticated ? 'none' : 'inline-block';
    logoutBtn.style.display = authenticated ? 'inline-block' : 'none';
}

const keycloak = new Keycloak({
    url: 'http://localhost:8081/',
    realm: 'bookmanager',
    clientId: 'bookmanager'
});

window.onload=function() {
    keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + 'silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false
    }).then(function (authenticated) {
        console.log(authenticated ? 'Authenticated' : 'Not authenticated');
        // updateButtons(authenticated)
        if(authenticated) {
            fetchBooks();
        } 
    }).catch(function(error) {
        console.log('Failed to initilaice keycloak', error);
    })
}



setInterval(()=> {
    keycloak.updateToken(70).then((refreshed)=> {
        if(refreshed) {
            console.log('Token is refreshed');
        } else {
            console.log('Token is already valid');
        }
    }).catch (()=> {
        console.error('Failed to refresh Token');
    }) 
}, 60000);


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
