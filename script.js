// Setting localStorage expire time
function setWithExpiry(key, value, ttl) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + ttl
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

const oneDay = 24 * 60 * 60 * 1000;

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

  const savedStudyTime = getWithExpiry('todayStudyTime');
  if (savedStudyTime !== null) {
    studyTimeInput.value = savedStudyTime;
  }

  studyTimeInput.addEventListener('input', function () {
    setWithExpiry('todayStudyTime', studyTimeInput.value, oneDay);
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
      createdAt: dayjs(),
      id: crypto.randomUUID(),
      name,
      difficulty,
      examDate,
      studyHour,
      studiedHours: 0
    };

    saveToLocalStorage(newSubject);
    e.target.reset();
    closeForm();
    renderSubjects();
  });

  renderSubjects();
});

function saveToLocalStorage(subject) {
  const subjects = getWithExpiry('subjects') || [];
  subjects.push(subject);
  setWithExpiry("subjects", subjects, oneDay);
}

function getSubjects() {
  const subjects = getWithExpiry("subjects");
  return Array.isArray(subjects) ? subjects : [];
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
  setWithExpiry("completedPercent", avgPercent, oneDay);
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
            onclick="deleteSubject('${subject.id}')">
            Delete
          </button>
        </div>

      </div>
    `;
  });

  container.innerHTML = studyBox;

  const total = calculateTotalHours();
  totalHoursStudied.innerHTML = total.toFixed(1);
  const completed = calculateCompletedPercent();
  const completedEl = document.querySelector('.complete-percent');
  if (completedEl) {
    completedEl.innerHTML = completed.toFixed(1) + "%";
  }

  const calculateWeek = calculateThisWeek();
  const totalHoursThisWeek = document.querySelector('.studied-this-week');
  totalHoursThisWeek.innerHTML = calculateWeek;
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

  if (e.target.classList.contains("half-time-btn") && remaining >= 0.5) {
    subject.studiedHours += 0.5;
  } 

  if (e.target.classList.contains("full-time-btn") && remaining >= 1) {
    subject.studiedHours += 1;
  }

  if (subject.studiedHours > subject.studyHour) {
    subject.studiedHours = subject.studyHour;
  }

  setWithExpiry("subjects", subjects, oneDay);
  renderSubjects();
  const total = calculateTotalHours();
  totalHoursStudied.innerHTML = total.toFixed(1);
}

function deleteSubject(id) {
  const subjects = getSubjects();
  const updated = subjects.filter(sub => sub.id !== id);
  setWithExpiry("subjects", updated, oneDay);
  renderSubjects();
}

// Setting Timer 
const startFocusBtn = document.querySelector('.start-focus-btn');
const stopFocusBtn = document.querySelector('.stop-focus-btn');
const countDown = document.querySelector('.countdown');
const focusText = document.querySelector('.focus-text');
const sessionRound = document.querySelector('.session-number');

let sessionToday = parseInt(getWithExpiry("sessionToday")) || 0;
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
  setWithExpiry("sessionToday", sessionToday, oneDay);
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
