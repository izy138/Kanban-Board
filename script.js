//get items from local storage key of 'tasks'
// Function to update local
// storage with current tasks
function updateLocalStorage() {
    // console.log("task update");
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
//hash map where the key is tasks and the output is the content of the 
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // || [] is the same as: if(tasks === undefined) tasks = []
// console.log("tasks =", tasks);

// now in event 'DOMContentLoaded' it will render the tasks on the board
//when the page is loaded in the browser DOMContentLoaded occurs, and renderTasks is executed
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    setupModalFunctionality();
});

// function to render past tasks on the board
function renderTasks() {
    //localStorage.clear();
    const columns = ["to-do", "in-progress", "done"];
    // const columns = ["todo"];

    // for(let i = 0; i<columns.length; i++){
    // console.log('columnId =',columns[i])}
    columns.forEach((columnId) => {
        // console.log("columnId=", columnId);
        const column = document.getElementById(columnId);
        // console.log("column =", column);
        // fist we will need to clear the tasks from the board
        // console.log(column);
        // console.log(column.querySelector(".task-container"));
        // task-container.innerHTML = "";
        // console.log(column);

        //goes through each column and looks inside the task-container div in the todo column and assigns its innerhtml as an empty string
        //without this all the tasks in the array will be rendered multiple times.
        // task.container will keep the array of tasks and everytime you add a task when renderTasks() is executed the preexisting task will also be rendered again.
        // the task is picked up and then emptied out 
        // you dont want to keep adding the same task twice: first you empty the task out then you get the task and then you populate them
        // console.log(column);
        column.querySelector(".task-container").innerHTML = "";
        // console.log(column.querySelector(".task-container"));


        //then we will loop through the tasks and add them to the board
        // console.log(tasks);
        // console.log();   
        tasks.forEach((task) => {
            // console.log(task);
            // if (task != null){
            //     console.log(task);
            //     console.log(task.status);
            // }
            if (task != null && task.status === columnId) {
                // console.log(task)
                //contains the tasks elements, content, id, prio, date, desc.
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

    
    //close drop down menu when clicking out of it
    document.addEventListener('click', function(e){
    // when selecting the date, prevents the dropdown menu from closing
        if (e.target.type === 'date') {
            e.stopPropagation();
            return;
        }
        
        // if the click is not on a the dropdown menu or dropdown button, close all dropdowns
        if (!e.target.closest('.task-dropdown') && !e.target.closest('.toggle-details-btn')) {
            closeAllDropdowns();
        }
    });
}
//closes all dropdown menus
function closeAllDropdowns(){
    document.querySelectorAll('.task-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
}

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

// create task element function
function createTaskElement(content, id, priority = 'medium', dueDate = "", description = "") {
    const taskId = id;
    //create an element div by document.createElement('div')
    //this div is where the tasks are added to once you type them and click add task.
    //where the tasks are loaded when the page is loaded
    const task = document.createElement('div');
    task.id = taskId; //an attribute
    task.className = "task"; //points to the css file
    task.draggable = true;
    //inside the task-container it will have the content and then the delete button
    //added Task: before the task content

    // finds the task object
    const taskObj = tasks.find(t => t.id === taskId);
    // sets description if available
    description = taskObj?.description !== undefined ? taskObj.description : description;

    // creates priority indicator
    const priorityIndicator = document.createElement('div');
    priorityIndicator.className = `priority-indicator priority-${priority}`;

    // create the tasks header
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';

    //create content element
    const contentElement = document.createElement('div');
    contentElement.className = 'task-content';
    contentElement.textContent = content;

    // edit the tasks header on click
    contentElement.addEventListener('click', function(e){
        e.stopPropagation();
        makeContentEditable(contentElement, taskId);
    });

    // create task control container (right side of the header)
    const taskControls = document.createElement('div');
    taskControls.className = 'task-controls';

    // create the toggle details button
    const toggleButton = document.createElement('div');
    toggleButton.className = 'toggle-details-btn';
    toggleButton.innerHTML = '⋮'; // vertical elipsis for button
    toggleButton.onclick = function(e){
        //on click the dropdown menu will appear below it.
        toggleDropdown(taskId,e);
    }

    // create delete button
    const deleteButton = document.createElement('span');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '❌';
    deleteButton.onclick = function(e) {
        e.stopPropagation();
        //onclick the confirm delete popup will appear
        confirmDeleteTask(taskId);
    }

    //controls for the task header
    taskControls.appendChild(toggleButton);
    taskControls.appendChild(deleteButton);

    //adds the content and the new task controls to the header
    taskHeader.appendChild(contentElement);
    taskHeader.appendChild(taskControls);

    // description area below the tasks header
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'task-description';
    descriptionElement.textContent = description || ''; 

    // edit the description on click
    descriptionElement.addEventListener('click', function(e){
        e.stopPropagation();
        makeDescriptionEditable(descriptionElement,taskId);
    });

    let dueDateElement = null;
    if(dueDate){
        dueDateElement = document.createElement('div');
        dueDateElement.className = 'task-due-date';

        //format date
        const formattedDate = formatDate(dueDate);

        // if the due date is overdue (the date has passed)
        const today = new Date();
        todat.setData(0,0,0,0);
        const dueDateTime = new Date(dueDate);
        dueDateTime.setHours(0,0,0,0);

        if(dueDateTime < today){
            dueDateElement.classList.add('due-date-overdue');
            dueDateElement.textContent = `Due: ${formattedDate} (Overdue)`;
        }else {
            dueDateElement.textContent = `Due: ${formattedDate}`;
        }
    }

    //DROPDOWN MENU
    //create dropdown to edit the priority and due date
    const dropdown = document.createElement('div');
    dropdown.id = `dropdown-${taskId}`;
    dropdown.className = 'task-dropdown';

    //priority section of dropdown menu
    const prioritySection = document.createElement('div');
    prioritySection.className = 'dropdown-section';

    //priorty name on dropdown menu
    const priorityLabel = document.createElement('div');
    priorityLabel.className = 'dropdown-label';
    priorityLabel.textContent = 'Priority:';

    //selection for priority 
    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'task-priority-select';

    const options = [
        { value: 'low', text: 'Low' },
        { value: 'medium', text: 'Medium' },
        { value: 'high', text: 'High' }
    ];
    //sets the option to the priority
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        if (option.value === priority){
            optionElement.selected = true;
        }
        prioritySelect.appendChild(optionElement);
    });

    prioritySelect.addEventListener('change',function(){
        updateTaskPriority(taskId, this.value);
    });

    prioritySection.appendChild(priorityLabel);
    prioritySection.appendChild(prioritySelect);

    // due date section of drop down menu
    



    // adds an event listener for "dragstart" 
    // when the task is clicked and dragged the page triggers the "dragstart" event
    // the event listener will then execute the drag function
    // the drag function will execute:
    // event.dataTransfer.setData("text/plain",event.target.id);
    // the event is the task you are clicking and dragging. 
    // the dataTransfer object is part of the drag event, it holds the data from the task being dragged.
    // setData: When you start dragging an element, you can store some data (like an element’s ID, a file, or text) using setData() so that it can be accessed when the element is dropped.
    // This data is later retrieved when the element is dropped.
    task.addEventListener("dragstart", drag);

    return task;
}

//columnId = "todo" , "in-progess", "done"
//taskInput is assigned in the html file as the id of the text input inside the todo div
//taskContent is the the tasksInput value and trim takes off the white space of the input.
//if taskContent is not enpty, a newTask is made where is is assigned id: task- and the date, with content: TaskContent and with status:columnId
//the newTask is pushed into the new tasks array with tasks.push(newTask)
//local storge is updated and rendertasks is executed
//the taskInput value is then emptied with taskInput.value = "";
function addTask(columnId) {
    const taskInput = document.getElementById("taskInput");
    const taskContent = taskInput.value.trim();
    if (taskContent !== "") {  //if the taskContent is NOT an empty string (anything that is not null)
        const newTask = {
            id: "task-" + Date.now(),
            // id: `task-${Date.now()}`,
            content: taskContent,
            status: columnId,
        };
        // console.log('New task:', newTask);  // Check the structure of the new task
        tasks.push(newTask);
        // console.log('Updated tasks:', tasks);
        //update localStorage
        updateLocalStorage();
        renderTasks();
        taskInput.value = "";
    }
}

// // Function to delete a task
//takes the taskId which is assigned when the task is made
//when the delete button is pressed the id is pass through this function
// .filter will delete the task and the tas
function deleteTask(taskId) {
    // console.log("task to delete",taskId);
    // console.log("tasks before deletion", tasks);
    //this updats tasks array where tasks is filtered using tasks.filter and the parameter for what is allo
    // console.log(tasks)

    tasks = tasks.filter((task) => task.id !== taskId);
    // console.log('Tasks after deletion:', tasks);
    // console.log(tasks)
    updateLocalStorage();
    renderTasks();
}

//the default is to not allow items to be dropped
//event.preventDefault(); prevents this default setting and allows tasks to be dropped into columns
function allowDrop(event) {
    event.preventDefault();
}

//event.target.id:
// This retrieves the id of the element that is being dragged. 
// By using setData, the element's ID will be stored in the dataTransfer object 
// and can be retrieved during the drop event.
function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}



function drop(event, columnId) {
    event.preventDefault();

    // get the dragged element's ID and find the element
    const data = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(data);

    // console.log(JSON.parse(localStorage.getItem("tasks")));

    if (draggedElement) {
        // update task status based on the columnId
        const taskStatus = columnId;
        updateTaskStatus(data, taskStatus);

        // use event.currentTarget to refer to the entire colum which contains the the drop event listener
        const dropTarget = event.currentTarget;

        // find the .task-container inside the dropTarget (the column)
        const taskContainer = dropTarget.querySelector(".task-container");

        // if the taskContainer exists, append the dragged element to it
        if (taskContainer) {
            taskContainer.appendChild(draggedElement);
        }
    }
    // console.log(JSON.parse(localStorage.getItem("tasks")));


}

function capitalizeInput(input) {
    input.value = input.value.toUpperCase();
}

// function to update task status
// when moved to another column
function updateTaskStatus(taskId, newStatus) {
    // console.log(newStatus);
    tasks = tasks.map((task) => {
        // console.log(task);
        // console.log(taskId);
        if (task.id === taskId) {
            // console.log("inside if");
            return { ...task, status: newStatus };
        }
        return task;
    });
    // tasks.addEventListener("dragstart", drag);
    updateLocalStorage();
}


// function drop(event,columnId){
//     event.preventDefault();
//     console.log(columnId);
//     //
//     const data= event.dataTransfer.getData("text/plain");
//     console.log(data);
//     const draggedElement = document.getElementById(data);
//     console.log(draggedElement);
//     if(draggedElement){
//         const taskStatus = columnId;
//         updateTaskStatus(data,taskStatus);

// const dropTarget = event.currentTarget;
// const taskContainer = dropTarget.querySelector(".task-container");
// // If the taskContainer exists, append the dragged element to it
// if (taskContainer) {
//                     taskContainer.appendChild(draggedElement);
//                 } else {
//                     console.error("Task container not found in column:", columnId);
//                 }

//    // event.target.querySelector(".task-container").appendChild(draggedEleement);
//     }
// }