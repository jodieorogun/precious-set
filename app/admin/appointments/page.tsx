import Image from "next/image";
import Link from "next/link";
import { AdminDashboard } from "../../components/AdminDashboard";

export default function AdminAppointments() {
  return <main className="admin-page"><header className="admin-shell-header"><Link href="/" aria-label="The Precious Set home"><Image src="/precious-set-logo.png" alt="The Precious Set" width={92} height={72} /></Link><Link className="back-to-site" href="/admin">← Dashboard</Link></header><AdminDashboard /></main>;
}
