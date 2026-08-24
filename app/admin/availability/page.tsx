import { AdminHeader } from "../../components/AdminHeader";
import { AdminDashboard } from "../../components/AdminDashboard";

export default function AdminAvailability() {
  return <main className="admin-page"><AdminHeader backHref="/admin" backLabel="← Dashboard" /><AdminDashboard /></main>;
}
