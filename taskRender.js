
//rendering tasks to the DOM
import { tasks } from './storage.js';
import { 
    makeDescriptionEditable, 
    makeContentEditable, 
    updateTaskPriority, 
    updateTaskDueDate,
    confirmDeleteTask
} from './taskActions.js';
import { drag } from './dragDrop.js';

// close all dropdown menus when clicking a new dropdown or clicking outside of menu
function closeAllDropdowns() {
    document.querySelectorAll('.task-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
}

// toggle dropdown menu when clicked and closes any open dropdowns 
function toggleDropdown(taskId,event){
    event.stopPropagation();

    //gets the current dropdown menu
    const dropdown = document.getElementById(`dropdown-${taskId}`);
    if(!dropdown) return;

    //checks if the dropdown is open
    const isOpen = dropdown.style.display === 'block';

    //if a dropdown menu is open, close it
    if(isOpen){
        dropdown.style.display = 'none';
        return;
    }
    //closes all dropdown menus first
    closeAllDropdowns();
    //opens the current dropdown
    dropdown.style.display = 'block';

    //prevents the menu from closing when selecting the date
    const dateInputs = dropdown.querySelectorAll('input[type="data"]');
    dateInputs.forEach(input => {
        input.addEventListener('click', e => e.stopPropagation());
    });
}

// date formatting
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// renders any existing tasks from previous sessions on the board
function renderTasks() {
    const columns = ["to-do", "in-progress", "done"];

    columns.forEach((columnId) => {
        const column = document.getElementById(columnId);
        /** fist we will need to clear the tasks from the board
         * goes through each column and looks inside the task-container div in the todo column and assigns its innerhtml as an empty string
         * without this all the tasks in the array will be rendered multiple times.
         * task.container will keep the array of tasks and everytime you add a task when renderTasks() is executed the preexisting task will also be rendered again.
         * the task is picked up and then emptied out 
         * you dont want to keep adding the same task twice: first you empty the task out then you get the task and then you populate them */
        column.querySelector(".task-container").innerHTML = "";
        //then we will loop through the tasks and add them to the board
        tasks.forEach((task) => {
            // contains the tasks elements, content, id, prio, date, desc.
            if (task != null && task.status === columnId) {
                const taskElement = createTaskElement(
                    task.content, 
                    task.id, 
                    task.priority, 
                    task.dueDate, 
                    task.description
                );
                column.querySelector(".task-container").appendChild(taskElement);
            }
        });
    });
    
    // Close any open dropdown menus when clicking outside of them
    document.addEventListener('click', function(e) {
        // Special handling for date inputs to prevent dropdown from closing
        if (e.target.type === 'date') {
            e.stopPropagation();
            return;
        }
        
        // If the click is not on a dropdown or dropdown button, close all dropdowns
        if (!e.target.closest('.task-dropdown') && !e.target.closest('.toggle-details-btn')) {
            closeAllDropdowns();
        }
    });
}

// create task elements and its features
function createTaskElement(content, id, priority = "medium", dueDate = "", description = "") {
    const taskId = id;
    const task = document.createElement('div');
    task.id = taskId;
    task.className = "task";
    task.draggable = true;
    
    // find the task object
    const taskObj = tasks.find(t => t.id === taskId);
    // use description from task object if available
    description = taskObj?.description !== undefined ? taskObj.description : description;
    
    // create priority indicator
    const priorityIndicator = document.createElement('div');
    priorityIndicator.className = `priority-indicator priority-${priority}`;
    
    // create task header
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    // create content element
    const contentElement = document.createElement('div');
    contentElement.className = 'task-content';
    contentElement.textContent = content;
    
    // add click event to make task name editable
    contentElement.addEventListener('click', function(e) {
        e.stopPropagation();
        makeContentEditable(contentElement, taskId);
    });
    // Create description area (visible by default)
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'task-description';
    descriptionElement.textContent = description || '';
    
    // Make description editable on click
    descriptionElement.addEventListener('click', function(e) {
        e.stopPropagation();
        makeDescriptionEditable(descriptionElement, taskId);
    });
    // create task controls container (for right side of header)
    const taskControls = document.createElement('div');
    taskControls.className = 'task-controls';
    
    // create toggle details button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'toggle-details-btn';
    toggleButton.innerHTML = '⋮'; // vertical ellipsis
    toggleButton.onclick = function(e) {
        toggleDropdown(taskId, e);
    };
    
    // create delete button
    const deleteButton = document.createElement('span');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '❌';
    deleteButton.onclick = function(e) { 
        e.stopPropagation();
        confirmDeleteTask(taskId);
    };
    
    // add controls to task header
    taskControls.appendChild(toggleButton);
    taskControls.appendChild(deleteButton);
    
    // assemble task header
    taskHeader.appendChild(contentElement);
    taskHeader.appendChild(taskControls);
    
    // create due date display if applicable
    let dueDateElement = null;
    if (dueDate) {
        dueDateElement = document.createElement('div');
        dueDateElement.className = 'task-due-date';
        
        // format the date
        const formattedDate = formatDate(dueDate);
        
        // check if overdue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateTime = new Date(dueDate);
        dueDateTime.setHours(0, 0, 0, 0);
        
        if (dueDateTime < today) {
            dueDateElement.classList.add('due-date-overdue');
            dueDateElement.textContent = `Due: ${formattedDate} (Overdue)`;
        } else {
            dueDateElement.textContent = `Due: ${formattedDate}`;
        }
    }
    
    // create dropdown menu for task options
    const dropdown = document.createElement('div');
    dropdown.id = `dropdown-${taskId}`;
    dropdown.className = 'task-dropdown';
    
    // priority section
    const prioritySection = document.createElement('div');
    prioritySection.className = 'dropdown-section';
    
    const priorityLabel = document.createElement('div');
    priorityLabel.className = 'dropdown-label';
    priorityLabel.textContent = 'Priority:';
    
    // priority dropdown
    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'task-priority-select';
    
    const options = [
        { value: 'low', text: 'Low' },
        { value: 'medium', text: 'Medium' },
        { value: 'high', text: 'High' }
    ];
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.value === priority) {
            optionElement.selected = true;
        }
        prioritySelect.appendChild(optionElement);
    });
    
    prioritySelect.addEventListener('change', function() {
        updateTaskPriority(taskId, this.value);
    });
    
    prioritySection.appendChild(priorityLabel);
    prioritySection.appendChild(prioritySelect);
    
    // due date section
    const dueDateSection = document.createElement('div');
    dueDateSection.className = 'dropdown-section';
    dueDateSection.style.position = 'relative'; // Ensure proper positioning
    
    const dueDateLabel = document.createElement('div');
    dueDateLabel.className = 'dropdown-label';
    dueDateLabel.textContent = 'Due Date:';
    
    // create a wrapper for the date input to help with positioning
    const dateInputWrapper = document.createElement('div');
    dateInputWrapper.className = 'date-input-wrapper';
    dateInputWrapper.style.position = 'relative';
    
    const dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.className = 'task-due-date-input';

    // ensure the date input is properly initialized
    if (dueDate) {
        dueDateInput.value = dueDate;
    }
    
    // make sure the event listener captures the date change
    dueDateInput.addEventListener('change', function(e) {
        e.stopPropagation(); // Prevent the event from closing the dropdown
        updateTaskDueDate(taskId, this.value);
    });
    
    // prevent all events from bubbling up to prevent dropdown closure
    dueDateInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    dueDateInput.addEventListener('focus', function(e) {
        e.stopPropagation();
    });
    
    // add double-click handler to help with date picker on some browsers
    // TODO: make entire input area open the calendar
    dueDateInput.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        // Create a temporary hidden input to help launch the native date picker
        const tempInput = document.createElement('input');
        tempInput.type = 'date';
        tempInput.style.position = 'absolute';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.click();
        
        // Copy the value when selected
        tempInput.addEventListener('change', function() {
            dueDateInput.value = this.value;
            updateTaskDueDate(taskId, this.value);
            document.body.removeChild(tempInput);
        });
        
        // Remove after blur
        tempInput.addEventListener('blur', function() {
            setTimeout(() => {
                if (document.body.contains(tempInput)) {
                    document.body.removeChild(tempInput);
                }
            }, 100);
        });
    });
    
    // add input to wrapper, then add wrapper to section
    dateInputWrapper.appendChild(dueDateInput);
    dueDateSection.appendChild(dueDateLabel);
    dueDateSection.appendChild(dateInputWrapper);
    
    // add sections to dropdown menu
    dropdown.appendChild(prioritySection);
    dropdown.appendChild(dueDateSection);
    
    // assemble task
    task.appendChild(priorityIndicator);
    task.appendChild(taskHeader);
    task.appendChild(descriptionElement); // Add description under header
    if (dueDateElement) {
        task.appendChild(dueDateElement);
    }
    task.appendChild(dropdown);

    // add drag event listener
    task.addEventListener("dragstart", drag);

    return task;
}

export { 
    renderTasks, 
    createTaskElement, 
    closeAllDropdowns, 
    toggleDropdown,
    formatDate
};