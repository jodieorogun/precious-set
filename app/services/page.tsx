import { PageIntro } from "../components/PageIntro";
import { ServiceList } from "../components/ServiceList";

export default function Services() {
  return <main><PageIntro eyebrow="Services" title="A considered menu of sets." description="Choose your favourite service and send a request for a time that works for you." /><ServiceList /></main>;
}
