"use strict";

const newBookModal = document.querySelector("#new-book-modal");
const newBookForm = document.getElementById("new-book-form");
const openNewBookModalBtn = document.getElementById("open-new-book-modal-btn");
const closeNewBookModalBtn = document.getElementById(
  "close-new-book-modal-btn"
);
const table = document.querySelector(".library");

const booksListEl = document.querySelector(".books__list");

const myLibrary = [];

/**
 * constructor for making book objects
 *
 * @param {string} title  - The book's title
 * @param {string} author -  The bbok's author
 * @param {number} pages  - The number of pages
 * @param {boolean} read  - Show if the book have been read or not
 */
function Book(title, author, pages, read) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;

  this.info = () => {
    return `${this.title} by ${this.author}, ${this.pages} pages, ${
      this.read ? "read" : "not read yet"
    }`;
  };

  this.toggleReadStatus = () => {
    this.read = !this.read;
  };
}

/**
 * remove a book from the book library
 *
 * @param {number} index - book index in library
 */
function deleteBook(index) {
  myLibrary.splice(index, 1);
  renderBooks();
}

/**
 * toggle read status of book
 *
 * @param {number} index - book index in library
 */
function toggleReadStatus(index) {
  const book = myLibrary[index];

  book.toggleReadStatus();
  renderBooks();
}

/**
 *
 * @param {string} type
 * @param {string} content
 * @returns {HTMLElement}
 */
function createNewElement(type, content = null) {
  const element = document.createElement(type);

  if (content) {
    element.textContent = content;
  }

  return element;
}

/**
 *
 * @param {Book} book
 * @param {number} index
 *
 * @returns {HTMLTableRowElement}
 */
function createRow(book, index) {
  const row = createNewElement("tr");
  const serialNo = createNewElement("td", index + 1);
  const title = createNewElement("td", book.title);
  const author = createNewElement("td", book.author);

  const pages = createNewElement("td", book.pages);

  const status = createNewElement("td", book.read ? "yes" : "not yet");

  const controls = createNewElement("td");

  const toggleReadBtn = createNewElement("button", "toggle status");

  const deleteBtn = createNewElement("button", "delete");

  toggleReadBtn.addEventListener("click", () => toggleReadStatus(index));

  deleteBtn.addEventListener("click", () => deleteBook(index));

  controls.append(toggleReadBtn, deleteBtn);

  row.append(serialNo, title, author, pages, status, controls);

  return row;
}

// display the book library in the dom
function renderBooks() {
  if (myLibrary.length === 0) {
    table.dataset.empty = true;
    return;
  }

  if (table.dataset.empty) {
    table.dataset.empty = false;
  }

  booksListEl.innerHTML = null;
  myLibrary.forEach((book, index) => {
    const row = createRow(book, index);
    booksListEl.appendChild(row);
  });
}

function closeNewBookModal() {
  newBookModal.close();
}

/**
 *
 * @param {FormDataEvent} event
 */
function addBookToLibrary(event) {
  event.preventDefault();

  const formData = new FormData(newBookForm);

  const title = formData.get("title");
  const author = formData.get("author");
  const pages = formData.get("pages");
  const read = formData.get("read");

  const newBook = new Book(title, author, +pages, !!read);

  myLibrary.push(newBook);
  renderBooks();
  this.reset();
  closeNewBookModal();
}
// const theHorbit = new Book("The Hobbit", "J.R.R. Tolkien", 295, false);

openNewBookModalBtn.addEventListener("click", () => {
  newBookModal.showModal();
});

closeNewBookModalBtn.addEventListener("click", closeNewBookModal);

newBookForm.addEventListener("submit", addBookToLibrary);
