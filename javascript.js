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
    });

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
        },{once:true});    
    });
}