// Bookshelf App - main.js

/** -------------------- State & Storage -------------------- **/
const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = [];
let editingId = null;

function loadBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    books = raw ? JSON.parse(raw) : [];
  } catch {
    books = [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

/** -------------------- DOM Cache -------------------- **/
const el = {
  bookForm: document.getElementById('bookForm'),
  title: document.getElementById('bookFormTitle'),
  author: document.getElementById('bookFormAuthor'),
  year: document.getElementById('bookFormYear'),
  isComplete: document.getElementById('bookFormIsComplete'),
  submitBtn: document.getElementById('bookFormSubmit'),
  submitSpan: document.getElementById('bookFormSubmit').querySelector('span'),

  searchForm: document.getElementById('searchBook'),
  searchTitle: document.getElementById('searchBookTitle'),

  incompleteList: document.getElementById('incompleteBookList'),
  completeList: document.getElementById('completeBookList'),
};

/** -------------------- Render -------------------- **/
function clearShelves() {
  el.incompleteList.innerHTML = '';
  el.completeList.innerHTML = '';
}

function createBookItem(book) {
  const wrap = document.createElement('div');
  wrap.setAttribute('data-bookid', String(book.id));
  wrap.setAttribute('data-testid', 'bookItem');

  const h3 = document.createElement('h3');
  h3.setAttribute('data-testid', 'bookItemTitle');
  h3.textContent = book.title;

  const pAuthor = document.createElement('p');
  pAuthor.setAttribute('data-testid', 'bookItemAuthor');
  pAuthor.textContent = `Penulis: ${book.author}`;

  const pYear = document.createElement('p');
  pYear.setAttribute('data-testid', 'bookItemYear');
  pYear.textContent = `Tahun: ${book.year}`;

  const btnBox = document.createElement('div');

  const toggleBtn = document.createElement('button');
  toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleBtn.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleBtn.addEventListener('click', () => toggleComplete(book.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.textContent = 'Hapus Buku';
  deleteBtn.addEventListener('click', () => deleteBook(book.id));

  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.textContent = 'Edit Buku';
  editBtn.addEventListener('click', () => startEdit(book.id));

  btnBox.append(toggleBtn, deleteBtn, editBtn);
  wrap.append(h3, pAuthor, pYear, btnBox);
  return wrap;
}

function renderBooks(query = '') {
  clearShelves();
  const q = query.trim().toLowerCase();

  books
    .filter(b => (q ? b.title.toLowerCase().includes(q) : true))
    .forEach(book => {
      const item = createBookItem(book);
      (book.isComplete ? el.completeList : el.incompleteList).appendChild(item);
    });
}

/** -------------------- CRUD Actions -------------------- **/
function addBook({ title, author, year, isComplete }) {
  const newBook = {
    id: Date.now(),
    title,
    author,
    year: Number(year),
    isComplete: Boolean(isComplete),
  };
  books.push(newBook);
  saveBooks();
  renderBooks(el.searchTitle.value);
}

function updateBook(id, payload) {
  const idx = books.findIndex(b => String(b.id) === String(id));
  if (idx === -1) return;

  books[idx] = {
    ...books[idx],
    title: payload.title,
    author: payload.author,
    year: Number(payload.year),
    isComplete: Boolean(payload.isComplete),
  };
  saveBooks();
  renderBooks(el.searchTitle.value);
}

function toggleComplete(id) {
  const idx = books.findIndex(b => String(b.id) === String(id));
  if (idx === -1) return;

  books[idx].isComplete = !books[idx].isComplete;
  saveBooks();
  renderBooks(el.searchTitle.value);
}

function deleteBook(id) {
  books = books.filter(b => String(b.id) !== String(id));
  saveBooks();
  if (editingId === id) resetForm();
  renderBooks(el.searchTitle.value);
}

/** -------------------- Form Helpers -------------------- **/
function updateSubmitSpan() {
  el.submitSpan.textContent = el.isComplete.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

function resetForm() {
  editingId = null;
  el.bookForm.reset();
  el.submitBtn.firstChild.nodeValue = 'Masukkan Buku ke rak ';
  updateSubmitSpan();
}

function startEdit(id) {
  const book = books.find(b => String(b.id) === String(id));
  if (!book) return;

  editingId = book.id;
  el.title.value = book.title;
  el.author.value = book.author;
  el.year.value = book.year;
  el.isComplete.checked = book.isComplete;

  el.submitBtn.firstChild.nodeValue = 'Simpan Perubahan ke rak ';
  updateSubmitSpan();
}

/** -------------------- Events -------------------- **/
document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  updateSubmitSpan();
  renderBooks();

  el.isComplete.addEventListener('change', updateSubmitSpan);

  el.bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      title: el.title.value.trim(),
      author: el.author.value.trim(),
      year: el.year.value,
      isComplete: el.isComplete.checked,
    };
    if (!data.title || !data.author || !data.year) return;

    if (editingId == null) addBook(data);
    else updateBook(editingId, data);

    resetForm();
  });

  el.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    renderBooks(el.searchTitle.value);
  });

  el.searchTitle.addEventListener('input', () => {
    renderBooks(el.searchTitle.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingId != null) resetForm();
  });
});