import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUsers, changeRole, setUserActive } from "../../services/adminService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import "../ui.css";

const ROLE_LABEL = {
  ROLE_STUDENT: "Student",
  ROLE_TEACHER: "Teacher",
  ROLE_ADMIN: "Administrator",
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const onChange = async (u, role) => {
    setError("");
    try {
      const updated = await changeRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const onToggleActive = async (u) => {
    const active = !u.active;
    const action = active ? "Reactivate" : "Deactivate";
    if (!window.confirm(`${action} the account for ${u.username}?`)) return;
    setError("");
    try {
      const updated = await setUserActive(u.id, active);
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const shown = users.filter((u) =>
    (u.username + " " + u.email).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <h1>Manage users</h1>
      <input className="search" placeholder="Search by username or email"
             value={query} onChange={(e) => setQuery(e.target.value)} />
      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading...</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Username</th><th>Email</th><th>Role</th><th>Account</th><th>Action</th></tr>
          </thead>
          <tbody>
            {shown.map((u) => {
              const locked = u.role === "ROLE_ADMIN" || u.username === me?.username;
              return (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {locked ? (
                      <span className="badge admin">{ROLE_LABEL[u.role] ?? u.role}</span>
                    ) : (
                      <select value={u.role} onChange={(e) => onChange(u, e.target.value)}>
                        <option value="ROLE_STUDENT">Student</option>
                        <option value="ROLE_TEACHER">Teacher</option>
                      </select>
                    )}
                  </td>
                  <td><span className={`badge ${u.active ? "approved" : "rejected"}`}>{u.active ? "Active" : "Deactivated"}</span></td>
                  <td>
                    {!locked && (
                      <button
                        className={`btn ${u.active ? "danger" : "primary"}`}
                        onClick={() => onToggleActive(u)}
                      >
                        {u.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}