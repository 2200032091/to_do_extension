document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const taskCategory = document.getElementById("taskCategory");
    const taskDueDate = document.getElementById("taskDueDate");
    const addTaskButton = document.getElementById("addTask");
    const todoList = document.getElementById("todoList");

    function loadTasks() {
        chrome.storage.sync.get("tasks", function (data) {
            todoList.innerHTML = "";
            let tasks = data.tasks || [];
            tasks.forEach(taskObj => {
                let li = document.createElement("li");
                li.setAttribute("draggable", "true");
    
                // ✅ Checkbox
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = taskObj.completed;
                checkbox.addEventListener("change", function () {
                    toggleTask(taskObj.text);
                });
    
                // ✅ Task details container
                let taskDetails = document.createElement("div");
                taskDetails.className = "task-details";
    
                // 🔹 Task Text
                let taskText = document.createElement("span");
                taskText.className = "task-text";
                taskText.textContent = taskObj.text;
    
                // 🔹 Meta Data (Category & Due Date)
                let taskMeta = document.createElement("span");
                taskMeta.className = "task-meta";
                taskMeta.textContent = `(${taskObj.category}) • Due: ${formatDate(taskObj.dueDate)}`;
    
                taskDetails.appendChild(taskText);
                taskDetails.appendChild(taskMeta);
    
                // ❌ Delete button
                let deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = "✖";
                deleteBtn.className = "delete-btn";
                deleteBtn.onclick = function () {
                    removeTask(taskObj.text);
                };
    
                li.appendChild(checkbox);
                li.appendChild(taskDetails);
                li.appendChild(deleteBtn);
                todoList.appendChild(li);
            });
        });
    }
    
    // 🗓️ Function to format date nicely
    function formatDate(dateString) {
        let date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }
    

    function toggleTask(taskText) {
        chrome.storage.sync.get("tasks", function (data) {
            let tasks = data.tasks || [];
            tasks = tasks.map(taskObj => {
                if (taskObj.text === taskText) {
                    taskObj.completed = !taskObj.completed;
                }
                return taskObj;
            });

            chrome.storage.sync.set({ "tasks": tasks }, function () {
                loadTasks();
            });
        });
    }

    function removeTask(taskText) {
        chrome.storage.sync.get("tasks", function (data) {
            let tasks = data.tasks || [];
            let updatedTasks = tasks.filter(taskObj => taskObj.text !== taskText);
            chrome.storage.sync.set({ "tasks": updatedTasks }, function () {
                loadTasks();
            });
        });
    }

    let draggedItem = null;

    todoList.addEventListener("dragstart", (e) => {
        draggedItem = e.target;
        setTimeout(() => e.target.style.display = "none", 0);
    });

    todoList.addEventListener("dragend", (e) => {
        setTimeout(() => {
            draggedItem.style.display = "flex";
            draggedItem = null;
        }, 0);
    });

    todoList.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(todoList, e.clientY);
        if (afterElement == null) {
            todoList.appendChild(draggedItem);
        } else {
            todoList.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    addTaskButton.addEventListener("click", function () {
        let taskText = taskInput.value.trim();
        let category = taskCategory.value;
        let dueDate = taskDueDate.value;

        if (taskText) {
            chrome.storage.sync.get("tasks", function (data) {
                let tasks = data.tasks || [];
                tasks.push({ text: taskText, category: category, dueDate: dueDate, completed: false });
                chrome.storage.sync.set({ "tasks": tasks }, function () {
                    taskInput.value = "";
                    taskDueDate.value = "";
                    loadTasks();
                });
            });
        }
    });

    chrome.storage.onChanged.addListener(function (changes) {
        if (changes.tasks) {
            loadTasks();
        }
    });

    // document.getElementById("connectGmail").addEventListener("click", () => {

       
    //     chrome.runtime.sendMessage({ message: "authUser" }, (response) => {
    //         if (response.success) {
    //             alert("Gmail connected and unread mails fetched!");
    //             chrome.storage.local.set({ gmailMessages: response.data.messages || [] });
                
    //             renderGmailMessages(response.data.messages || []);
    //             const gmailList = document.getElementById("gmailList");
    //             gmailList.innerHTML = "";
    
    //             const messages = response.data.messages || [];
    
    //             if (messages.length === 0) {
    //                 const li = document.createElement("li");
    //                 li.textContent = "No unread mails!";
    //                 gmailList.appendChild(li);
    //             }
    
    //             messages.forEach((msg) => {
    //                 const li = document.createElement("li");
    //                 li.textContent = `Unread mail ID: ${msg.id}`;
    //                 gmailList.appendChild(li);
    //             });
                
                    
                  
               
    //         } else {
    //             console.error("Gmail fetch failed:", response.error);
    //             alert("Failed to connect Gmail");
    //         }
    //         chrome.storage.local.get("gmailMessages", (data) => {
    //             if (data.gmailMessages) {
    //                 renderGmailMessages(data.gmailMessages);
    //             }
    //         });
            
    //     });
    // });
    
    // function renderGmailMessages(messages) {
    //     const gmailList = document.getElementById("gmailList");
    //     gmailList.innerHTML = "";
    
    //     if (!messages.length) {
    //         const li = document.createElement("li");
    //         li.textContent = " No unread mails!";
    //         gmailList.appendChild(li);
    //     } else {
    //         messages.forEach((msg) => {
    //             const li = document.createElement("li");
    //             li.innerHTML = `
    //                 <strong> ${msg.subject}</strong><br>
    //                 <em>👤 ${msg.from}</em><br>
    //                  ${new Date(msg.date).toLocaleString()}
    //             `;
    //             gmailList.appendChild(li);
    //         });
    //     }
    // }
    
    
    
    // document.getElementById("connectGmail").addEventListener("click", () => {
    //     chrome.runtime.sendMessage({ message: "authUser" }, (response) => {
    //         if (response.success) {
    //             alert("Gmail connected and unread mails fetched!");
    //             const gmailList = document.getElementById("gmailList");
    //             gmailList.innerHTML = "";
    //             response.data.forEach(mail => {
    //                 const li = document.createElement("li");
    //                 li.textContent = `${mail.subject} — ${mail.from}`;
    //                 gmailList.appendChild(li);
    //             });
    //         } else {
    //             alert("Failed to connect Gmail");
    //         }
    //     });
    // });
    
    
    loadTasks();
});
