import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";

/* =========================
   LOCALIZER
========================= */
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

/* =========================
   COMPONENT
========================= */
const EventCalendar = ({ events = [] }) => {
  const [view, setView] = useState("month");
  const navigate = useNavigate();

  /* =========================
     MAP EVENTS
  ========================= */
  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e._id,
        title: e.title,
        start: new Date(e.date),
        end: new Date(e.date),
        allDay: true,
      })),
    [events]
  );

  /* =========================
     EVENT STYLE
  ========================= */
  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#4caf50",
      color: "#fff",
      borderRadius: "5px",
      border: "none",
    },
  });

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        height={500}
        view={view}
        views={["month", "week", "day", "agenda"]}
        onView={setView}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => navigate(`/events/${event.id}`)}
        popup
      />
    </div>
  );
};

export default EventCalendar;
