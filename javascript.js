const addBtn = document.getElementById("addNoteBtn");
const board = document.getElementById("board");

// Function to create a new note with specified position, title, and content
function createNote(x = 50, y = 50, title = "", content = "") {

    const note = document.createElement("div");
    note.classList.add("note");

    // Set the inner HTML of the note with a delete button, title textarea, and content textarea
    note.innerHTML = `
        <button class="deleteBtn">X</button>
        <textarea class="noteTitle" placeholder="Title..."></textarea>
        <textarea class="noteContent" placeholder="Write something..."></textarea>
    `; 

    // Set the position of the note
    note.style.left = x + "px";
    note.style.top = y + "px";

    board.appendChild(note); // Add the note to the board

    const deleteBtn = note.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", () => { // Add event listener to the delete button
        note.remove();
        saveNotes();
    });

    const titleArea = note.querySelector(".noteTitle"); 
    const contentArea = note.querySelector(".noteContent");

    titleArea.value = title;
    contentArea.value = content;

    titleArea.addEventListener("input", saveNotes);
    contentArea.addEventListener("input", saveNotes);

    makeDraggable(note); // Make the note draggable

    return note;
}

addBtn.addEventListener("click", () => {
    createNote(); // Create a new note at the default position with empty title and content
    saveNotes(); // Save notes after adding a new note
});

function makeDraggable(note) {
    let offsetX, offsetY;  
    note.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "TEXTAREA" || e.target.classList.contains("deleteBtn")) return; // Prevent dragging when clicking on textarea or delete button
        offsetX = e.clientX - note.offsetLeft;
        offsetY = e.clientY - note.offsetTop;
        function moveNote(e) {
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            const maxX = board.offsetWidth - note.offsetWidth;
            const maxY = board.offsetHeight - note.offsetHeight;

            if (x >= 0 && x <= maxX) {
                note.style.left = x + "px";
            }

            if (y >= 0 && y <= maxY) {
                note.style.top = y + "px";
            }
        }
        document.addEventListener("mousemove", moveNote);
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", moveNote);
            saveNotes(); // Save notes after dragging
        },{once:true});    
    });
}

function saveNotes() {
    const notes = document.querySelectorAll(".note"); // Select all notes
    const notesData = [];
    notes.forEach(note => {
        const title = note.querySelector(".noteTitle").value;
        const text = note.querySelector(".noteContent").value;
        const x =   note.offsetLeft;
        const y =   note.offsetTop;
        notesData.push({ // Store note data in an array
            left: x,
            top: y,
            content: text,
            title: title
        });
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notesData)); // Save notes data to localStorage
}   

function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("stickyNotes"));
    if (!savedNotes) return; // If there are no saved notes, exit the function
    savedNotes.forEach(noteData => {
        createNote(noteData.left, noteData.top, noteData.title, noteData.content); // Create notes based on saved data
    });
}

loadNotes();