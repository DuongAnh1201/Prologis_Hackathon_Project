import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Tasks({ user, onLogout }) {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([
    { id: 1, title: "Count warehouse items", completed: true, priority: "High" },
    { id: 2, title: "Update inventory system", completed: false, priority: "High" },
    { id: 3, title: "Order new supplies", completed: false, priority: "Medium" },
    { id: 4, title: "Review stock levels", completed: false, priority: "Low" },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <>
      <header className="appbar">
        <div className="brand">
          <div className="brand-icon" aria-hidden>🧊</div>
          <div className="brand-texts">
            <div className="brand-title">Prologis Inventory</div>
            <div className="brand-sub">ID: PL-2024-8451</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <aside className="sidenav" aria-label="Secondary navigation">
        <NavButton label="Home" onClick={() => navigate("/home")} />
        <NavButton label="Stock" onClick={() => navigate("/stock")} />
        <NavButton active label="Tasks" onClick={() => navigate("/tasks")} />
        <NavButton label="Team" onClick={() => navigate("/team")} />
      </aside>

      <main className="page">
        <section className="intro">
          <h1 className="h1">Tasks</h1>
          <p className="muted">{completedCount} of {tasks.length} completed</p>
        </section>

        <section className="grid">
          <StatCard title="Total Tasks" value={tasks.length} icon="📋" />
          <StatCard title="Completed" value={completedCount} accent="green" icon="✅" />
          <StatCard title="Pending" value={tasks.length - completedCount} accent="yellow" icon="⏳" />
          <StatCard title="Progress" value={`${Math.round((completedCount/tasks.length)*100)}%`} accent="blue" icon="📊" />
        </section>

        <section className="card">
          <h2 className="h2">Today's Tasks</h2>
          {tasks.map(task => (
            <div key={task.id} className="list-item" onClick={() => toggleTask(task.id)} style={{ cursor: 'pointer' }}>
              <div className={`checkbox ${task.completed ? 'checked' : ''}`} />
              <div className="list-item-content">
                <div className="list-item-title" style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}>
                  {task.title}
                </div>
                <div className="list-item-subtitle">Priority: {task.priority}</div>
              </div>
              <span className={`badge ${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'blue'}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

function StatCard({ title, value, accent, icon }) {
  return (
    <div className="card stat">
      <div className="stat-head">
        <div className={`stat-ico ${accent || ""}`} aria-hidden>{icon || "📦"}</div>
        <div>{title}</div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function NavButton({ label, active, onClick }) {
  return (
    <button type="button" className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>
      <div className="nav-ico" aria-hidden>
        {label === "Home" && "🏠"}
        {label === "Stock" && "📦"}
        {label === "Tasks" && "🗒️"}
        {label === "Team" && "👥"}
      </div>
      <div className="nav-lab">{label}</div>
    </button>
  );
}