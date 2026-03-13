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

    // ── Match navigator (no wrapper div — uses span+buttons
    //    so they don't interfere with div:last-of-type) ────
    const matchPrev = document.createElement("button");
    matchPrev.classList.add("matchNavBtn", "matchPrevBtn");
    matchPrev.textContent = "▲";
    matchPrev.title = "Previous match";
    matchPrev.style.display = "none";
    note.appendChild(matchPrev);
 
    const matchCount = document.createElement("span");
    matchCount.classList.add("matchNavCount");
    matchCount.style.display = "none";
    note.appendChild(matchCount);
 
    const matchNext = document.createElement("button");
    matchNext.classList.add("matchNavBtn", "matchNextBtn");
    matchNext.textContent = "▼";
    matchNext.title = "Next match";
    matchNext.style.display = "none";
    note.appendChild(matchNext);
 
    note._matchState = { matches: [], idx: 0 };
 
    matchPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateMatch(note, -1);
    });
    matchNext.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateMatch(note, 1);
    });

    // Title container
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("highlightContainer");

    const titleHighlight = document.createElement("div");
    titleHighlight.classList.add("highlightLayer");
    titleContainer.appendChild(titleHighlight);

    const titleArea = document.createElement("textarea");
    titleArea.classList.add("noteTitle");
    titleArea.placeholder = "Title...";
    titleContainer.appendChild(titleArea);

    note.appendChild(titleContainer);

    titleArea.addEventListener("scroll", () => {
        titleHighlight.style.transform =`translateY(-${titleArea.scrollTop}px)`; // Sync scroll position of the title highlight with the title textarea
    });
    
    // Content container
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("highlightContainer");

    const contentHighlight = document.createElement("div");
    contentHighlight.classList.add("highlightLayer");
    contentContainer.appendChild(contentHighlight);

    const contentArea = document.createElement("textarea");
    contentArea.classList.add("noteContent");
    contentArea.placeholder = "Write something...";
    contentContainer.appendChild(contentArea);
    
    note.appendChild(contentContainer);

    contentArea.addEventListener("scroll", () => {
        contentHighlight.style.transform = `translateY(-${contentArea.scrollTop}px)`; // Sync scroll position of the content highlight with the content textarea
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

    titleArea.addEventListener("input", () => {
        delayedSave(status); // Save notes after typing in the title area
        const q = searchInput.value.toLowerCase(); 
        updateHighlight(titleArea, q); // Update highlights in the title area while typing
        adjustScrollbarPadding(titleArea); // Adjust padding for scrollbar in the title area
        updateNoteMatches(note, q);
    });
    contentArea.addEventListener("input", () => {
        delayedSave(status); // Save notes after typing in the content area
        const q = searchInput.value.toLowerCase();
        updateHighlight(contentArea, q); // Update highlights in the content area while typing
        adjustScrollbarPadding(contentArea); // Adjust padding for scrollbar in the content area
        updateNoteMatches(note, q);
    });

    // Apply scrollbar padding after the note is in the DOM
    // Use setTimeout so the browser has laid out the elements before we measure
    setTimeout(() => {
        adjustScrollbarPadding(titleArea);
        adjustScrollbarPadding(contentArea);
        // Re-run highlights in case the note was loaded with a query active
        const query = searchInput.value.toLowerCase();
        if (query) {
            updateHighlight(titleArea, query);
            updateHighlight(contentArea, query);
            updateNoteMatches(note, query);
        }
    }, 0);

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


// Organize notes -----------------------------------------------------------------
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


// Color menu -----------------------------------------------------------------
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

// Search and highlight ----------------------------------------------------------------
function searchnotes() {
    const query = searchInput.value.toLowerCase();
    const notes = document.querySelectorAll(".note");
    notes.forEach(note => {
        const titleArea = note.querySelector(".noteTitle");
        const contentArea = note.querySelector(".noteContent");
        
        updateHighlight(titleArea, query);
        updateHighlight(contentArea, query);
        updateNoteMatches(note,query);
    });
}

function updateHighlight(textarea, query) {
    const container = textarea.parentElement; // Get the parent container of the textarea
    const highlight = container.querySelector(".highlightLayer"); // Get the highlight layer within the container
    highlight.innerHTML = ""; // Clear previous highlights

    if (query === "") return; // If the search query is empty, exit the 
    
    const rawText = textarea.value
    const rawTextLower = rawText.toLowerCase();
    let index = 0;

    while (true) {
        const match = rawTextLower.indexOf(query, index);
        if (match === -1) {
            highlight.append(document.createTextNode(rawText.substring(index))); // Append remaining text without highlights
            break; // If no more matches are found, exit the loop
        }
        highlight.append(
            document.createTextNode(rawText.substring(index, match)) // Append text before the match without highlights
        );

        const span = document.createElement("span"); // Create a span element to highlight the matched text
        span.textContent = rawText.slice(match, match + query.length); // Set the text content of the span to the matched text
        highlight.append(span); // Append the highlighted span to the highlight layer

        index = match + query.length;
    }
}

// Scrollbar padding adjustment ----------------------------------------------------------------
function adjustScrollbarPadding(textarea) { // Function to adjust padding when scrollbar appears or disappears
    const container = textarea.parentElement;
    const highlight = container.querySelector(".highlightLayer");
 
    const hasScrollbar = textarea.scrollHeight > textarea.clientHeight;
    const pad = hasScrollbar ? "15px" : "0px";
 
    highlight.style.paddingRight = pad;
}

// Match navigation ----------------------------------------------------------------
function getMatchPositions(rawText, query) { // Function to get the positions of all matches of the query in the text
    const lower = rawText.toLowerCase();
    const positions = [];
    let index = 0;
    while (true) {
        const match = lower.indexOf(query, index);
        if (match === -1) break;
        positions.push(match);
        index = match + query.length;
    }
    return positions;
}

function scrollToMatch(note, idx) {
    const { matches } = note._matchState;
    if (!matches.length) return;
    const { textarea, charIndex } = matches[idx];
 
    // Use mirror to find pixel position of match
    const cs = window.getComputedStyle(textarea);
    const mirror = document.createElement("div");
    ["font-family","font-size","font-weight","line-height","letter-spacing",
     "word-spacing","padding-top","padding-right","padding-bottom","padding-left"
    ].forEach(p => { mirror.style[p] = cs[p]; });
    mirror.style.position    = "absolute";
    mirror.style.visibility  = "hidden";
    mirror.style.top         = "-9999px";
    mirror.style.left        = "-9999px";
    mirror.style.width       = textarea.clientWidth + "px";
    mirror.style.height      = "auto";
    mirror.style.whiteSpace  = "pre-wrap";
    mirror.style.wordWrap    = "break-word";
    mirror.style.boxSizing   = "border-box";
    mirror.style.overflowWrap = "break-word";
    mirror.textContent = textarea.value.substring(0, charIndex);
    document.body.appendChild(mirror);
    const matchTop = mirror.scrollHeight;
    document.body.removeChild(mirror);
 
    const maxScroll = textarea.scrollHeight - textarea.clientHeight;
    const scrollTop = Math.min(Math.max(0, matchTop - textarea.clientHeight / 2), maxScroll);
 
    textarea.scrollTop = scrollTop;
    // Dispatch scroll event so the existing listener syncs the highlight
    // using the real clamped textarea.scrollTop — no manual transform needed
    textarea.dispatchEvent(new Event("scroll"));
}

function updateNoteMatches(note, query) {
    if (!note || typeof note.querySelector !== "function") return; 
    if (!note._matchState) note._matchState = { matches: [], idx: 0 };
 
    const titleArea   = note.querySelector(".noteTitle");
    const contentArea = note.querySelector(".noteContent");
    const matchPrev   = note.querySelector(".matchPrevBtn");
    const matchNext   = note.querySelector(".matchNextBtn");
    const matchCount  = note.querySelector(".matchNavCount");
 
    if (!matchPrev || !matchNext || !matchCount) return; 
 
    const matches = [];
    if (query) {
        getMatchPositions(titleArea.value,   query).forEach(pos => matches.push({ textarea: titleArea,   charIndex: pos }));
        getMatchPositions(contentArea.value, query).forEach(pos => matches.push({ textarea: contentArea, charIndex: pos }));
    }
 
    note._matchState.matches = matches;
    note._matchState.idx = 0;
 
    if (matches.length === 0) {
        matchPrev.style.display  = "none";
        matchCount.style.display = "none";
        matchNext.style.display  = "none";
        return;
    }
 
    const showArrows = matches.length > 1 ? "inline-block" : "none";
    matchPrev.style.display  = showArrows;
    matchNext.style.display  = showArrows;
    matchCount.style.display = "inline";
    matchCount.textContent   = `${1} / ${matches.length}`;
 
    scrollToMatch(note, 0);
}

function navigateMatch(note,dir){
    const state = note._matchState;
    if (!state.matches.length) return; // If there are no matches, exit the function
    state.idx = (state.idx + dir + state.matches.length) % state.matches.length; // Update the current match index based on the navigation direction
    const matchCount = note.querySelector(".matchNavCount");
    matchCount.textContent = `${state.idx + 1} / ${state.matches.length}`; // Update the match count display
    scrollToMatch(note,state.idx); // Scroll to the current match
}

loadNotes();