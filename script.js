const form = document.getElementById("addForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const empty = document.getElementById("empty");
const tally = document.getElementById("tally");
const clearBtn = document.getElementById("clearBtn");
const filterBtns = document.querySelectorAll(".filter");
const bar = document.getElementById("bar");
const progress = document.getElementById("progress");

document.getElementById("date").textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

let tasks = load();
let filter = "all";
let newId = null;
let stampId = null;

function load() {
  try {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const id = Date.now();
  tasks.push({ id, text, done: false });
  newId = id;
  input.value = "";
  save();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  stampId = t.done ? id : null;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function render() {
  list.innerHTML = "";

  const visible = tasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  visible.forEach(t => {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "") + (t.id === newId ? " new" : "");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.setAttribute("aria-label", "Mark as done");
    cb.addEventListener("change", () => toggleTask(t.id));

    const span = document.createElement("span");
    span.textContent = t.text;

    const del = document.createElement("button");
    del.className = "del";
    del.type = "button";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(t.id));

    li.append(cb, span);

    if (t.done) {
      const stamp = document.createElement("span");
      stamp.className = "stamp" + (t.id === stampId ? " slam" : "");
      stamp.style.setProperty("--r", ((t.id % 7) - 10) + "deg");
      stamp.textContent = "DONE";
      li.append(stamp);
    }

    li.append(del);
    list.appendChild(li);
  });

  newId = null;
  stampId = null;

  const done = tasks.filter(t => t.done).length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  bar.style.width = percent + "%";
  progress.setAttribute("aria-valuenow", percent);

  tally.textContent = tasks.length
    ? `${done} of ${tasks.length} stamped`
    : "No tasks yet";
  empty.hidden = visible.length > 0;
  clearBtn.hidden = done === 0;
}

form.addEventListener("submit", addTask);

filterBtns.forEach(btn =>
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle("active", b === btn));
    render();
  })
);

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
});

render();