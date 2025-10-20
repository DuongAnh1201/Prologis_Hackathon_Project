import { useNavigate } from "react-router-dom";

export default function Team({ user, onLogout }) {
  const navigate = useNavigate();

  const teamMembers = [
    { id: 1, name: "Aayush Sharma", role: "Inventory Manager", status: "Active", avatar: "👨‍💼" },
    { id: 2, name: "Sarah Johnson", role: "Stock Coordinator", status: "Active", avatar: "👩‍💼" },
    { id: 3, name: "Mike Chen", role: "Warehouse Lead", status: "Active", avatar: "👨‍🔧" },
    { id: 4, name: "Emily Davis", role: "Data Analyst", status: "Away", avatar: "👩‍💻" },
  ];

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
        <NavButton label="Tasks" onClick={() => navigate("/tasks")} />
        <NavButton active label="Team" onClick={() => navigate("/team")} />
      </aside>

      <main className="page">
        <section className="intro">
          <h1 className="h1">Team</h1>
          <p className="muted">Manage your inventory team</p>
        </section>

        <section className="grid">
          <StatCard title="Team Members" value="4" icon="👥" />
          <StatCard title="Active Now" value="3" accent="green" icon="✅" />
          <StatCard title="Away" value="1" accent="yellow" icon="⏰" />
          <StatCard title="Departments" value="3" accent="blue" icon="🏢" />
        </section>

        <section className="card">
          <h2 className="h2">Team Members</h2>
          {teamMembers.map(member => (
            <div key={member.id} className="list-item">
              <div className="list-item-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontSize: '24px' }}>
                {member.avatar}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{member.name}</div>
                <div className="list-item-subtitle">{member.role}</div>
              </div>
              <span className={`badge ${member.status === 'Active' ? 'green' : 'yellow'}`}>
                {member.status}
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