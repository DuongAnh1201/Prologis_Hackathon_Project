import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraScanner from "./CameraScanner";

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const totals = useMemo(
    () => ({
      totalItems: 188,
      inStock: 3,
      lowStock: 1,
      employees: 4,
      progressPct: 25,
      completed: 1,
      totalTasks: 4,
    }),
    []
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10&min_score=0.0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to perform search");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
  };

  const handleScan = () => {
    setShowCamera(true);
  };

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
        <NavButton active label="Home" onClick={() => navigate("/home")} />
        <NavButton label="Stock" onClick={() => navigate("/stock")} />
        <NavButton label="Tasks" onClick={() => navigate("/tasks")} />
        <NavButton label="Team" onClick={() => navigate("/team")} />
      </aside>

      <main className="page">
        <section className="intro">
          <h1 className="h1">Welcome Back{user?.username ? `, ${user.username}` : ""}!</h1>
          <p className="muted">Here's your inventory overview</p>
        </section>

        {/* Search Section */}
        <section className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-title">Search Inventory</div>
          <form onSubmit={handleSearch} style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, locations, or users..."
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isSearching ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  opacity: isSearching ? 0.6 : 1,
                }}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              {searchResults && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {searchError && (
            <div style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "#fee",
              color: "#c33",
              borderRadius: "8px",
              fontSize: "0.9rem",
            }}>
              {searchError}
            </div>
          )}

          {searchResults && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "1rem"
              }}>
                <div className="small muted">
                  Found {searchResults.total_found} results, showing {searchResults.returned}
                </div>
                <div className="small muted">
                  Query: "{searchResults.query}"
                </div>
              </div>

              {searchResults.results.length === 0 ? (
                <div style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#6b7280",
                }}>
                  No results found. Try a different search term.
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gap: "1rem",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}>
                  {searchResults.results.map((result, idx) => (
                    <SearchResultCard key={idx} result={result} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="grid">
          <StatCard title="Total Items" value={totals.totalItems} icon="🧮" />
          <StatCard title="In Stock" value={totals.inStock} accent="green" icon="✅" />
          <StatCard title="Low Stock" value={totals.lowStock} accent="yellow" icon="⏰" />
          <StatCard title="Employees" value={totals.employees} icon="🧑‍🤝‍🧑" />
        </section>

        <section className="card progress-card">
          <div className="card-title">Task Progress</div>
          <div className="muted small">Today's completion rate</div>
          <div className="progress-meta">
            <span className="small">{totals.completed} of {totals.totalTasks} completed</span>
            <span className="small progress-pct">{totals.progressPct}%</span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${totals.progressPct}%` }} />
          </div>
        </section>

        <div className="scan-wrap">
          <button className="scan-btn" onClick={handleScan}>
            <span className="scan-icon" aria-hidden>📦</span>
            <span>Scan Item</span>
          </button>
        </div>
      </main>

      {showCamera && <CameraScanner onClose={() => setShowCamera(false)} />}
    </>
  );
}

function SearchResultCard({ result }) {
  return (
    <div style={{
      padding: "1rem",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      background: "white",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: "0.75rem",
      }}>
        <div>
          <div style={{ 
            fontSize: "1.1rem", 
            fontWeight: "600",
            marginBottom: "0.25rem",
          }}>
            {result.product_name}
          </div>
          <div style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}>
            <span style={{
              fontSize: "0.85rem",
              padding: "0.2rem 0.5rem",
              background: "#e0f2fe",
              color: "#0369a1",
              borderRadius: "4px",
              fontWeight: "500",
            }}>
              Score: {result.similarity_score}
            </span>
            {result.keyword_match && (
              <span style={{
                fontSize: "0.85rem",
                padding: "0.2rem 0.5rem",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "4px",
                fontWeight: "500",
              }}>
                Keyword Match
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "0.75rem",
        fontSize: "0.9rem",
      }}>
        {result.details.quantity && (
          <div>
            <div className="muted small">Quantity</div>
            <div style={{ fontWeight: "500" }}>{result.details.quantity}</div>
          </div>
        )}
        {result.details.price && (
          <div>
            <div className="muted small">Price</div>
            <div style={{ fontWeight: "500" }}>{result.details.price}</div>
          </div>
        )}
        {result.details.pick_up_location && (
          <div>
            <div className="muted small">Pick-up Location</div>
            <div style={{ fontWeight: "500" }}>{result.details.pick_up_location}</div>
          </div>
        )}
        {result.details.drop_off_location && (
          <div>
            <div className="muted small">Drop-off Location</div>
            <div style={{ fontWeight: "500" }}>{result.details.drop_off_location}</div>
          </div>
        )}
        {result.details.pick_up_time && (
          <div>
            <div className="muted small">Pick-up Time</div>
            <div style={{ fontWeight: "500" }}>{result.details.pick_up_time}</div>
          </div>
        )}
        {result.details.drop_off_time && (
          <div>
            <div className="muted small">Drop-off Time</div>
            <div style={{ fontWeight: "500" }}>{result.details.drop_off_time}</div>
          </div>
        )}
      </div>

      {result.user_info.user_name && (
        <div style={{
          marginTop: "0.75rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid #f0f0f0",
        }}>
          <div className="muted small" style={{ marginBottom: "0.25rem" }}>User Info</div>
          <div style={{ fontSize: "0.9rem" }}>
            <strong>{result.user_info.user_name}</strong>
            {result.user_info.user_id && ` (ID: ${result.user_info.user_id})`}
            {result.user_info.pick_up_location && ` • ${result.user_info.pick_up_location}`}
          </div>
        </div>
      )}
    </div>
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