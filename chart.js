import { getSubjects } from "./script.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.9/esm/index.js'; 

let doughnutChart;
let barChart;

document.addEventListener("DOMContentLoaded", function () {

  // doughnut chart
  const doughnutCtx = document.getElementById('doughnut-chart');
  const subjects = getSubjects();
  const labels = subjects.map(s => s.name);
  const studiedHours = subjects.map(s => s.studiedHours);

  doughnutChart = new Chart(doughnutCtx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: studiedHours,
        backgroundColor: [
          '#F19BA7',
          '#f7f5ab',
          '#A1E2EE',
          '#A0FC8C',
          '#F7CAA0',
          '#B9B9FA'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // bar chart
  const barCtx = document.getElementById('bar-chart');
  const last7Days = [];
  const studiedPerDay = [];

  for (let i = 6; i >= 0; i--) {
    const day = dayjs().subtract(i, 'day');
    last7Days.push(day.format('MM-DD'));

    let total = 0;
    subjects.forEach(subject => {
      const studyDate = subject.lastStudiedDate ? dayjs(subject.lastStudiedDate) : dayjs(subject.createdAt);
      if (studyDate.isSame(day, 'day')) {
        total += subject.studiedHours || 0;
      }
    });

    studiedPerDay.push(total);
  }

  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: last7Days,
      datasets: [{
        label: "Studied Hours",
        data: studiedPerDay,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

});

export function updateDoughnutChart() {
  const subjects = getSubjects();

  doughnutChart.data.labels = subjects.map(s => s.name);
  doughnutChart.data.datasets[0].data = subjects.map(s => s.studiedHours);
  doughnutChart.update();
}

export function updateBarChart() {
  const subjects = getSubjects();
  const last7Days = [];
  const studiedPerDay = [];

  for (let i = 6; i >= 0; i--) {
    const day = dayjs().subtract(i, 'day');
    last7Days.push(day.format('MM-DD'));

    let total = 0;
    subjects.forEach(subject => {
      const studyDate = subject.lastStudiedDate ? dayjs(subject.lastStudiedDate) : dayjs(subject.createdAt);
      if (studyDate.isSame(day, 'day')) {
        total += subject.studiedHours || 0;
      }
    });

    studiedPerDay.push(total);
  }

  barChart.data.labels = last7Days;
  barChart.data.datasets[0].data = studiedPerDay;
  barChart.update();
}