import './styles.css';
import { Project, Todo } from './todo.js';
import { 
    setupModalListeners, 
    renderActiveProject, 
    updateProjectDropdown, 
    renderProjectsSidebar, 
    renderAllTasks, 
    renderCompletedTasks 
} from './dom.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

// --- APP INITIALIZATION & LOCAL STORAGE LOAD ---
let projectsMasterList = loadFromLocalStorage();

// First-time visit logic: If storage is empty, create default "General" project
if (!projectsMasterList || projectsMasterList.length === 0) {
    projectsMasterList = [];
    const generalProject = new Project("General");
    projectsMasterList.push(generalProject);
    saveToLocalStorage(projectsMasterList);
}

// Set up UI components on page load
setupModalListeners();

const defaultProject = projectsMasterList[0];
renderActiveProject(defaultProject);
renderProjectsSidebar(projectsMasterList);
updateProjectDropdown(projectsMasterList);


// --- NEW PROJECT FORM SUBMISSION ---
const newProjectForm = document.getElementById('new-project-form');
const projectModalElement = document.getElementById('new-project-modal');

newProjectForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const projectNameInput = document.getElementById('project-name');
    const newName = projectNameInput.value;

    const newlyCreatedProject = new Project(newName);
    projectsMasterList.push(newlyCreatedProject);

    // Save state & refresh UI
    saveToLocalStorage(projectsMasterList);
    renderProjectsSidebar(projectsMasterList);
    updateProjectDropdown(projectsMasterList);

    newProjectForm.reset(); 
    projectModalElement.classList.add('hidden'); 
});


// --- NEW / EDIT TASK FORM SUBMISSION ---
const newTaskForm = document.getElementById('new-task-form');
const todoModalElement = document.getElementById('todo-modal');

newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const formData = new FormData(newTaskForm);
    const title = formData.get('title');
    const description = formData.get('description');
    const dueDate = formData.get('dueDate');
    const priority = formData.get('priority');
    const chosenProjectName = formData.get('projectGroup');

    // Handle Edit Mode
    if (newTaskForm.dataset.editMode === "true") {
        const origProjectName = newTaskForm.dataset.originalProject;
        const origTitle = newTaskForm.dataset.originalTitle;

        const origProject = projectsMasterList.find(proj => proj.name === origProjectName);
        const targetTodo = origProject ? origProject.todos.find(todo => todo.title === origTitle) : null;

        if (targetTodo) {
            if (origProjectName !== chosenProjectName) {
                const idx = origProject.todos.indexOf(targetTodo);
                if (idx > -1) origProject.todos.splice(idx, 1);

                targetTodo.title = title;
                targetTodo.description = description;
                targetTodo.dueDate = dueDate;
                targetTodo.priority = priority;

                const newProject = projectsMasterList.find(proj => proj.name === chosenProjectName);
                if (newProject) newProject.addTodo(targetTodo);
            } else {
                targetTodo.title = title;
                targetTodo.description = description;
                targetTodo.dueDate = dueDate;
                targetTodo.priority = priority;
            }
        }

        // Reset metadata flags
        delete newTaskForm.dataset.editMode;
        delete newTaskForm.dataset.originalProject;
        delete newTaskForm.dataset.originalTitle;
        document.getElementById('submit-btn').value = "Submit";

        const projectToRender = projectsMasterList.find(proj => proj.name === chosenProjectName);
        renderActiveProject(projectToRender);

    } else {
        // Create new Todo instance
        const createdTodo = new Todo(title, description, dueDate, priority);
        const targetProject = projectsMasterList.find(proj => proj.name === chosenProjectName);

        if (targetProject) {
            targetProject.addTodo(createdTodo);
            renderActiveProject(targetProject);
        }
    }

    // Save updated data
    saveToLocalStorage(projectsMasterList);

    newTaskForm.reset();
    todoModalElement.classList.add('hidden');
});


// --- NAVIGATION SIDEBAR CLICK HANDLERS ---
const showAllTasks = document.getElementById('all-tasks');
showAllTasks.addEventListener('click', (e) => {
    e.preventDefault(); 
    renderAllTasks(projectsMasterList);
});

const showCompletedTasks = document.getElementById('completed-tasks');
showCompletedTasks.addEventListener('click', () => {
    renderCompletedTasks(projectsMasterList);
});


// --- MODAL CANCEL BUTTONS ---
const closeTaskModalBtn = document.querySelector('#todo-modal .close-modal-btn');
const todoModal = document.getElementById('todo-modal');

closeTaskModalBtn.addEventListener('click', () => {
    delete newTaskForm.dataset.editMode;
    delete newTaskForm.dataset.originalProject;
    delete newTaskForm.dataset.originalTitle;
    document.getElementById('submit-btn').value = "Submit";
    newTaskForm.reset();
    todoModal.classList.add('hidden'); 
});

const closeProjectModalBtn = document.querySelector('#new-project-modal .close-modal-btn');
const newProjectModal = document.getElementById('new-project-modal');

closeProjectModalBtn.addEventListener('click', () => {
    newProjectModal.classList.add('hidden'); 
});


// --- CENTRALIZED WORKSPACE CLICK MANAGER ---
const bodyContainer = document.getElementById('body-container');

bodyContainer.addEventListener('click', (e) => {
    
    // 1. DELETE PROJECT
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
            saveToLocalStorage(projectsMasterList);
            renderProjectsSidebar(projectsMasterList);
            updateProjectDropdown(projectsMasterList);
            renderActiveProject(projectsMasterList[0]);
        }
    }

    // 2. COMPLETE TASK
    if (e.target.classList.contains('complete-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        if (targetProject) {
            const targetTodo = targetProject.todos.find(todo => todo.title === taskTitle);
            if (targetTodo) {
                targetTodo.completed = true; 
                saveToLocalStorage(projectsMasterList);
                renderActiveProject(targetProject);
            }
        }
    }

    // 3. EDIT TASK
    if (e.target.classList.contains('edit-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        
        if (targetProject) {
            const targetTodo = targetProject.todos.find(todo => todo.title === taskTitle);
            
            if (targetTodo) {
                document.getElementById('task-name').value = targetTodo.title;
                document.getElementById('task-description').value = targetTodo.description;
                document.getElementById('due-date').value = targetTodo.dueDate;
                document.getElementById('task-priority').value = targetTodo.priority;
                document.getElementById('task-project').value = projectName;

                newTaskForm.dataset.editMode = "true";
                newTaskForm.dataset.originalProject = projectName;
                newTaskForm.dataset.originalTitle = taskTitle;

                document.getElementById('submit-btn').value = "Save Changes";
                todoModalElement.classList.remove('hidden');
            }
        }
    }

    // 4. DELETE TASK
    if (e.target.classList.contains('delete-btn')) {
        const projectName = e.target.getAttribute('data-project');
        const taskTitle = e.target.getAttribute('data-title');

        const targetProject = projectsMasterList.find(proj => proj.name === projectName);
        if (targetProject) {
            const todoIndex = targetProject.todos.findIndex(todo => todo.title === taskTitle);
            if (todoIndex > -1) {
                targetProject.todos.splice(todoIndex, 1);
                saveToLocalStorage(projectsMasterList);
                renderActiveProject(targetProject);
            }
        }
    }
});


// --- MOBILE SIDEBAR DRAWER ---
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const leftBar = document.getElementById('left-bar');

menuToggleBtn.addEventListener('click', () => {
    leftBar.classList.toggle('active');
});

leftBar.addEventListener('click', () => {
    if (window.innerWidth <= 790) {
        leftBar.classList.remove('active');
    }
});

renderProjectsSidebar(projectsMasterList);