import { useNavigate } from "react-router-dom";

export default function Stock({ user, onLogout }) {
  const navigate = useNavigate();

  const stockItems = [
    { id: 1, name: "Office Chairs", quantity: 45, status: "In Stock", icon: "🪑" },
    { id: 2, name: "Desks", quantity: 23, status: "In Stock", icon: "🪑" },
    { id: 3, name: "Laptops", quantity: 2, status: "Low Stock", icon: "💻" },
    { id: 4, name: "Monitors", quantity: 0, status: "Out of Stock", icon: "🖥️" },
    { id: 5, name: "Keyboards", quantity: 18, status: "In Stock", icon: "⌨️" },
    { id: 6, name: "Office Supplies", quantity: 156, status: "In Stock", icon: "📎" },
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
        <NavButton active label="Stock" onClick={() => navigate("/stock")} />
        <NavButton label="Tasks" onClick={() => navigate("/tasks")} />
        <NavButton label="Team" onClick={() => navigate("/team")} />
      </aside>

      <main className="page">
        <section className="intro">
          <h1 className="h1">Stock Management</h1>
          <p className="muted">Current inventory levels</p>
        </section>

        <section className="grid">
          <StatCard title="Total Stock" value="244" icon="📦" />
          <StatCard title="Low Stock Items" value="1" accent="yellow" icon="⚠️" />
          <StatCard title="Out of Stock" value="1" accent="red" icon="❌" />
          <StatCard title="Categories" value="6" accent="blue" icon="📂" />
        </section>

        <section className="card">
          <h2 className="h2">Inventory Items</h2>
          {stockItems.map(item => (
            <div key={item.id} className="list-item">
              <div className="list-item-icon" style={{ background: '#f1f5f9' }}>
                {item.icon}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-subtitle">Quantity: {item.quantity}</div>
              </div>
              <span className={`badge ${item.status === 'In Stock' ? 'green' : item.status === 'Low Stock' ? 'yellow' : 'red'}`}>
                {item.status}
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