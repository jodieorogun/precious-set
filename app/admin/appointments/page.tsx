import { AdminHeader } from "../../components/AdminHeader";
import { AdminDashboard } from "../../components/AdminDashboard";

export default function AdminAppointments() {
  return <main className="admin-page"><AdminHeader backHref="/admin" backLabel="← Dashboard" /><AdminDashboard /></main>;
}
