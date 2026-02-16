document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar-container');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: "auto",
    headerToolbar: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    dayMaxEvents: false,
    fixedWeekCount: false,
    showNonCurrentDates: false,
  });

  calendar.render();
});
