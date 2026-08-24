import Image from "next/image";
import Link from "next/link";
import { AdminDashboard } from "../components/AdminDashboard";

export default function Admin() {
  return <main className="admin-page"><header className="admin-shell-header"><Link href="/" aria-label="The Precious Set home"><Image src="/precious-set-logo.png" alt="The Precious Set" width={92} height={72} /></Link><Link className="back-to-site" href="/">← Back to site</Link></header><section className="admin-page-header page-shell" /><AdminDashboard /></main>;
}
