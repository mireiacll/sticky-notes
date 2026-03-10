const addBtn = document.getElementById("addNoteBtn");
const board = document.getElementById("board");

addBtn.addEventListener("click", () => {
    const note = document.createElement("div");
    note.classList.add("note");
    note.innerHTML = '<textarea placeholder="Write something..."></textarea>';
    board.appendChild(note);
});