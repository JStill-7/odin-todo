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

    //Create the new Todo instance object
    const createdTodo = new Todo(title, description, dueDate, priority);

    //Find the matching project object inside our master list array
    const targetProject = projectsMasterList.find(proj => proj.name === chosenProjectName);

    if (targetProject) {
        //Add the task data to that project's internal array
        targetProject.addTodo(createdTodo);

        // 👉 UPDATED: Instantly refresh the viewport to show the newly added task!
        renderActiveProject(targetProject, projectsMasterList);
    }

    //Cleanup form and hide the popup modal
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
});


renderProjectsSidebar(projectsMasterList);