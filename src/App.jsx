import { useState, useEffect } from "react";

const defaultBusinesses = [
  {
    id: 1,
    name: "Baen Construction",
    city: "Neverwinter",
    sector: "Infrastructure",
    status: "Operational",
    manager: "Veldrin Snowfall",
    loyalty: 8,
    threat: 2,
    actions: []
  },
  {
    id: 2,
    name: "Northern Crown Financial",
    city: "Luskan",
    sector: "Banking",
    status: "Operational",
    manager: "Varrick Silverthorn",
    loyalty: 9,
    threat: 3,
    actions: []
  },
  {
    id: 3,
    name: "Thorn & Silver Exchange",
    city: "Luskan",
    sector: "Finance Subholding",
    status: "NCF-controlled",
    manager: "Selah Thorn",
    loyalty: 6,
    threat: 4,
    actions: []
  }
];

const presets = [
  "Investigate Corruption", "Raise Wages", "Secure Supply Lines", "Hire Mercs", "Audit Finances"
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [customAction, setCustomAction] = useState("");
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("baen-data");
    return saved ? JSON.parse(saved) : defaultBusinesses;
  });

  const [undoStack, setUndoStack] = useState([]);

  useEffect(() => {
    localStorage.setItem("baen-data", JSON.stringify(data));
  }, [data]);

  const assignAction = (index, action) => {
    if (!action) return;
    const updated = [...data];
    updated[index].actions.push({
      text: action,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      notes: ""
    });
    setData(updated);
  };

  const resolveAction = (bizIndex, actionIndex, result) => {
    const confirmed = window.confirm(`Mark this action as ${result}?`);
    if (!confirmed) return;
    const updated = [...data];
    const action = updated[bizIndex].actions[actionIndex];
    setUndoStack([{ ...action }, bizIndex, actionIndex]);
    action.status = result;
    setData(updated);
  };

  const undoLast = () => {
    if (!undoStack.length) return;
    const [prev, bizIndex, actionIndex] = undoStack;
    const updated = [...data];
    updated[bizIndex].actions[actionIndex] = prev;
    setData(updated);
    setUndoStack([]);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Baen Holdings Companion v2.1</h1>

      <div style={{ display: "flex", gap: "1rem", margin: "1rem 0", borderBottom: "2px solid #ccc" }}>
        {["overview", "actions", "gm"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1rem",
              borderBottom: tab === t ? "2px solid blue" : "2px solid transparent",
              fontWeight: tab === t ? "bold" : "normal",
              background: "none",
              cursor: "pointer"
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          {data.map((b) => (
            <div key={b.id} style={{ background: "#fff", padding: "1rem", marginBottom: "1rem", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2>{b.name}</h2>
              <p>{b.city} | {b.sector} | {b.status}</p>
              <p>Manager: {b.manager}</p>
              <p>Loyalty: {b.loyalty}/10</p>
              <p>Threat: {b.threat}/5</p>
            </div>
          ))}
        </div>
      )}

      {tab === "actions" && (
        <div>
          {data.map((b, i) => (
            <div key={b.id} style={{ background: "#eef2f7", padding: "1rem", borderRadius: "6px", marginBottom: "1rem" }}>
              <h3>{b.name}</h3>
              <select onChange={(e) => assignAction(i, e.target.value)} defaultValue="">
                <option value="">Assign Action</option>
                {presets.map((p, j) => <option key={j} value={p}>{p}</option>)}
                {customAction && <option value={customAction}>{customAction}</option>}
              </select>
              <ul>
                {b.actions.map((a, j) => (
                  <li key={j}>
                    {a.text || "(unknown action)"} — {a.status} ({a.date})
                    {a.status === "Pending" && (
                      <>
                        <button onClick={() => resolveAction(i, j, "Success")} style={{ marginLeft: "1rem" }}>✔️</button>
                        <button onClick={() => resolveAction(i, j, "Failure")} style={{ marginLeft: "0.5rem" }}>❌</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <input
            placeholder="Custom action..."
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            style={{ padding: "0.5rem", width: "100%" }}
          />
          <button onClick={undoLast} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#ccc" }}>
            Undo Last
          </button>
        </div>
      )}

      {tab === "gm" && (
        <div>
          <h3>Filter Businesses</h3>
          <p>Coming soon: filter by loyalty, threat, manager status, and more.</p>
        </div>
      )}
    </div>
  );
}
