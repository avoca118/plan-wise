const now = new Date();

const formatted = now.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const addBtn = document.querySelector('.js-add-btn').addEventListener('click', () => {
  
});