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
  const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
  subjects.push(subject);
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function getSubjects() {
  return JSON.parse(localStorage.getItem("subjects")) || [];
}

function renderSubjects() {
  const subjects = getSubjects();
  const container = document.querySelector('.study-box-container');
  const studyTime = parseFloat(document.querySelector('.study-time').value) || 0;

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
          <span class="bg-danger-subtle border border-danger-subtle text-danger-emphasis rounded-3 px-2 py-1">
            ${studied} / ${subject.studyHour}h
          </span>
        </div>

        <div class="mt-2 small-things">
          <span>${subject.examDate}</span>
          <span class="px-2">${daysLeft} days left</span>
          <span>Difficulty: ${subject.difficulty}/5</span>
        </div>

        <div class="progress mt-2" style="height: 8px;">
          <div class="progress-bar" style="width:${progressPercent}%"></div>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <div ${studyTime === 0 || remaining <= 0 ? 'style="display:none;"' : ''}>
            <button 
              class="btn btn-sm bg-danger-subtle border border-danger-subtle text-danger-emphasis rounded-3 half-time-btn"
              data-id="${subject.id}" ${remaining < 0.5 ? 'disabled' : ''}>
              +0.5 h
            </button>

            <button 
              class="btn btn-sm bg-danger-subtle border border-danger-subtle text-danger-emphasis rounded-3 full-time-btn"
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

  if (e.target.classList.contains("half-time-btn") && remaining >= 0.5) {
    subject.studiedHours += 0.5;
  }

  if (e.target.classList.contains("full-time-btn") && remaining >= 1) {
    subject.studiedHours += 1;
  }

  if (subject.studiedHours > subject.studyHour) {
    subject.studiedHours = subject.studyHour;
  }

  localStorage.setItem("subjects", JSON.stringify(subjects));
  renderSubjects();
}

function deleteSubject(id) {
  const subjects = getSubjects();
  const updated = subjects.filter(sub => sub.id !== id);
  localStorage.setItem("subjects", JSON.stringify(updated));
  renderSubjects();
}
