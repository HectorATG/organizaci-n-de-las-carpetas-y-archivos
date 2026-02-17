function getNotes() {
  return JSON.parse(localStorage.getItem("notes")) || [];
}

function saveToStorage(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Crear nota
function saveNote() {
  const titleInput = document.getElementById("noteTitle");
  const textInput = document.getElementById("noteInput");

  if (!titleInput || !textInput) return;

  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title || !text) {
    showMessage("Título y contenido son obligatorios.");
    return;
  }

  const notes = getNotes();

  notes.push({
    title: title,
    text: text,
    date: new Date().toLocaleString()
  });

  saveToStorage(notes);

  titleInput.value = "";
  textInput.value = "";

  showMessage("Nota guardada correctamente ✅");
}

// Mostrar notas
function displayNotes() {
  const container = document.getElementById("notesContainer");
  if (!container) return;

  const notes = getNotes();
  container.innerHTML = "";

  if (notes.length === 0) {
    container.innerHTML = "<p>No hay notas guardadas.</p>";
    return;
  }

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "note";

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.text}</p>
      <small>${note.date}</small>
      <div class="note-buttons">
        <button onclick="editNote(${index})">Editar</button>
        <button onclick="deleteNote(${index})">Eliminar</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// Eliminar
function deleteNote(index) {
  const notes = getNotes();
  notes.splice(index, 1);
  saveToStorage(notes);
  displayNotes();
  showMessage("Nota eliminada 🗑");
}

// Editar
function editNote(index) {
  const notes = getNotes();
  const container = document.getElementById("notesContainer");
  const noteDiv = container.children[index];

  noteDiv.innerHTML = `
    <input type="text" id="editTitle" value="${notes[index].title}" />
    <textarea id="editText">${notes[index].text}</textarea>
    <div class="note-buttons">
      <button onclick="updateNote(${index})">Guardar</button>
      <button onclick="displayNotes()">Cancelar</button>
    </div>
  `;
}

// Guardar edición
function updateNote(index) {
  const newTitle = document.getElementById("editTitle").value.trim();
  const newText = document.getElementById("editText").value.trim();

  if (!newTitle || !newText) {
    showMessage("No puedes dejar campos vacíos.");
    return;
  }

  const notes = getNotes();

  notes[index].title = newTitle;
  notes[index].text = newText;
  notes[index].date = "Editado: " + new Date().toLocaleString();

  saveToStorage(notes);
  displayNotes();
  showMessage("Nota actualizada ✏");
}

// Notificación
function showMessage(message) {
  const msg = document.createElement("div");
  msg.className = "custom-message";
  msg.innerText = message;

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 300);
  }, 2000);
}

displayNotes();
