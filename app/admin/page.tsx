import { AdminDashboard } from "../components/AdminDashboard";

export default function Admin() {
  return <main className="admin-page"><section className="admin-page-header page-shell"><p className="eyebrow">The Precious Set / Private area</p><h1>Admin sign in</h1><p>Manage booking requests and upcoming appointments.</p></section><AdminDashboard /></main>;
}
