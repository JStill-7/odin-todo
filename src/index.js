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

// Force the main page container to immediately display the General project
renderActiveProject(generalProject);

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

        //Instantly refresh the viewport to show the newly added task!
        renderActiveProject(targetProject);
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


renderProjectsSidebar(projectsMasterList);