const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const completedTasks = document.getElementById("completed-tasks");
const progressBar = document.getElementById("progress-bar");
const toggleMode = document.getElementById("toggle-mode");
const clock = document.getElementById("clock");

const soundAdd = document.getElementById("sound-add");
const soundComplete = document.getElementById("sound-complete");
const soundDelete = document.getElementById("sound-delete");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

// LIVE CLOCK
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// SIMPAN & LOAD DATA
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// TAMPILKAN SEMUA
function renderTasks() {
  taskList.innerHTML = "";
  completedTasks.innerHTML = "";

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;
  progressBar.textContent = `${percent}%`;

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    if (task.completed) {
      li.innerHTML = `
        <span class="completed-task">${task.text} - <small>${task.date}</small></span>
        <button onclick="toggleComplete(${index})">Undo</button>
      `;
      completedTasks.appendChild(li);
    } else {
      const inputText = document.createElement("input");
      inputText.type = "text";
      inputText.value = task.text;
      inputText.disabled = true;

      const inputDate = document.createElement("input");
      inputDate.type = "datetime-local";
      inputDate.value = task.date;
      inputDate.disabled = true;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.onclick = () => {
        const editing = !inputText.disabled;
        inputText.disabled = editing;
        inputDate.disabled = editing;
        if (editing) {
          task.text = inputText.value;
          task.date = inputDate.value;
          saveTasks();
          editBtn.textContent = "Edit";
          renderTasks();
        } else {
          editBtn.textContent = "Simpan";
        }
      };

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "Selesai";
      doneBtn.onclick = () => {
        toggleComplete(index);
        soundComplete.play();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Hapus";
      deleteBtn.onclick = () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        soundDelete.play();
      };

      li.append(inputText, inputDate, editBtn, doneBtn, deleteBtn);
      taskList.appendChild(li);
    }
  });

  saveTasks();
  checkTodayDeadline();
}

// TANDAI SELESAI
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// TAMBAH TUGAS
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const date = dateInput.value;
  if (!text || !date) return alert("Lengkapi input dulu ya!");

  tasks.push({ text, date, completed: false });
  taskInput.value = "";
  dateInput.value = "";
  renderTasks();
  soundAdd.play();
});

// MODE DARK
toggleMode.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// === NOTIFIKASI DEADLINE ===
function getDeadlineStatus(deadline) {
  const today = new Date().toISOString().split('T')[0];
  const taskDate = new Date(deadline).toISOString().split('T')[0];
  return today === taskDate ? 'due-today' : 'not-today';
}

function checkTodayDeadline() {
  const todayTasks = tasks.filter(task =>
    task.date && !task.completed && getDeadlineStatus(task.date) === 'due-today'
  );

  if (todayTasks.length > 0) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = `🔔 Kamu punya ${todayTasks.length} tugas yang deadline-nya hari ini!`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 5000);
  }
}

renderTasks();