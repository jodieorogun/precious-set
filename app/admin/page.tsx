import { AdminHeader } from "../components/AdminHeader";
import { AdminDashboard } from "../components/AdminDashboard";

export default function Admin() {
  return <main className="admin-page"><AdminHeader /><section className="admin-page-header page-shell" /><AdminDashboard /></main>;
}
