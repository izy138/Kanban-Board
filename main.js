
import { renderTasks } from './taskRender.js';
import { addTask, deleteTask, confirmDeleteTask } from './taskActions.js';
import { allowDrop, drag, drop } from './dragDrop.js';
import { setupModalFunctionality } from './modal.js';

// now in event 'DOMContentLoaded' it will render the tasks on the board
// //when the page is loaded in the browser DOMContentLoaded occurs, and renderTasks is executed
document.addEventListener('DOMContentLoaded', function() {
//     // render any already existing tasks
    renderTasks();
    
    // set up modal functionality if modal exists in the DOM
    if (document.getElementById('taskModal')) {
        setupModalFunctionality();
    }
});

window.addTask = addTask;
window.allowDrop = allowDrop;
window.drag = drag;
window.drop = drop;
//window.capitalizeInput = capitalizeInput;

