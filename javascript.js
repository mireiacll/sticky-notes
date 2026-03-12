const addBtn = document.getElementById("addNoteBtn");
const board = document.getElementById("board");

let typingTimer;
const typingDelay = 1000; // milliseconds

function delayedSave(statusElement) { // Function to delay saving notes while typing
    clearTimeout(typingTimer);

    statusElement.textContent = "Saving..."; // Show saving status while typing
    statusElement.className = "noteStatus saving";
    typingTimer = setTimeout(() => {
        saveNotes();
        statusElement.textContent = "Saved"; // Update status to saved after saving
        statusElement.className = "noteStatus saved";
    }, typingDelay); // Save notes after a delay of 1 second
}

// Function to create a new note with specified position, title, and content
function createNote(x = 50, y = 50, title = "", content = "", color = "#fff475") {

    const note = document.createElement("div");
    note.classList.add("note");
    note.style.backgroundColor = color;

    const status = document.createElement("span");
    status.classList.add("noteStatus");
    status.textContent = "Saved";
    note.appendChild(status);

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.textContent = "X";
    note.appendChild(deleteBtn);

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("highlightContainer");
    const titleHighlight = document.createElement("div");
    titleHighlight.classList.add("highlightLayer");
    titleContainer.appendChild(titleHighlight);
    note.appendChild(titleContainer);

    const titleArea = document.createElement("textarea");
    titleArea.classList.add("noteTitle");
    titleArea.placeholder = "Title...";
    titleContainer.appendChild(titleArea);
    titleArea.addEventListener("scroll", () => {
        titleHighlight.scrollTop = titleArea.scrollTop; // Sync scroll position of the title highlight with the title textarea
    });

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("highlightContainer");
    const contentHighlight = document.createElement("div");
    contentHighlight.classList.add("highlightLayer");
    contentContainer.appendChild(contentHighlight);
    note.appendChild(contentContainer);

    const contentArea = document.createElement("textarea");
    contentArea.classList.add("noteContent");
    contentArea.placeholder = "Write something...";
    contentContainer.appendChild(contentArea);

    contentArea.addEventListener("scroll", () => {
        contentHighlight.scrollTop = contentArea.scrollTop; // Sync scroll position of the content highlight with the content textarea
    });

    // Set the position of the note
    note.style.left = x + "px";
    note.style.top = y + "px";

    board.appendChild(note); // Add the note to the board

    deleteBtn.addEventListener("click", () => { // Add event listener to the delete button
        note.remove();
        saveNotes();
    });

    titleArea.value = title;
    contentArea.value = content;

    titleArea.addEventListener("input", () => delayedSave(status)); // Save notes after typing in the title area
    contentArea.addEventListener("input", () => delayedSave(status)); // Save notes after typing in the content area
    

    makeDraggable(note); // Make the note draggable

    note.addEventListener("dblclick", (e) => {
        openColorMenu(note, e.clientX, e.clientY); // Open color menu on double-click
    });

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
        const color = note.style.backgroundColor || "#fff475"; // Get the background color of the note, default to yellow if not set
        notesData.push({ // Store note data in an array
            left: x,
            top: y,
            content: text,
            title: title,
            color: color
        });
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notesData)); // Save notes data to localStorage
}   

function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("stickyNotes"));
    if (!savedNotes) return; // If there are no saved notes, exit the function
    savedNotes.forEach(noteData => {
        createNote(noteData.left, noteData.top, noteData.title, noteData.content, noteData.color); // Create notes based on saved data
    });
}

const organizeBtn = document.getElementById("organizeBtn");
organizeBtn.addEventListener("click", () => {
    const notes = document.querySelectorAll(".note");

    if (notes.length === 0) return; // If there are no notes, exit the function

    const firstNote = notes[0];
    const noteWidth = firstNote.offsetWidth;
    const noteHeight = firstNote.offsetHeight;
    const gap = 20; // Gap between notes
    const boardWidth = board.offsetWidth;
    let x0 = 50; // Starting x position for the first note
    let y0 = 50; // Starting y position for the first note
    const notesPerRow = Math.max(1, Math.floor((boardWidth - x0) / (noteWidth + gap))); // Calculate how many notes can fit in a row
    notes.forEach((note,index) => {
        const row = Math.floor(index / notesPerRow);
        const col = index % notesPerRow;
        const x = x0 + col * (noteWidth + gap); // Calculate the new x position
        const y = y0 + row * (noteHeight + gap); // Calculate the new y position
        note.style.left = x + "px"; // Set the new x position
        note.style.top = y + "px"; // Set the new y position    
    });
    saveNotes(); // Save notes after organizing
});

function openColorMenu(note, x, y) {
    const existingMenu = document.querySelector(".colorMenu");
    if (existingMenu) {
        existingMenu.remove(); // Remove existing color menu if it exists
    }   

    const menu = document.createElement("div");
    menu.classList.add("colorMenu");

    // close menu button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.classList.add("closeColorMenu");
    closeBtn.addEventListener("click", () => {
        note.classList.remove("editing"); // Remove editing class from the note when closing the color menu
        menu.remove(); // Close the color menu when the close button is clicked
    });
    menu.appendChild(closeBtn);

    menu.style.left = x + "px";
    menu.style.top = y + "px";

    const colors = [
        "#fff475",
        "#f8a199",
        "#ffd145",
        "#ccff90",
        "#a7ffeb",
        "#aecbfa",
        "#d7aefb",
        "#fdcfe8"
    ];
    colors.forEach(color => {
        const btn = document.createElement("div");
        btn.classList.add("colorOption");
        btn.style.backgroundColor = color;
        btn.addEventListener("click", () => {
            note.style.backgroundColor = color;
            const status = note.querySelector(".noteStatus");
            delayedSave(status); // Save notes after changing the color
        });
        menu.appendChild(btn);
    });
    document.body.appendChild(menu);

    document.querySelectorAll(".note").forEach(n => {
        n.classList.remove("editing"); // Remove editing class from all notes
    });
    note.classList.add("editing"); // Add editing class to the current note
}

const searchInput = document.getElementById("SearchInput");
searchInput.addEventListener("input", searchnotes);

function searchnotes() {
    const query = searchInput.value.toLowerCase();
    const notes = document.querySelectorAll(".note");
    notes.forEach(note => {
        const titleArea = note.querySelector(".noteTitle");
        const contentArea = note.querySelector(".noteContent");
        
        updateHighlight(titleArea, query);
        updateHighlight(contentArea, query);
    });
}

function updateHighlight(textarea, query) {
    const container = textarea.parentElement; // Get the parent container of the textarea
    const highlight = container.querySelector(".highlightLayer"); // Get the highlight layer within the container
    highlight.innerHTML = ""; // Clear previous highlights

    if (query === "") return; // If the search query is empty, exit the 
    
    const text = textarea.value
    const textLower = text.toLowerCase();
    let index = 0;

    while (true) {
        const match = textLower.indexOf(query, index);
        if (match === -1) {
            highlight.append(document.createTextNode(text.substring(index))); // Append remaining text without highlights
            break; // If no more matches are found, exit the loop
        }
        highlight.append(
            document.createTextNode(text.substring(index, match)) // Append text before the match without highlights
        );

        const span = document.createElement("span"); // Create a span element to highlight the matched text
        span.textContent = text.slice(match, match + query.length); // Set the text content of the span to the matched text
        highlight.append(span); // Append the highlighted span to the highlight layer

        index = match + query.length;
    }
}

loadNotes();