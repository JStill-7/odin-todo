class Project {
    constructor(name) {
        this.name = name;
        this.todos = []; // hold multiple todos in array
    }

    // Methods
    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todoTitle) {
        this.todos = this.todos.filter(todo => todo.title !== todoTitle);
    }
}

class Todo {
    constructor(title, description, dueDate, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false; // Default to false when a todo is first created
    }

    // true false toggle for todo
    toggleComplete() {
        this.completed = !this.completed;
    }

    //update todo priority level
    updatePriority(newPriority) {
        this.priority = newPriority;
    }
}

export { Project, Todo };