import { updateDoughnutChart } from "./chart.js";
import { updateBarChart } from "./chart.js";
import { updateCalendar } from "./calendar.js";

// Form for adding subject
function openForm() {
  document.querySelector('.form-container').style.display = "block";
  document.querySelector('.add-btn').style.display = "none";
}

function closeForm() {
  document.querySelector('.form-container').style.display = "none";
  document.querySelector('.add-btn').style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector('.study-box-container');
  const studyTimeInput = document.querySelector('.study-time');

  const savedStudyTime = localStorage.getItem('todayStudyTime');
  if (savedStudyTime !== null) {
    studyTimeInput.value = savedStudyTime;
  }

  document.querySelector('.add-btn')
    .addEventListener('click', openForm);

  document.querySelector('.form-container button')
    .addEventListener('click', closeForm);

  studyTimeInput.addEventListener('input', function () {
    localStorage.setItem('todayStudyTime', studyTimeInput.value);
    renderSubjects();
  });

  container.addEventListener("click", handleStudyButtons);

  const dateLabel = document.querySelector('.date-label');
  dateLabel.textContent = dayjs().format('YYYY-MM-DD');

  document.querySelector('#study-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.querySelector('#name').value;
    const difficulty = document.querySelector('#difficulty').value;
    let examDate = document.querySelector('#examDate').value;
    if (!examDate) {
      examDate = dayjs().add(1, "month").format("YYYY-MM-DD");
    }
    const studyHour = parseFloat(document.querySelector('#studyHour').value);

    const newSubject = {
      createdAt: dayjs().toISOString(),
      id: crypto.randomUUID(),
      name,
      difficulty,
      examDate,
      studyHour,
      studiedHours: 0,
      studyHistory: {}
    };

    saveToLocalStorage(newSubject);
    e.target.reset();
    closeForm();
    renderSubjects();
  });

  renderSubjects();
});

function saveToLocalStorage(subject) {
  const subjects = getSubjects();
  subjects.push(subject);
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

export function getSubjects() {
  const data = localStorage.getItem("subjects");
  return data ? JSON.parse(data) : [];
}

function calculateTotalHours() {
  const subjects = getSubjects();
  return subjects.reduce((total, subject) => {
    return total + (subject.studiedHours || 0);
  }, 0);
}

function calculateCompletedPercent() {
  const subjects = getSubjects();
  if (subjects.length === 0) return 0;

  let totalProgress = 0;
  subjects.forEach(subject => {
    const studied = subject.studiedHours || 0;
    const studyHour = subject.studyHour || 1; 
    totalProgress += Math.min(100, (studied / studyHour) * 100);
  });

  const avgPercent = totalProgress / subjects.length;
  localStorage.setItem("completedPercent", avgPercent);
  return avgPercent;
}

function calculateThisWeek() {
  const subjects = getSubjects();
  if (subjects.length === 0) return 0;

  const oneWeekAgo = dayjs().subtract(7, "day");
  let total = 0;

  subjects.forEach(subject => {
    const createdDate = dayjs(subject.createdAt);

    if (createdDate.isAfter(oneWeekAgo)) {
      total += subject.studiedHours || 0;
    }
  });

  return total;
}

function renderSubjects() {
  const subjects = getSubjects();
  const container = document.querySelector('.study-box-container');
  const studyTime = parseFloat(document.querySelector('.study-time').value) || 0;
  const totalHoursStudied = document.querySelector('.total-hours-studied');

  if (subjects.length === 0) {
  container.innerHTML = "<p class='small-things'>No subjects yet.</p>";

  const logText = document.querySelector('.log-text');
  const doughnutChart = document.querySelector('#doughnut-chart');
  logText.style.display = "block";
  doughnutChart.style.display = 'none';
  return;
}

  let studyBox = "";

  subjects.forEach((subject, index) => {
    const today = dayjs();
    const exam = dayjs(subject.examDate);
    const daysLeft = exam.diff(today, "day");
    const studied = subject.studiedHours || 0;
    const remaining = studyTime - studied;

    const progressPercent = Math.min(100, (studied / subject.studyHour) * 100);

    studyBox += `
      <div class="box-color border border-light-subtle p-3 rounded-4 mb-3 shadow-sm">

        <div class="d-flex justify-content-between">
          <span class="fw-semibold">#${index + 1} ${subject.name}</span>
          <span class="background-code text-light rounded-3 px-2 py-1">
            ${studied} / ${subject.studyHour}h
          </span>
        </div>

        <div class="mt-2 small-things">
          <span>Exam: ${subject.examDate}</span>
          <span class="px-2">${daysLeft} days left</span>
          <span>Difficulty: ${subject.difficulty}/5</span>
        </div>

        <div class="progress mt-2" style="height: 8px;">
          <div class="progress-bar progress-bar-color" style="width:${progressPercent}%"></div>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <div ${studyTime === 0 || remaining <= 0 ? 'style="display:none;"' : ''}>
            <button 
              class="btn btn-sm background-code text-light rounded-3 half-time-btn"
              data-id="${subject.id}" ${remaining < 0.5 ? 'disabled' : ''}>
              +0.5 h
            </button>

            <button 
              class="btn btn-sm background-code text-light rounded-3 full-time-btn"
              data-id="${subject.id}" ${remaining < 1 ? 'disabled' : ''}>
              +1 h
            </button>
          </div>

          <button 
            style="border:none;" 
            class="p-1 del-btn"
            data-index='${subject.id}'">
            Delete
          </button>
        </div>

      </div>
    `;
  });

  container.innerHTML = studyBox;

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('del-btn')) {
      const index = e.target.dataset.index;
      deleteSubject(index);
    }
  });

  const total = calculateTotalHours();
  totalHoursStudied.innerHTML = total.toFixed(1);

  const logText = document.querySelector('.log-text');

  if (total === 0 && subjects.length > 0) {
    logText.style.display = "block";
  } else {
    logText.style.display = "none";
  }

  const completed = calculateCompletedPercent();
  const completedEl = document.querySelector('.complete-percent');
  if (completedEl) {
    completedEl.innerHTML = completed.toFixed(1) + "%";
  }

  const calculateWeek = calculateThisWeek();
  const totalHoursThisWeek = document.querySelector('.studied-this-week');
  totalHoursThisWeek.innerHTML = calculateWeek;
  
  updateDoughnutChart();
  updateBarChart();
  updateCalendar();
}

function handleStudyButtons(e) {
  const id = e.target.dataset.id;
  if (!id) return;

  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === id);
  if (!subject) return;

  const studyTime = parseFloat(document.querySelector('.study-time').value) || 0;
  const studied = subject.studiedHours || 0;
  const remaining = studyTime - studied;
  let totalHoursStudied = document.querySelector('.total-hours-studied');

  let addedHours = 0;

  if (e.target.classList.contains("half-time-btn") && remaining >= 0.5) {
    addedHours = 0.5;
  }

  if (e.target.classList.contains("full-time-btn") && remaining >= 1) {
    addedHours = 1;
  }

  if (addedHours > 0) {
    subject.studiedHours += addedHours;

    const today = dayjs().format("YYYY-MM-DD");

    if (!subject.studyHistory) {
      subject.studyHistory = {};
    }

    if (!subject.studyHistory[today]) {
      subject.studyHistory[today] = 0;
    }

    subject.studyHistory[today] += addedHours;
  }

  if (subject.studiedHours > subject.studyHour) {
    subject.studiedHours = subject.studyHour;
  }

  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
  const total = calculateTotalHours();
  totalHoursStudied.innerHTML = total.toFixed(1);
}

function deleteSubject(id) {
  const subjects = getSubjects();
  const updated = subjects.filter(sub => sub.id !== id);
  localStorage.setItem("subjects", JSON.stringify(updated));
  renderSubjects();
}

// Setting Timer 
const startFocusBtn = document.querySelector('.start-focus-btn');
const stopFocusBtn = document.querySelector('.stop-focus-btn');
const countDown = document.querySelector('.countdown');
const focusText = document.querySelector('.focus-text');
const sessionRound = document.querySelector('.session-number');

let sessionToday = parseInt(localStorage.getItem("sessionToday")) || 0;
sessionRound.textContent = sessionToday;

const startingMinutes = 25;
const breakMinutes = 5;

let time = startingMinutes * 60;
let breakTime = breakMinutes * 60;
let myInterval = null;
let isBreak = false;

function updateDisplay(secondsLeft) {
  const minutes = Math.floor(secondsLeft / 60);
  let seconds = secondsLeft % 60;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  countDown.innerHTML = `${minutes}:${seconds}`;
}

function focusCountDown() {
  if (time <= 0) {
    clearInterval(myInterval);
    startBreak();
    return;
  }

  updateDisplay(time);
  time--;
}

function breakCountDown() {
  if (breakTime <= 0) {
    clearInterval(myInterval);
    resetPomodoro();
    return;
  }

  updateDisplay(breakTime);
  breakTime--;
}

function startFocus() {
  isBreak = false;
  focusText.textContent = "Focus";
  startFocusBtn.style.display = "none";
  stopFocusBtn.style.display = "block";

  myInterval = setInterval(focusCountDown, 1000);
}

function startBreak() {
  isBreak = true;
  focusText.textContent = "Break";

  time = startingMinutes * 60;
  myInterval = setInterval(breakCountDown, 1000);

  sessionToday++;
  sessionRound.textContent = sessionToday;
  localStorage.setItem("sessionToday", sessionToday);
}

function resetPomodoro() {
  clearInterval(myInterval);
  time = startingMinutes * 60;
  breakTime = breakMinutes * 60;
  updateDisplay(time);

  focusText.textContent = "_";
  startFocusBtn.style.display = "block";
  stopFocusBtn.style.display = "none";
}

startFocusBtn.addEventListener("click", startFocus);

stopFocusBtn.addEventListener("click", () => {
  resetPomodoro();
});
