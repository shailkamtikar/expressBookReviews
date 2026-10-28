const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Promise wrapper around the in-memory book store
const getBooks = () => new Promise((resolve) => resolve(books));

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    if (!isValid(username)) {
        return res.status(409).json({message: "User already exists"});
    }
    users.push({ username, password });
    return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    getBooks()
        .then((allBooks) => {
            const book = allBooks[req.params.isbn];
            if (!book) {
                return res.status(404).json({message: "Book not found"});
            }
            return res.status(200).json(book);
        });
 });

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const allBooks = await getBooks();
    const author = req.params.author.toLowerCase();
    const matches = Object.keys(allBooks)
        .filter((isbn) => allBooks[isbn].author.toLowerCase() === author)
        .map((isbn) => ({ isbn, ...allBooks[isbn] }));
    if (matches.length === 0) {
        return res.status(404).json({message: "No books found for this author"});
    }
    return res.status(200).json({ booksbyauthor: matches });
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const allBooks = await getBooks();
    const title = req.params.title.toLowerCase();
    const matches = Object.keys(allBooks)
        .filter((isbn) => allBooks[isbn].title.toLowerCase() === title)
        .map((isbn) => ({ isbn, ...allBooks[isbn] }));
    if (matches.length === 0) {
        return res.status(404).json({message: "No books found with this title"});
    }
    return res.status(200).json({ booksbytitle: matches });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (!book) {
        return res.status(404).json({message: "Book not found"});
    }
    return res.status(200).json(book.reviews);
});

// ---------------------------------------------------------------------------
// Axios client functions (async/await and Promise callbacks).
// They call the routes above over HTTP and are exposed under /async/...
// ---------------------------------------------------------------------------
const BASE_URL = "http://localhost:5000";

// Get all books using async/await with Axios
const getAllBooksAxios = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
};

// Get book details based on ISBN using a Promise callback with Axios
const getBookByISBNAxios = (isbn) =>
    axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`).then((response) => response.data);

// Get books based on author using async/await with Axios
const getBooksByAuthorAxios = async (author) => {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
};

// Get books based on title using a Promise callback with Axios
const getBooksByTitleAxios = (title) =>
    axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`).then((response) => response.data);

const sendAxiosError = (res, error) => {
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data : { message: error.message };
    return res.status(status).json(message);
};

public_users.get('/async/books', async (req, res) => {
    try {
        return res.status(200).json(await getAllBooksAxios());
    } catch (error) {
        return sendAxiosError(res, error);
    }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    getBookByISBNAxios(req.params.isbn)
        .then((book) => res.status(200).json(book))
        .catch((error) => sendAxiosError(res, error));
});

public_users.get('/async/author/:author', async (req, res) => {
    try {
        return res.status(200).json(await getBooksByAuthorAxios(req.params.author));
    } catch (error) {
        return sendAxiosError(res, error);
    }
});

public_users.get('/async/title/:title', (req, res) => {
    getBooksByTitleAxios(req.params.title)
        .then((books) => res.status(200).json(books))
        .catch((error) => sendAxiosError(res, error));
});

module.exports.general = public_users;
