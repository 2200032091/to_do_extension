document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");

    // loading existing tasks from storage
    function loadTasks() {
        chrome.storage.sync.get("tasks", function (data) {
            taskList.innerHTML = ""; // cleaing old list
            let tasks = data.tasks || [];
            tasks.forEach(task => addTaskToUI(task));
        });
    }

    function addTaskToUI(task) {
        let li = document.createElement("li");
        li.textContent = task;

        //  delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.onclick = function () {
            removeTask(task);
        };

        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function removeTask(taskToRemove) {
        chrome.storage.sync.get("tasks", function (data) {
            let tasks = data.tasks || [];
            let updatedTasks = tasks.filter(task => task !== taskToRemove);
            chrome.storage.sync.set({ "tasks": updatedTasks }, function () {
                loadTasks(); // reloading tasks after deletion
            });
        });
    }

    addTaskButton.addEventListener("click", function () {
        let task = taskInput.value.trim();
        if (task) {
            chrome.storage.sync.get("tasks", function (data) {
                let tasks = data.tasks || [];
                tasks.push(task);
                chrome.storage.sync.set({ "tasks": tasks }, function () {
                    taskInput.value = "";
                    loadTasks();
                });
            });
        }
    });

    
   
    loadTasks(); // load tasks on startup
});
