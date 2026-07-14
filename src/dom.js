//the project container where the form lives
let projectForm = document.querySelector('#new-project-modal');
//the cancel button that lives in the project form container
let closeProjectBtn = document.querySelector('.close-modal-btn');

//the todo form
let toDoForm = document.querySelector('#todo-modal');
//close todo form
let closeToDoForm = document.querySelector('.close-modal-btn');

//the add new project button
let newProjectBtn = document.getElementById('add-new-project');

//new task button 
let newTaskBtn = document.getElementById('new-task-button');


//open and close functions
function openModal(modalElement) {
    modalElement.classList.remove('hidden');
}

function closeModal(modalElement) {
    modalElement.classList.add('hidden');
}



export function setupModalListeners() {
    
    // When "Add New Project" is clicked, open the project modal
    newProjectBtn.addEventListener('click', () => {
        openModal(projectForm);
    });

    // When "Cancel" is clicked, close the project modal
    closeProjectBtn.addEventListener('click', () => {
        closeModal(projectForm);
    });

    newTaskBtn.addEventListener('click', () => {
        openModal(toDoForm);
    })

    closeToDoForm.addEventListener('click' , () => {
        closeModal(toDoForm);
    })
}

// Function to update the main viewport with the active project info
export function renderActiveProject(project) {
    const bodyContainer = document.getElementById('body-container');
    
    bodyContainer.innerHTML = `
        <div class="project-header-area">
            <h1>${project.name}</h1>
            <button class="delete-project-btn" data-project="${project.name}">Delete Project</button>
        </div>
        <div id="tasks-container"></div>
    `;

    const tasksContainer = document.getElementById('tasks-container');
    const activeTodos = project.todos.filter(todo => todo.completed === false);

    if (activeTodos.length === 0) {
        tasksContainer.innerHTML = `<p style="color: lightgray; margin-top: 10px;">No active tasks in this project!</p>`;
    } else {
        activeTodos.forEach(todo => {
            const todoCard = document.createElement('div');
            todoCard.classList.add('todo-card');   
            
            // 💡 ADDED: data-project and data-title attributes to the buttons below
            todoCard.innerHTML = `
                <div class="todo-main-info">
                    <h3>${todo.title}</h3>
                    <p>${todo.description}</p>
                </div>
                <div class="todo-sub-info">
                    <span>Due: ${todo.dueDate}</span> | 
                    <span>Priority: ${todo.priority}</span>
                </div>
                <div class="card-actions">
                    <button class="complete-btn" data-project="${project.name}" data-title="${todo.title}">Complete Task</button>
                    <button class="edit-btn" data-project="${project.name}" data-title="${todo.title}">Edit Task</button>
                    <button class="delete-btn" data-project="${project.name}" data-title="${todo.title}">Delete Task</button>
                </div>
            `;
            
            tasksContainer.appendChild(todoCard);
        });
    }
}

// Function to dynamically fill the select dropdown form with current projects
export function updateProjectDropdown(projectsList) {
    const projectSelect = document.getElementById('task-project');
    
    // Clear out whatever was inside the select tag first
    projectSelect.innerHTML = '';

    // Loop through our array of projects and create an <option> tag for each
    projectsList.forEach(project => {
        const option = document.createElement('option');
        option.value = project.name;        // What JavaScript reads behind the scenes
        option.textContent = project.name;  // What the user actually sees in the dropdown
        projectSelect.appendChild(option);
    });
}


export function renderProjectsSidebar(projectsList) {
    const projectsListContainer = document.getElementById('projects-list');
    
    // Clear out the old list
    projectsListContainer.innerHTML = '';

    // Loop through your master array of projects
    projectsList.forEach(project => {
        // Create a clickable element for each project
        const projectBtn = document.createElement('button');
        projectBtn.classList.add('sidebar-project-btn');
        projectBtn.textContent = project.name;
        
        
        projectBtn.addEventListener('click', () => {
            // When this specific button is clicked, pass its project data
            // into your working function to update the main view!
            renderActiveProject(project);
        });
        
        // Append it into our HTML container
        projectsListContainer.appendChild(projectBtn);
    });
}

//render task form
export function renderTaskForm(form) {
    //where task will go on main body
    const mainBody = document.getElementById('body-container');
    //grab task form
    const taskForm = document.getElementById('new-task-form');
    //handle all form inputs
    const formData = new FormData(form);
    
    // Loop through all fields
    formData.forEach((value, key) => {
        const p = document.createElement('p');
        p.textContent = `${key}: ${value}`;
        entry.appendChild(p);
    });

    //append to project main body
  document.body.appendChild(mainBody);

}

// Renders all tasks from every project
export function renderAllTasks(projectsList) {
    const bodyContainer = document.getElementById('body-container');

    bodyContainer.innerHTML = `
        <h1>All Tasks</h1>
        <div id="tasks-container"></div>
    `;

    const tasksContainer = document.getElementById('tasks-container');
    let totalTaskCount = 0;

    projectsList.forEach(project => {
        project.todos.forEach(todo => {
            
            // Only render if the task is NOT complete
            if (todo.completed === false) {
                totalTaskCount++;

                const todoCard = document.createElement('div');
                todoCard.classList.add('todo-card');
                
                todoCard.innerHTML = `
                    <div class="todo-main-info">
                        <h3>${todo.title} <span style="font-size: 0.8rem; color: #a0a0a0; font-weight: normal;">(Project: ${project.name})</span></h3>
                        <p>${todo.description}</p>
                    </div>
                    <div class="todo-sub-info">
                        <span>Due: ${todo.dueDate}</span> | 
                        <span>Priority: ${todo.priority}</span>
                    </div>
                `;
                
                tasksContainer.appendChild(todoCard);
            } 
            
        });
    });

    if (totalTaskCount === 0) {
        tasksContainer.innerHTML = `<p style="color: lightgray; margin-top: 10px;">You don't have any active tasks!</p>`;
    }
}




// render all completed task from every project
export function renderCompletedTasks(projectsList) {
    const bodyContainer = document.getElementById('body-container');

    bodyContainer.innerHTML = `
        <h1>Completed Tasks</h1>
        <div id="tasks-container"></div>
    `;

    const tasksContainer = document.getElementById('tasks-container');
    let completedCount = 0;

    // Nested loop to find completed tasks across all projects
    projectsList.forEach(project => {
        project.todos.forEach(todo => {
            if (todo.completed === true) {
                completedCount++;

                const todoCard = document.createElement('div');
                todoCard.classList.add('todo-card');
                todoCard.style.opacity = "0.6"; // Make it look visually "done"

                todoCard.innerHTML = `
                    <div class="todo-main-info">
                        <h3><del>${todo.title}</del></h3>
                        <p>${todo.description}</p>
                    </div>
                    <div class="card-actions">
                        <button class="delete-btn">Delete Permanently</button>
                    </div>
                `;

                tasksContainer.appendChild(todoCard);

                const deleteBtn = todoCard.querySelector('.delete-btn');

                deleteBtn.addEventListener('click', () => {
                    //  Wipe it from the data array
                    project.todos = project.todos.filter(item => item !== todo);

                    // Refresh the completed tasks view (we pass projectsList back into itself!)
                    renderCompletedTasks(projectsList); 
                });

            }
        });

    });

    if (completedCount === 0) {
        tasksContainer.innerHTML = `<p style="color: lightgray; margin-top: 10px;">You haven't completed any tasks yet.</p>`;
    }
}

