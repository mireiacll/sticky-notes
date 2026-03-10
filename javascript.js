const addBtn = document.getElementById("addNoteBtn");
const board = document.getElementById("board");

addBtn.addEventListener("click", () => {
    // Create a new note element

    const note = document.createElement("div");
    note.classList.add("note");
    note.innerHTML = '<button class="deleteBtn">X</button><textarea placeholder="Write something..."></textarea>'; 
    board.appendChild(note);

    // Add event listener to the delete button of the new note
    const deleteBtn = note.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", () => {
        note.remove();
    });
});