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
  const pinnedEl = document.getElementById("notePinned");
  const prioEl = document.getElementById("notePriority");
  const colorEl = document.getElementById("noteColor");

  if (!titleInput || !textInput) return;

  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title || !text) {
    showMessage("Título y contenido son obligatorios.");
    return;
  }

  const notes = getNotes();

  notes.push({
    title,
    text,
    date: new Date().toLocaleString(),
    pinned: pinnedEl ? pinnedEl.checked : false,
    priority: prioEl ? prioEl.value : "media",
    color: colorEl ? colorEl.value : "default",
  });

  saveToStorage(notes);

  titleInput.value = "";
  textInput.value = "";
  if (pinnedEl) pinnedEl.checked = false;
  if (prioEl) prioEl.value = "media";
  if (colorEl) colorEl.value = "default";

  displayNotes();
  showMessage("Nota guardada correctamente ✅");
}

// Helpers para badges
function getPriorityLabel(priority) {
  if (priority === "alta") return "⚡ ALTA";
  if (priority === "media") return "⚡ MEDIA";
  return "⚡ BAJA";
}

// Mostrar notas (con búsqueda + orden por fijadas)
function displayNotes() {
  const container = document.getElementById("notesContainer");
  if (!container) return;

  const searchValue = (document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();

  const allNotes = getNotes();

  // Armamos una lista con referencia al índice real para que editar/eliminar funcione
  let view = allNotes.map((note, originalIndex) => ({ note, originalIndex }));

  // Filtro búsqueda
  if (searchValue) {
    view = view.filter(({ note }) => {
      const t = (note.title || "").toLowerCase();
      const x = (note.text || "").toLowerCase();
      return t.includes(searchValue) || x.includes(searchValue);
    });
  }

  // Orden: fijadas primero, luego por fecha (más nuevas arriba opcional)
  view.sort((a, b) => {
    const ap = a.note.pinned ? 1 : 0;
    const bp = b.note.pinned ? 1 : 0;
    if (bp !== ap) return bp - ap;
    return 0;
  });

  container.innerHTML = "";

  if (view.length === 0) {
    container.innerHTML = "<p>No hay notas guardadas.</p>";
    return;
  }

  view.forEach(({ note, originalIndex }) => {
    const div = document.createElement("div");
    div.className = `note ${note.color ? "note-" + note.color : ""}`;

    const pinBadge = note.pinned
      ? `<span class="badge pin">📌 Fijada</span>`
      : "";

    const prioBadge = note.priority
      ? `<span class="badge prio ${note.priority}">${getPriorityLabel(
          note.priority
        )}</span>`
      : "";

    div.innerHTML = `
      <div class="note-header">
        <h3>${note.title}</h3>
        <div class="badges">${pinBadge}${prioBadge}</div>
      </div>
      <p>${note.text}</p>
      <small>${note.date}</small>
      <div class="note-buttons">
        <button onclick="editNote(${originalIndex})">Editar</button>
        <button onclick="deleteNote(${originalIndex})">Eliminar</button>
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
  if (!container) return;

  // Encontrar el div visible que corresponde a ese index
  // (porque podemos estar filtrando/ordenando)
  const card = [...container.querySelectorAll(".note")].find((el) => {
    const btn = el.querySelector(`button[onclick="editNote(${index})"]`);
    return !!btn;
  });

  if (!card) return;

  const note = notes[index];

  card.innerHTML = `
    <input type="text" id="editTitle" value="${note.title}" />
    <textarea id="editText">${note.text}</textarea>

    <div class="edit-options">
      <label class="check">
        <input id="editPinned" type="checkbox" ${note.pinned ? "checked" : ""}/>
        <span>Fijar</span>
      </label>

      <label class="field">
        <span>Prioridad</span>
        <select id="editPriority">
          <option value="baja" ${note.priority === "baja" ? "selected" : ""}>Baja</option>
          <option value="media" ${note.priority === "media" ? "selected" : ""}>Media</option>
          <option value="alta" ${note.priority === "alta" ? "selected" : ""}>Alta</option>
        </select>
      </label>

      <label class="field">
        <span>Color</span>
        <select id="editColor">
          <option value="default" ${note.color === "default" ? "selected" : ""}>Default</option>
          <option value="azul" ${note.color === "azul" ? "selected" : ""}>Azul</option>
          <option value="verde" ${note.color === "verde" ? "selected" : ""}>Verde</option>
          <option value="amarillo" ${note.color === "amarillo" ? "selected" : ""}>Amarillo</option>
          <option value="rojo" ${note.color === "rojo" ? "selected" : ""}>Rojo</option>
          <option value="morado" ${note.color === "morado" ? "selected" : ""}>Morado</option>
        </select>
      </label>
    </div>

    <div class="note-buttons">
      <button onclick="updateNote(${index})">Guardar</button>
      <button onclick="displayNotes()">Cancelar</button>
    </div>
  `;
}

// Guardar edición
function updateNote(index) {
  const newTitle = document.getElementById("editTitle")?.value.trim();
  const newText = document.getElementById("editText")?.value.trim();

  if (!newTitle || !newText) {
    showMessage("No puedes dejar campos vacíos.");
    return;
  }

  const pinned = document.getElementById("editPinned")?.checked || false;
  const priority = document.getElementById("editPriority")?.value || "media";
  const color = document.getElementById("editColor")?.value || "default";

  const notes = getNotes();

  notes[index].title = newTitle;
  notes[index].text = newText;
  notes[index].pinned = pinned;
  notes[index].priority = priority;
  notes[index].color = color;
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