# Book Review Application

Server-side online bookstore built with Node.js and Express (final project for *Developing Back-End Apps with Node.js and Express*).

## Features

- List all books, and search by ISBN, author or title
- View reviews for a book
- Register and log in (JWT stored in the session)
- Add, modify and delete your own book reviews (logged-in users only)
- Axios-based async functions in `router/general.js` (`/async/...` routes)

## Run

```bash
npm install
npm start
```

The server runs on http://localhost:5000.

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/` | no |
| GET | `/isbn/:isbn` | no |
| GET | `/author/:author` | no |
| GET | `/title/:title` | no |
| GET | `/review/:isbn` | no |
| POST | `/register` | no |
| POST | `/customer/login` | no |
| PUT | `/customer/auth/review/:isbn?review=...` | yes |
| DELETE | `/customer/auth/review/:isbn` | yes |

Saved cURL commands and outputs for the evaluation are in `curl_outputs/`.
