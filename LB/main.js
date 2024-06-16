function validateForm() {
    var taskInput = document.getElementById("input-task").value.trim();
    var dateInput = document.getElementById("input-date").value.trim();

    if (taskInput.length < 3 || taskInput.length > 255) {
        alert("Zadanie musi zawierać od 3 do 255 znaków.");
        return false;
    }

    if (dateInput !== "") {
        var today = new Date();
        var inputDate = new Date(dateInput);

        if (inputDate < today) {
            alert("Data musi być dzisiejsza lub późniejsza.");
            return false;
        }
    }

    return true;
}

function getTasksList() {
    return JSON.parse(localStorage.getItem("tasksList")) || [];
}

function saveTasksList(tasksList) {
    localStorage.setItem("tasksList", JSON.stringify(tasksList));
}

function displayTasks() {
    var tasksList = getTasksList();
    var tasksContainer = document.getElementById("tasksContainer");
    tasksContainer.innerHTML = "";

    tasksList.forEach(function(task, index) {
        var taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.dataset.index = index;

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkbox");
        checkbox.checked = task.done;
        checkbox.addEventListener("change", function() {
            updateTaskStatus(index, this.checked);
        });

        var nameElement = document.createElement("div");
        nameElement.classList.add("name");
        nameElement.textContent = task.name;
        nameElement.contentEditable = true;
        nameElement.addEventListener("blur", function() {
            updateTask(index, this.textContent, tasksList[index].date);
        });

        var dateElement = document.createElement("div");
        dateElement.classList.add("date");
        dateElement.textContent = task.date;
        dateElement.contentEditable = true;
        dateElement.addEventListener("blur", function() {
            updateTask(index, tasksList[index].name, this.textContent);
        });

        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = "<img class='delete-icon' src='delete.jpg'>";
        deleteButton.addEventListener("click", function() {
            deleteTask(index);
        });

        taskElement.appendChild(checkbox);
        taskElement.appendChild(nameElement);
        taskElement.appendChild(dateElement);
        taskElement.appendChild(deleteButton);

        tasksContainer.appendChild(taskElement);
    });
}

function addTask() {
    if (validateForm()) {
        var taskInput = document.getElementById("input-task").value.trim();
        var dateInput = document.getElementById("input-date").value.trim();

        var tasksList = getTasksList();

        tasksList.push({
            name: taskInput,
            date: dateInput,
            done: false
        });

        saveTasksList(tasksList);
        displayTasks();

        document.getElementById("input-task").value = "";
        document.getElementById("input-date").value = "";
    }
}

function deleteTask(index) {
    var tasksList = getTasksList();

    if (confirm("Czy na pewno chcesz usunąć to zadanie?")) {
        tasksList.splice(index, 1);
        saveTasksList(tasksList);
        displayTasks();
    }
}

function updateTask(index, newName, newDate) {
    var tasksList = getTasksList();

    tasksList[index].name = newName;
    tasksList[index].date = newDate;

    saveTasksList(tasksList);
}

function updateTaskStatus(index, done) {
    var tasksList = getTasksList();
    tasksList[index].done = done;
    saveTasksList(tasksList);
}

function searchTasks() {
    var searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    var tasksList = getTasksList();
    var filteredTasks = tasksList.filter(function(task) {
        return task.name.toLowerCase().includes(searchInput);
    });
    displayFilteredTasks(filteredTasks);
}

function displayFilteredTasks(filteredTasks) {
    var tasksContainer = document.getElementById("tasksContainer");
    tasksContainer.innerHTML = "";

    filteredTasks.forEach(function(task, index) {
        var taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.dataset.index = index;

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkbox");
        checkbox.checked = task.done;
        checkbox.addEventListener("change", function() {
            updateTaskStatus(index, this.checked);
        });

        var nameElement = document.createElement("div");
        nameElement.classList.add("name");
        nameElement.innerHTML = highlightSearchText(task.name);

        var dateElement = document.createElement("div");
        dateElement.classList.add("date");
        dateElement.textContent = task.date;

        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = "<img class='delete-icon' src='delete.jpg'>";
        deleteButton.addEventListener("click", function() {
            deleteTask(index);
        });

        taskElement.appendChild(checkbox);
        taskElement.appendChild(nameElement);
        taskElement.appendChild(dateElement);
        taskElement.appendChild(deleteButton);

        tasksContainer.appendChild(taskElement);
    });
}

function highlightSearchText(name) {
    var searchInput = document.getElementById("search-input").value.trim().toLowerCase();
    var regex = new RegExp(searchInput, "gi");
    return name.replace(regex, function(match) {
        return "<span class='highlight'>" + match + "</span>";
    });
}

window.onload = function() {
    displayTasks();
    var searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", function() {
        if (this.value.length >= 2) {
            searchTasks();
        } else {
            displayTasks();
        }
    });
};
