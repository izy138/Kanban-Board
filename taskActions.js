// task-related actions
import { tasks, updateLocalStorage, setTasks} from './storage.js';
import { renderTasks, createTaskElement } from './taskRender.js';


function addTask(columnId) {
    const taskInput = document.getElementById("taskInput");
    const dueDateInput = document.getElementById("dueDateInput");
    const taskContent = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (taskContent !== "") {
        const newTask = {
            id: "task-" + Date.now(),
            content: taskContent,
            status: columnId,
            priority: "medium", // default priority
            dueDate: dueDate,
            description: "" // empty description
        };
        
        tasks.push(newTask);
        updateLocalStorage();
        renderTasks();
        taskInput.value = "";
        dueDateInput.value = "";
    }
}

function createTaskFromModal() {
    const modalTaskInput = document.getElementById('modalTaskInput');
    const modalDescriptionInput = document.getElementById('modalDescriptionInput');
    const modalPriorityInput = document.getElementById('modalPriorityInput');
    const modalDueDateInput = document.getElementById('modalDueDateInput');
    
    const taskName = modalTaskInput.value.trim();
    const description = modalDescriptionInput.value.trim();
    const priority = modalPriorityInput.value;
    const dueDate = modalDueDateInput.value;
    
    // create the new task
    const newTask = {
        id: "task-" + Date.now(),
        content: taskName,
        status: "to-do",
        priority: priority,
        dueDate: dueDate,
        description: description
    };
    
    // add to tasks array
    tasks.push(newTask);
    updateLocalStorage();
    
    // update and render
    renderTasks();
    
    // close the modal
    const taskModal = document.getElementById('taskModal');
    taskModal.style.display = 'none';
}

function saveContent(input, contentElement, taskId) {
    const newContent = input.value.trim();
    
    // don't allow empty task names
    if (!newContent) {
        // restore the original content if empty
        input.parentNode.replaceChild(contentElement, input);
        return;
    }
    
    // add to the tasks array
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].content = newContent;
            break;
        }
    }
    
    // update the content element with new text
    contentElement.textContent = newContent;
    
    // replace input with the content element
    if (input.parentNode) {
        input.parentNode.replaceChild(contentElement, input);
    }
    
    // save to localStorage
    updateLocalStorage();
    
    console.log(`Content saved for task ${taskId}:`, newContent);
}

function saveDescription(textarea, descriptionElement, taskId) {
    const newDescription = textarea.value.trim();
    
    // First update the task in the tasks array
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) {
            tasks[i].description = newDescription;
            break;
        }
    }
    
    // Update the description element with new text
    descriptionElement.textContent = newDescription;
    
    // Replace textarea with the description element
    if (textarea.parentNode) {
        textarea.parentNode.replaceChild(descriptionElement, textarea);
    }
    
    updateLocalStorage();
    
    console.log(`Description saved for task ${taskId}:`, newDescription);
}

function confirmDeleteTask(taskId) {
    // Find the task to get its content for the confirmation message
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Create confirmation popup
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'delete-confirmation-popup';
    
    // Create confirmation message
    const message = document.createElement('div');
    message.className = 'confirmation-message';
    message.textContent = `Are you sure you want to delete "${task.content}"?`;
    
    // Create buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'confirmation-buttons';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-delete-btn';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function() {
        document.body.removeChild(confirmPopup);
    };
    
    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-delete-btn';
    confirmButton.textContent = 'Delete';
    confirmButton.onclick = function() {
        deleteTask(taskId);
        document.body.removeChild(confirmPopup);
    };
    
    // Assemble the popup
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    confirmPopup.appendChild(message);
    confirmPopup.appendChild(buttonContainer);
    
    // Add popup to the document
    document.body.appendChild(confirmPopup);
    
    // click outside to cancel
    confirmPopup.addEventListener('click', function(e) {
        if (e.target === confirmPopup) {
            document.body.removeChild(confirmPopup);
        }
    });
}
// this updates tasks array where tasks is filtered using tasks.filter 
function deleteTask(taskId) {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
    renderTasks();
}

// // takes the taskId which is assigned when the task is made
// // when the delete button is pressed the id is pass through this function
// // .filter will delete the task and the tas
// function deleteTask(taskId) {
//      //this updats tasks array where tasks is filtered using tasks.filter 
//     tasks = tasks.filter((task) => task.id !== taskId);
//     updateLocalStorage();
//     renderTasks();
// }

function makeDescriptionEditable(descriptionElement, taskId) {
    // Get the current task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Store current description text
    const currentText = task.description || '';
    
    // Create textarea for editing
    const textarea = document.createElement('textarea');
    textarea.className = 'task-description-textarea';
    textarea.value = currentText;
    textarea.style.height = Math.max(60, descriptionElement.offsetHeight) + 'px';
    
    // Replace description element with textarea
    descriptionElement.parentNode.replaceChild(textarea, descriptionElement);
    textarea.focus();
    
    // Handle saving when focus is lost
    textarea.addEventListener('blur', function() {
        saveDescription(textarea, descriptionElement, taskId);
    });
    
    // Handle Enter key (without shift) to save
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveDescription(textarea, descriptionElement, taskId);
        }
    });
}

function makeContentEditable(contentElement, taskId) {
    // Get the current task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Store current content text
    const currentText = task.content || '';
    
    // create input for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-content-input';
    input.value = currentText;
    
    // replace content element with input
    contentElement.parentNode.replaceChild(input, contentElement);
    input.focus();
    
    // handle saving when focus is lost
    input.addEventListener('blur', function() {
        saveContent(input, contentElement, taskId);
    });
    
    // Enter key to save
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveContent(input, contentElement, taskId);
        }
    });
}

function updateTaskStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex] = { ...tasks[taskIndex], status: newStatus };
    
    updateLocalStorage();
}

function updateTaskPriority(taskId, newPriority) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    tasks[taskIndex] = { ...tasks[taskIndex], priority: newPriority };
    
    updateLocalStorage();
    
    // update the priority indicator visually without rerendering the whole board
    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        const priorityIndicator = taskElement.querySelector('.priority-indicator');
        if (priorityIndicator) {
            // Remove all priority classes
            priorityIndicator.classList.remove('priority-low', 'priority-medium', 'priority-high');
            // Add the new priority class
            priorityIndicator.classList.add(`priority-${newPriority}`);
        }
    }
}

function updateTaskDueDate(taskId, newDueDate) {
    // Find the task to update
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    const oldDueDate = task.dueDate;
    
    // update the task
    tasks[taskIndex] = { ...task, dueDate: newDueDate };
    
    // update local storage
    updateLocalStorage();
    
    // if due date changed significantly, we need to re-render the task
    if (!!oldDueDate !== !!newDueDate || oldDueDate !== newDueDate) {
        const taskElement = document.getElementById(taskId);
        if (taskElement) {
            const parentContainer = taskElement.parentNode;
            const updatedTask = tasks[taskIndex];
            
            const newTaskElement = createTaskElement(
                updatedTask.content, 
                updatedTask.id, 
                updatedTask.priority, 
                updatedTask.dueDate,
                updatedTask.description
            );
            
            // Replace the old element with the new one
            parentContainer.replaceChild(newTaskElement, taskElement);
            console.log("rerender - date change");
        }
    }
}

function capitalizeInput(input) {
    input.value = input.value.toUpperCase();
}

// help with date picker issues
function openDatePicker(taskId) {
    const dateInput = document.querySelector(`#dropdown-${taskId} .task-due-date-input`);
    if (dateInput) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        dateInput.dispatchEvent(event);
    }
}

export {
    addTask,
    createTaskFromModal,
    deleteTask,
    confirmDeleteTask,
    makeDescriptionEditable,
    makeContentEditable,
    saveContent,
    saveDescription,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskDueDate,
    capitalizeInput,
    openDatePicker
};