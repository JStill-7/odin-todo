import { Project, Todo } from './todo.js';

//SAVE FUNCTION: Call this whenever data changes
export function saveToLocalStorage(projectsList) {
    localStorage.setItem('warmObsidianTodos', JSON.stringify(projectsList));
}

//LOAD FUNCTION: Call this ONCE when the app first loads
export function loadFromLocalStorage() {
    const data = localStorage.getItem('warmObsidianTodos');
    
    // If there is no saved data yet (first time visiting), return null
    if (!data) return null;

    const rawProjects = JSON.parse(data);

    // Re-hydrate plain objects back into full Project and Todo class instances
    return rawProjects.map(rawProj => {
        const rehydratedProject = new Project(rawProj.name);
        
        rawProj.todos.forEach(rawTodo => {
            const rehydratedTodo = new Todo(
                rawTodo.title, 
                rawTodo.description, 
                rawTodo.dueDate, 
                rawTodo.priority
            );
            rehydratedTodo.completed = rawTodo.completed; // Keep completion status
            rehydratedProject.addTodo(rehydratedTodo);
        });

        return rehydratedProject;
    });
}