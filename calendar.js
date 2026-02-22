import { getSubjects } from "./script.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.9/esm/index.js';

let calendar;

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.querySelector('.calendar-container');

  calendar = new FullCalendar.Calendar(calendarEl, {
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
    editable: false,
  });

  calendar.render();

  updateCalendar();
});

export function updateCalendar() {
  if (!calendar) return;

  const subjects = getSubjects();
  const hoursPerDay = {};

  subjects.forEach(subject => {
    if (!subject.studyHistory) return;

    Object.keys(subject.studyHistory).forEach(date => {
      if (!hoursPerDay[date]) {
        hoursPerDay[date] = 0;
      }

      hoursPerDay[date] += subject.studyHistory[date];
    });
  });

  const events = Object.keys(hoursPerDay).map(date => ({
    title: hoursPerDay[date] + ' h',
    start: date
  }));

  calendar.removeAllEvents();
  calendar.addEventSource(events);
}