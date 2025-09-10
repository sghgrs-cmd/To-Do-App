document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  const todoInput = document.getElementById('todoInput');
  const todoList = document.getElementById('todoList');
  const filters = document.getElementById('filters');
  const tasksLeft = document.getElementById('tasksLeft');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const statTotal = document.getElementById('statTotal');
  const statCompleted = document.getElementById('statCompleted');
  const statActive = document.getElementById('statActive');
  const themeToggle = document.getElementById('themeToggle');

  let todos = JSON.parse(localStorage.getItem('taskforge_todos') || '[]');
  let filter = localStorage.getItem('taskforge_filter') || 'all';

  if (localStorage.getItem('taskforge_theme') === 'light') {
    app.classList.add('light');
    themeToggle.checked = true;
  }
  themeToggle.addEventListener('change', () => {
    app.classList.toggle('light', themeToggle.checked);
    localStorage.setItem('taskforge_theme', themeToggle.checked ? 'light' : 'dark');
  });

  function render() {
    let filtered = todos;
    if (filter === 'active') filtered = todos.filter(t => !t.completed);
    if (filter === 'completed') filtered = todos.filter(t => t.completed);

    todoList.innerHTML = '';
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.setAttribute('data-id', todo.id);

      const checkbox = document.createElement('span');
      checkbox.className = 'checkbox' + (todo.completed ? ' checked' : '');
      checkbox.tabIndex = 0;
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-checked', todo.completed ? 'true' : 'false');
      checkbox.innerHTML = `<span class="checkmark"><svg viewBox="0 0 16 16"><polyline points="3,9 7,13 13,5"/></svg></span>`;
      checkbox.addEventListener('click', () => toggleComplete(todo.id));
      checkbox.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { toggleComplete(todo.id); e.preventDefault(); } });

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;
      text.title = todo.text;
      text.tabIndex = 0;
      text.addEventListener('dblclick', () => startEdit(todo, text, li));
      text.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });

      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => startEdit(todo, text, li));

      const delBtn = document.createElement('button');
      delBtn.className = 'action-btn';
      delBtn.title = 'Delete';
      delBtn.innerHTML = '🗑';
      delBtn.addEventListener('click', () => removeTodo(todo.id, li));

      actions.append(editBtn, delBtn);

      li.append(checkbox, text, actions);
      todoList.appendChild(li);
    });

    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    tasksLeft.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
    statTotal.textContent = todos.length;
    statCompleted.textContent = completedCount;
    statActive.textContent = activeCount;

    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  document.querySelector('.todo-input-bar').addEventListener('submit', e => {
    e.preventDefault();
    const value = todoInput.value.trim();
    if (!value) return;
    todos.push({
      id: Date.now().toString(),
      text: value,
      completed: false
    });
    todoInput.value = '';
    save();
    render();
    setTimeout(() => {
      const first = todoList.querySelector('.todo-item');
      if (first) first.style.boxShadow = '0 8px 32px rgba(39,242,154,0.18)';
      setTimeout(() => { if (first) first.style.boxShadow = ''; }, 350);
    }, 10);
  });

  function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      save();
      render();
    }
  }

  function removeTodo(id, li) {
    li.classList.add('removing');
    setTimeout(() => {
      todos = todos.filter(t => t.id !== id);
      save();
      render();
    }, 180);
  }

  function startEdit(todo, textEl, li) {
    textEl.contentEditable = "true";
    textEl.focus();
    document.execCommand('selectAll', false, null);
    document.getSelection().collapseToEnd();

    function finishEdit() {
      textEl.contentEditable = "false";
      const newText = textEl.textContent.trim();
      if (newText && newText !== todo.text) {
        todo.text = newText;
        save();
        render();
      } else {
        textEl.textContent = todo.text;
      }
      textEl.removeEventListener('blur', finishEdit);
      textEl.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEdit();
      }
      if (e.key === 'Escape') {
        textEl.textContent = todo.text;
        textEl.contentEditable = "false";
        textEl.removeEventListener('blur', finishEdit);
        textEl.removeEventListener('keydown', onKey);
      }
    }
    textEl.addEventListener('blur', finishEdit);
    textEl.addEventListener('keydown', onKey);
  }

  filters.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filter = btn.dataset.filter;
    localStorage.setItem('taskforge_filter', filter);
    render();
  });

  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  });


  function save() {
    localStorage.setItem('taskforge_todos', JSON.stringify(todos));
  }


  todoInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') todoInput.blur();
  });


  render();
});