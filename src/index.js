import './styles.css';
import { Project, Todo } from './todo.js';
import { setupModalListeners, renderActiveProject, updateProjectDropdown, renderProjectsSidebar, renderTaskForm, renderAllTasks, renderCompletedTasks} from './dom.js';

// master array for projects
const projectsMasterList = [];

// Create the default "General" project using the Class logic from todo.js
const generalProject = new Project("General");

// Push it into our master list array
projectsMasterList.push(generalProject);


// --- INITIAL PAGE LOAD EXECUTION ---

// Activate your modal popup buttons
setupModalListeners();

// Pass projectsMasterList so the engine can manage deletions
renderActiveProject(generalProject, projectsMasterList);

// Populate the task form dropdown list with our projects array (currently just holds General)
updateProjectDropdown(projectsMasterList);


// Grab the form element from the DOM
const newProjectForm = document.getElementById('new-project-form');
const projectModalElement = document.getElementById('new-project-modal'); // Needed to close it later

// Listen for the form submission
newProjectForm.addEventListener('submit', (e) => {
    // Stops browser from refreshing the page on form submit
    e.preventDefault(); 

    // Grab the text value the user typed into the input field
    const projectNameInput = document.getElementById('project-name');
    const newName = projectNameInput.value;

    // Create the actual data object using your Project class
    const newlyCreatedProject = new Project(newName);

    // Push the object into our master data array
    projectsMasterList.push(newlyCreatedProject);

    // --- UPDATE THE DOM ---
    // Refresh the sidebar project list
    renderProjectsSidebar(projectsMasterList);
    
    // Refresh the task form dropdown list so the new project shows up there too!
    updateProjectDropdown(projectsMasterList);

    // --- CLEAN UP ---
    newProjectForm.reset(); // Clears out the text input box
    projectModalElement.classList.add('hidden'); // Close the popup window

});

const newTaskForm = document.getElementById('new-task-form');
const todoModalElement = document.getElementById('todo-modal');

newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop page reload

    const formData = new FormData(newTaskForm);
    const title = formData.get('title');
    const description = formData.get('description');
    const dueDate = formData.get('dueDate');
    const priority = formData.get('priority');
    const chosenProjectName = formData.get('projectGroup');

    // 💡 CHECK: Are we editing an existing task, or creating a new one?
    if (newTaskForm.dataset.editMode === "true") {
        const origProjectName = newTaskForm.dataset.originalProject;
        const origTitle = newTaskForm.dataset.originalTitle;

        const origProject = projectsMasterList.find(proj => proj.name === origProjectName);
        const targetTodo = origProject ? origProject.todos.find(todo => todo.title === origTitle) : null;

        if (targetTodo) {
            // If the user changed the project group, migrate the task over
            if (origProjectName !== chosenProjectName) {
                const idx = origProject.todos.indexOf(targetTodo);
                if (idx > -1) origProject.todos.splice(idx, 1); // Remove from old project

                // Update properties
                targetTodo.title = title;
                targetTodo.description = description;
                targetTodo.dueDate = dueDate;
                targetTodo.priority = priority;

                // Push into the new project array
                const newProject = projectsMasterList.find(proj => proj.name === chosenProjectName);
                if (newProject) newProject.addTodo(targetTodo);
            } else {
                // Otherwise, just update the data values in place
                targetTodo.title = title;
                targetTodo.description = description;
                targetTodo.dueDate = dueDate;
                targetTodo.priority = priority;
            }
        }

        // Clean up the metadata flags and reset the submit button text
        delete newTaskForm.dataset.editMode;
        delete newTaskForm.dataset.originalProject;
        delete newTaskForm.dataset.originalTitle;
        document.getElementById('submit-btn').value = "Submit";

        // Refresh the interface based on the project the task lands in
        const projectToRender = projectsMasterList.find(proj => proj.name === chosenProjectName);
        renderActiveProject(projectToRender);

    } else {
        // 💡 DEFAULT LOGIC: Create a brand new Todo instance
        const createdTodo = new Todo(title, description, dueDate, priority);
        const targetProject = projectsMasterList.find(proj => proj.name === chosenProjectName);

        if (targetProject) {
            targetProject.addTodo(createdTodo);
            renderActiveProject(targetProject);
        }
    }

    // Cleanup form layout and hide the popup modal
    newTaskForm.reset();
    todoModalElement.classList.add('hidden');
});

//show every task in every project
const showAllTasks = document.getElementById('all-tasks');

showAllTasks.addEventListener('click', (e) => {
    e.preventDefault(); // Stop page reload

    // Pass the master list of all projects into the rendering engine
    renderAllTasks(projectsMasterList);
});


const showCompletedTasks = document.getElementById('completed-tasks');

showCompletedTasks.addEventListener('click', () => {
    renderCompletedTasks(projectsMasterList);
});

//close buttons
const closeTaskModalBtn = document.querySelector('#todo-modal .close-modal-btn');
const todoModal = document.getElementById('todo-modal');

closeTaskModalBtn.addEventListener('click', () => {
    todoModal.classList.add('hidden'); 
});


const closeProjectModalBtn = document.querySelector('#new-project-modal .close-modal-btn');
const newProjectModal = document.getElementById('new-project-modal');

closeProjectModalBtn.addEventListener('click', () => {
    newProjectModal.classList.add('hidden'); 
});

// --- CENTRALIZED BODY CLICK MANAGER (Projects & Tasks) ---
const bodyContainer = document.getElementById('body-container');

bodyContainer.addEventListener('click', (e) => {
    
    //  HANDLE: DELETE PROJECT
    if (e.target.classList.contains('delete-project-btn')) {
        const projectName = e.target.getAttribute('data-project');

        if (projectName === 'General') {
            alert("The 'General' project cannot be deleted!");
            return;
        }

        if (confirm(`Are you sure you want to delete "${projectName}" and all its tasks?`)) {
            const index = projectsMasterList.findIndex(proj => proj.name === projectName);
            if (index > -1) {
                projectsMasterList.splice(index, 1);
            }
            renderProjectsSidebar(projectsMasterList);
            updateProjectDropdown(projectsMasterList);
            renderActiveProject(generalProject);
        }
    }

    //  HANDLE: COMPLETE TASK
    if (e.target.classList.contains('complete-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        // Find the project, then find the task inside it, and flip completed to true
        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        if (targetProject) {
            const targetTodo = targetProject.todos.find(todo => todo.title === taskTitle);
            if (targetTodo) {
                targetTodo.completed = true; 
                renderActiveProject(targetProject); // Instantly re-render workspace
            }
        }
    }

    // HANDLE: DELETE TASK
    if (e.target.classList.contains('delete-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        if (targetProject) {
            const todoIndex = targetProject.todos.findIndex(todo => todo.title === taskTitle);
            if (todoIndex > -1) {
                targetProject.todos.splice(todoIndex, 1); // Remove task from array
                renderActiveProject(targetProject);       // Instantly re-render workspace
            }
        }
    }

// HANDLE: EDIT TASK
    if (e.target.classList.contains('edit-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        
        if (targetProject) {
            // Find the specific task object we want to edit
            const targetTodo = targetProject.todos.find(todo => todo.title === taskTitle);
            
            if (targetTodo) {
                //Fill the form input fields with the task's existing information
                document.getElementById('task-name').value = targetTodo.title;
                document.getElementById('task-description').value = targetTodo.description;
                document.getElementById('due-date').value = targetTodo.dueDate;
                document.getElementById('task-priority').value = targetTodo.priority;
                document.getElementById('task-project').value = projectName;

                //Add hidden metadata to the form so the submit listener knows we are EDITING
                newTaskForm.dataset.editMode = "true";
                newTaskForm.dataset.originalProject = projectName;
                newTaskForm.dataset.originalTitle = taskTitle;

                //Change button text to feel polished
                document.getElementById('submit-btn').value = "Save Changes";

                //Open the modal pop-up
                todoModalElement.classList.remove('hidden');
            }
        }
    }
});


// --- MOBILE SIDEBAR DROPDOWN LOGIC ---
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const leftBar = document.getElementById('left-bar');

// Toggle the mobile drop down when clicking the hamburger icon
menuToggleBtn.addEventListener('click', () => {
    leftBar.classList.toggle('active');
});

// Auto-close the drawer when selecting a layout option or project
leftBar.addEventListener('click', () => {
    if (window.innerWidth <= 790) {
        leftBar.classList.remove('active'); // Instantly hides the menu after choice is made
    }
});


renderProjectsSidebar(projectsMasterList);