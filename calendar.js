document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.querySelector('.calendar-container');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
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
  },);

  calendar.render();
});
