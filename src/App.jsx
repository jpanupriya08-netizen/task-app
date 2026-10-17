import React, { useEffect, useMemo, useState } from 'react';

const starterTasks = [
  { id: 'sample-1', title: 'Plan the week ahead', category: 'Personal', priority: 'High', due: todayKey(), done: false },
  { id: 'sample-2', title: 'Review project notes', category: 'Work', priority: 'Medium', due: todayKey(), done: false },
  { id: 'sample-3', title: 'Take a little time to recharge', category: 'Personal', priority: 'Low', due: '', done: true },
];

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function Icon({ name, size = 19 }) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    inbox: <><path d="M4 4h16v16H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></>,
    arrow: <><path d="M7 17 17 7M8 7h9v9"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function readTasks() {
  try {
    const saved = localStorage.getItem('daylight-tasks');
    return saved ? JSON.parse(saved) : starterTasks;
  } catch {
    return starterTasks;
  }
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [view, setView] = useState('Today');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Personal', priority: 'Medium', due: todayKey() });

  useEffect(() => localStorage.setItem('daylight-tasks', JSON.stringify(tasks)), [tasks]);

  const counts = useMemo(() => ({
    Today: tasks.filter((task) => !task.done && task.due === todayKey()).length,
    Upcoming: tasks.filter((task) => !task.done && task.due && task.due > todayKey()).length,
    Completed: tasks.filter((task) => task.done).length,
    All: tasks.filter((task) => !task.done).length,
  }), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(query.toLowerCase()) || task.category.toLowerCase().includes(query.toLowerCase());
    const matchesView = view === 'All' ? !task.done : view === 'Today' ? !task.done && task.due === todayKey() : view === 'Upcoming' ? !task.done && task.due && task.due > todayKey() : task.done;
    return matchesSearch && matchesView;
  }).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')), [tasks, view, query]);

  function addTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setTasks((current) => [{ ...form, title: form.title.trim(), id: crypto.randomUUID(), done: false }, ...current]);
    setForm({ title: '', category: 'Personal', priority: 'Medium', due: todayKey() });
    setShowForm(false);
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const completedCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#today" onClick={(event) => { event.preventDefault(); setView('Today'); }}><span className="brand-mark"><Icon name="sun" size={21}/></span><span>daylight<span className="brand-dot">.</span></span></a>
      <div className="side-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Task views">
        <NavItem icon="inbox" label="All tasks" count={counts.All} active={view === 'All'} onClick={() => setView('All')}/>
        <NavItem icon="sun" label="Today" count={counts.Today} active={view === 'Today'} onClick={() => setView('Today')}/>
        <NavItem icon="calendar" label="Upcoming" count={counts.Upcoming} active={view === 'Upcoming'} onClick={() => setView('Upcoming')}/>
        <NavItem icon="check" label="Completed" count={counts.Completed} active={view === 'Completed'} onClick={() => setView('Completed')}/>
      </nav>
      <div className="sidebar-bottom">
        <div className="focus-card"><div className="focus-icon"><Icon name="sun" size={17}/></div><p className="focus-title">A little progress<br/>adds up.</p><p className="focus-copy">You’ve completed {progress}% of your tasks.</p><div className="progress-track"><span style={{ width: `${progress}%` }}/></div></div>
        <div className="profile"><div className="avatar">J</div><div><strong>My workspace</strong><span>Personal planner</span></div><span className="profile-menu">···</span></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{view}</strong></div><div className="top-actions"><label className="search-box"><Icon name="search" size={17}/><input aria-label="Search tasks" placeholder="Search tasks..." value={query} onChange={(event) => setQuery(event.target.value)}/><kbd>⌘ K</kbd></label><button className="avatar small-avatar" aria-label="Your profile">J</button></div></header>
      <section className="content">
        <div className="page-heading"><div><div className="date-label">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div><h1>{view === 'Today' ? 'Today' : view === 'All' ? 'All tasks' : view}</h1><p>{view === 'Today' ? 'A clear mind starts with a clear plan.' : view === 'Upcoming' ? 'A look at what’s coming up.' : view === 'Completed' ? 'Look at everything you’ve accomplished.' : 'Everything you need to get done.'}</p></div><button className="primary-button" onClick={() => setShowForm(true)}><Icon name="plus" size={18}/> New task</button></div>

        {showForm && <form className="new-task-card" onSubmit={addTask}><div className="form-title-row"><strong>Create a task</strong><button type="button" className="close-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div><input autoFocus className="task-title-input" placeholder="What needs to get done?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={140}/><div className="form-controls"><label>List<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Personal</option><option>Work</option><option>Study</option></select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Due date<input type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })}/></label><button className="primary-button create-button" type="submit">Add task</button></div></form>}

        <div className="list-toolbar"><div className="list-title"><h2>{view === 'Today' ? 'Your focus' : `${view} list`}</h2><span>{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</span></div><div className="sort-note"><span className="sort-dot"/> Sorted by date</div></div>
        <div className="task-list">
          {visibleTasks.map((task) => <article className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}><button className="task-check" aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => toggleTask(task.id)}>{task.done && <Icon name="check" size={14}/>}</button><div className="task-main"><div className="task-name">{task.title}</div><div className="task-meta"><span className={`category-chip ${task.category.toLowerCase()}`}>{task.category}</span><span className={`priority-chip ${task.priority.toLowerCase()}`}><i/> {task.priority}</span></div></div><div className={`task-date ${task.due === todayKey() && !task.done ? 'due-today' : ''}`}>{task.due ? <><Icon name="calendar" size={14}/>{formatDate(task.due)}</> : <span className="no-date">No date</span>}</div><button className="delete-button" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Icon name="trash" size={16}/></button></article>)}
          {!visibleTasks.length && <div className="empty-state"><div className="empty-icon"><Icon name={view === 'Completed' ? 'check' : 'sun'} size={24}/></div><h3>{query ? 'No matching tasks' : view === 'Completed' ? 'Nothing completed yet' : 'You’re all caught up'}</h3><p>{query ? 'Try another search term.' : 'Enjoy the breathing room, or add a new task to your list.'}</p>{!query && view !== 'Completed' && <button className="text-button" onClick={() => setShowForm(true)}><Icon name="plus" size={16}/> Add a task</button>}</div>}
        </div>
        <div className="bottom-note"><span>✦</span> Small steps, meaningful progress.</div>
      </section>
    </main>
  </div>;
}

function NavItem({ icon, label, count, active, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} size={18}/><span>{label}</span>{count > 0 && <small>{count}</small>}</button>;
}
