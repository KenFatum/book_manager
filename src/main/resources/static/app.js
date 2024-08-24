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

const displayUsername = document.getElementById('displayUsername');

const optionForm = document.getElementById('optionForm');
const editBtn = document.getElementById('editBtn');
const readBtn = document.getElementById('readBtn');
const orderListBtn = document.getElementById('orderListBtn');
const booksRequestBtn = document.getElementById('booksRequestBtn');
const editRequestBtn = document.getElementById('editRequestBtn');

const logoutOptions = { redirectUri: "http://127.0.0.1:5500/index.html" }

loginBtn.onclick= ()=> keycloak.login();
logoutBtn.onclick= ()=> keycloak.logout(logoutOptions);
registerBtn.onclick= ()=> keycloak.register();

const updateButtons = (authenticated)=> {
    loginBtn.style.display = authenticated ? 'none' : 'inline-block';
    logoutBtn.style.display = authenticated ? 'inline-block' : 'none';
    registerBtn.style.display = authenticated ? 'none' : 'inline-block';
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
        jwtToken = keycloak.token;
        //console.log('JWT Token:' + jwtToken);
        updateButtons(authenticated);
        if(authenticated) {
            fetchBooks();
            showDashboard();
        } 
    }).catch(function(error) {
        console.log('Failed to initilaice keycloak', error);
    })
}

function showDashboard() {
    if (keycloak.tokenParsed) {
        const userName = keycloak.tokenParsed.preferred_username;
        const roles = keycloak.realmAccess.roles;

        optionForm.style.display = 'inline-block';

        console.log('Logged in user: ', userName);
        console.log('User roles: ', roles);

        if (roles.includes('bm_admin')) {
            showAdminDashBoard(userName);
        } else if (roles.includes('bm_user')) {
            showUserDashboard(userName);
        } else {
            console.log('Hello World!');
        }
    }
}

function showAdminDashBoard(userName) {
    displayUsername.innerHTML = `Welcome, Admin ${userName}`;
    optionsForAdmin();
}

function showUserDashboard(userName) {
    displayUsername.innerHTML = `Welcome, ${userName}`;
    optionsForUser();
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


function optionsForAdmin() {
    editBtn.style.display = 'inline';
    readBtn.style.display = 'inline';
    orderListBtn.style.display = 'inline';
    booksRequestBtn.style.display = 'inline';
    editRequestBtn.style.display = 'inline';
    bookForm.style.display = 'none';

}

editBtn.onclick = () => {
    if (bookForm.style.display === 'none' || bookForm.style.display === '') {
        bookForm.style.display = 'block';
    } else {
        bookForm.style.display = 'none';
    }
}

function optionsForUser() {
    editBtn.style.display = 'none';
    readBtn.style.display = 'inline';
    orderListBtn.style.display = 'none';
    booksRequestBtn.style.display = 'inline';
    editRequestBtn.style.display = 'none';
    bookList.innerHTML = '';
}

async function fetchBooks() {
    try {
        const response = await fetch('http://localhost:8080/api/books', {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        books = await response.json();
        renderBooks();
    } catch (error) {
        console.error('Fehler beim Abrufen der Bücher:', error);
        console.log(books);
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
    await fetch('http://localhost:8080/api/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(bookData)
    });
}

async function updateBook(id, bookData) {
    await fetch(`http://localhost:8080/api/books/${id}`, {
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
            await fetch(`http://localhost:8080/api/books/${id}`, {
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
