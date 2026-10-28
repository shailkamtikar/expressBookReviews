const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// A username is valid (available for registration) if nobody has it yet
const isValid = (username)=>{ //returns boolean
    return !users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({message: "Invalid login. Check username and password"});
    }
    const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({message: "User successfully logged in"});
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || (req.body && req.body.review);
    const username = req.session.authorization.username;
    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }
    if (!review) {
        return res.status(400).json({message: "Review text is required"});
    }
    const existed = books[isbn].reviews[username] !== undefined;
    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: existed
            ? `Review for book ${isbn} updated successfully`
            : `Review for book ${isbn} added successfully`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review (only the logged-in user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }
    if (books[isbn].reviews[username] === undefined) {
        return res.status(404).json({message: "No review by this user for this book"});
    }
    delete books[isbn].reviews[username];
    return res.status(200).json({message: `Review for book ${isbn} deleted successfully`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
