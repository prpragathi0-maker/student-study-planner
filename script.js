
const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const subjectInput = document.getElementById("subject");
const timeInput = document.getElementById("task-time");
const taskList = document.getElementById("task-list");

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem("bloomTasks"));
  tasks = Array.isArray(saved) ? saved : [];
} catch {
  tasks = [];
}

document.getElementById("today").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

function saveTasks() {
  localStorage.setItem("bloomTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();

  tasks.sort((a, b) => a.time.localeCompare(b.time));

  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Complete " + task.title);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const details = document.createElement("small");
    details.textContent = `${task.subject} · ${task.time}`;

    info.append(title, details);

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", "Delete " + task.title);

    remove.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, info, remove);
    taskList.append(item);
  });

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "🌷 Your study space is waiting. Add your first task!";
    taskList.append(empty);
  }

  const total = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  document.getElementById("total").textContent = total;
  document.getElementById("completed").textContent = completed;
  document.getElementById("percent").textContent = percent + "%";
  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("task-count").textContent =
    `${total} ${total === 1 ? "task" : "tasks"}`;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.push({
    id: Date.now() + Math.random(),
    title,
    subject: subjectInput.value,
    time: timeInput.value,
    done: false
  });

  saveTasks();
  renderTasks();
  form.reset();
  taskInput.focus();
});

// Focus timer
let remaining = 25 * 60;
let interval = null;

const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start-btn");

function updateTimer() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  timerDisplay.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(seconds).padStart(2, "0");
}

startButton.addEventListener("click", () => {
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
    startButton.textContent = "Resume focus";
    return;
  }

  if (remaining <= 0) return;

  startButton.textContent = "Pause";
  interval = setInterval(() => {
    remaining--;
    updateTimer();

    if (remaining <= 0) {
      clearInterval(interval);
      interval = null;
      startButton.textContent = "Start focus";
      alert("Focus session complete! Time for a little break. 🌷");
    }
  }, 1000);
});

document.getElementById("reset-btn").addEventListener("click", () => {
  clearInterval(interval);
  interval = null;
  remaining = 25 * 60;
  updateTimer();
  startButton.textContent = "Start focus";
});

renderTasks();
updateTimer();
