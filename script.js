let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const taskInput = document.getElementById("taskInput");
const startDateInput = document.getElementById("startDateInput");
const dueDateInput = document.getElementById("dueDateInput");
const categorySelect = document.getElementById("categories");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let editIndex = null;

let stats = JSON.parse(localStorage.getItem("stats")) || {
  streak: 0,
  lastCompletedDate: null
};

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  let filtered = tasks;

  if (filter === "completed") {
    filtered = tasks.filter(t => t.completed);
  } else if (filter === "assigned") {
    filtered = tasks.filter(t => t.assignedTo === localStorage.getItem("username"));
  } else if (filter === "priority1") {
    filtered = tasks.filter(t => t.priority === 1);
  } else if (filter !== "all") {
    filtered = tasks.filter(t => t.category === filter);
  }

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" onchange="toggleComplete(${index})" ${task.completed ? "checked" : ""}>
        <div>
          <strong>${task.text}</strong>
          <div class="task-meta">From: ${task.startDate} | Due: ${task.dueDate} | Category: ${task.category}</div>
        </div>
      </div>
      <div class="task-actions">
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  updateStats();
}

function toggleComplete(index) {
  const task = tasks[index];

  if (!task.completed) {
    showPopup(`🎉 Great job! You completed: "${task.text}"`);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    const today = new Date().toISOString().split('T')[0];
    if (stats.lastCompletedDate !== today) {
      const lastDate = new Date(stats.lastCompletedDate);
      const todayDate = new Date(today);
      const diff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        stats.streak++;
      } else if (diff > 1 || !stats.lastCompletedDate) {
        stats.streak = 1;
      }

      stats.lastCompletedDate = today;
      localStorage.setItem("stats", JSON.stringify(stats));
    }
  }

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function showPopup(message) {
  let popup = document.getElementById("popupMessage");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popupMessage";
    popup.className = "popup-message";
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

function deleteTask(index) {
  if (confirm("Delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

function editTask(index) {
  const task = tasks[index];
  taskInput.value = task.text;
  startDateInput.value = task.startDate;
  dueDateInput.value = task.dueDate;
  categorySelect.value = task.category;
  editIndex = index;
}

addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const startDate = startDateInput.value;
  const dueDate = dueDateInput.value;
  const category = categorySelect.value;

  if (!text || !startDate || !dueDate) {
    alert("Please fill in all fields.");
    return;
  }

  const newTask = {
    text,
    startDate,
    dueDate,
    category,
    completed: false,
    assignedTo: localStorage.getItem("username"),
    priority: 1
  };

  if (editIndex !== null) {
    tasks[editIndex] = newTask;
    editIndex = null;
  } else {
    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  taskInput.value = "";
  startDateInput.value = "";
  dueDateInput.value = "";
  categorySelect.selectedIndex = 0;
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = tasks.filter(t => t.text.toLowerCase().includes(keyword));
  taskList.innerHTML = "";
  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" onchange="toggleComplete(${index})" ${task.completed ? "checked" : ""}>
        <div>
          <strong>${task.text}</strong>
          <div class="task-meta">From: ${task.startDate} | Due: ${task.dueDate} | Category: ${task.category}</div>
        </div>
      </div>
      <div class="task-actions">
        <button onclick="editTask(${index})">✏️</button>
        <button onclick="deleteTask(${index})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
});

document.querySelectorAll(".menu-item").forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    const filter = item.getAttribute("data-filter");
    renderTasks(filter);
    document.getElementById("section-title").innerText =
      filter.charAt(0).toUpperCase() + filter.slice(1);
  });
});

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  let completedToday = 0;
  let completedThisWeek = 0;

  tasks.forEach(task => {
    if (task.completed) {
      if (task.dueDate === today) {
        completedToday++;
      }

      const dueDate = new Date(task.dueDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - dueDate) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        completedThisWeek++;
      }
    }
  });

  document.getElementById("tasksCompletedToday").innerText = `Tasks Today: ${completedToday}`;
  document.getElementById("tasksCompletedThisWeek").innerText = `Tasks This Week: ${completedThisWeek}`;
  document.getElementById("streakCounter").innerText = `🔥 Streak: ${stats.streak} days`;
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  const profileName = localStorage.getItem("username") || "User";
  const profilePhoto = localStorage.getItem("profilePhoto");
  document.getElementById("profileName").innerText = profileName;

  const img = document.getElementById("profileImage");
  if (profilePhoto) {
    img.style.backgroundImage = `url(${profilePhoto})`;
    img.style.backgroundSize = "cover";
    img.innerText = "";
  }

  renderTasks();
  updateStats();

  Sortable.create(taskList, {
    animation: 150,
    onEnd: () => {
      const newOrder = [];
      document.querySelectorAll("#taskList .task-item").forEach(li => {
        const title = li.querySelector("strong").textContent;
        const found = tasks.find(t => t.text === title);
        if (found) newOrder.push(found);
      });
      tasks = newOrder;
      saveTasks();
    }
  });
};
