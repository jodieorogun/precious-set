import { PageIntro } from "../components/PageIntro";
import { AdminDashboard } from "../components/AdminDashboard";

export default function Admin() {
  return <main><PageIntro eyebrow="Admin" title="The studio dashboard." description="Review booking requests and keep the diary up to date." /><AdminDashboard /></main>;
}
