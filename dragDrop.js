// dragDrop.js - Handles drag and drop functionality
import { updateTaskStatus } from './taskActions.js';

//the default is to not allow items to be dropped
//event.preventDefault(); prevents this default setting and allows tasks to be dropped into columns
function allowDrop(event) {
    event.preventDefault();
}

/** event.target.id: this retrieves the id of the element that is being dragged. 
 * By using setData, the element's ID will be stored in the dataTransfer object 
 * and can be retrieved during the drop event. */
function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

// allows dropping into a container
function drop(event, columnId) {
    event.preventDefault();

    // get the dragged element's ID and find the element
    const data = event.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(data);

    if (draggedElement) {
        // update task status based on the columnId
        const taskStatus = columnId;
        updateTaskStatus(data, taskStatus);

        // use event.currentTarget to refer to the entire column (the one with the drop event listener)
        const dropTarget = event.currentTarget;

        // find the .task-container inside the dropTarget (the column)
        const taskContainer = dropTarget.querySelector(".task-container");

        // if the taskContainer exists, append the dragged element to it
        if (taskContainer) {
            taskContainer.appendChild(draggedElement);
        }
    }
}

export { allowDrop, drag, drop };