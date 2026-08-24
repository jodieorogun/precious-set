import { PageIntro } from "../components/PageIntro";
import { BookingForm } from "../components/BookingForm";

export default function Book() {
  return <main><PageIntro eyebrow="Book" title="Your appointment starts here." description="Choose a service, pick a date and time, then send a request. Your appointment will be confirmed by The Precious Set." /><section className="page-shell booking-shell"><BookingForm /></section></main>;
}
