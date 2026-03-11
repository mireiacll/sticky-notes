const addBtn = document.getElementById("addNoteBtn");
const board = document.getElementById("board");

addBtn.addEventListener("click", () => {
    // Create a new note element

    const note = document.createElement("div");
    note.classList.add("note");
    note.innerHTML = '<button class="deleteBtn">X</button><textarea placeholder="Write something..."></textarea>'; 
    note.style.left ="50px";
    note.style.top ="50px";
    board.appendChild(note);

    // Add event listener to the delete button of the new note
    const deleteBtn = note.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", () => {
        note.remove();
        saveNotes(); // Save notes after deletion
    });

    saveNotes(); // Save notes after adding a new note
    makeDraggable(note);
});

function makeDraggable(note) {
    let offsetX, offsetY;  
    note.addEventListener("mousedown", (e) => {
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
        const text = note.querySelector("textarea").value;
        const x =   note.offsetLeft;
        const y =   note.offsetTop;
        notesData.push({ // Store note data in an array
            left: x,
            top: y,
            content: text
        });
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notesData)); // Save notes data to localStorage
}   

function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("stickyNotes"));
    if (!savedNotes) return; // If there are no saved notes, exit the function
    savedNotes.forEach(noteData => {
        const note = document.createElement("div");
        note.classList.add("note");
        note.innerHTML = '<button class="deleteBtn">X</button><textarea placeholder="Write something..."></textarea>';
        note.style.left = noteData.left + "px";
        note.style.top = noteData.top + "px";
        board.appendChild(note);
        const deleteBtn = note.querySelector(".deleteBtn");
        deleteBtn.addEventListener("click", () => {
            note.remove();
            saveNotes(); // Save notes after deletion
        });
        const textArea = note.querySelector("textarea");
        textArea.value = noteData.content; // Set the content of the textarea to the saved content
        textArea.addEventListener("input", saveNotes); // Save notes whenever the content changes
        makeDraggable(note); // Make the note draggable
    });
}

loadNotes();