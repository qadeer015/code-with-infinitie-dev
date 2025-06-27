document.addEventListener('DOMContentLoaded', function () {
  const videoBtn = document.getElementById('videoBtn');
  const readingBtn = document.getElementById('readingBtn');
  const videoContent = document.getElementById('videoContent');
  const readingContent = document.getElementById('readingContent');

  // Tab switching
  videoBtn.addEventListener('click', () => {
    videoContent.style.display = 'flex';
    readingContent.style.display = 'none';
    videoBtn.classList.add('btn-primary', 'active');
    videoBtn.classList.remove('btn-secondary');
    readingBtn.classList.add('btn-secondary');
    readingBtn.classList.remove('btn-primary', 'active');
  });

  readingBtn.addEventListener('click', () => {
    videoContent.style.display = 'none';
    readingContent.style.display = 'flex';
    readingBtn.classList.add('btn-primary', 'active');
    readingBtn.classList.remove('btn-secondary');
    videoBtn.classList.remove('btn-primary', 'active');
    videoBtn.classList.add('btn-secondary');
  });

});











document.addEventListener('DOMContentLoaded', function () {
  const videoBtn = document.getElementById('videoBtn');
  const readingBtn = document.getElementById('readingBtn');
  const quizzBtn = document.getElementById('quizzBtn').querySelector('button');
  const videoContent = document.getElementById('videoContent');
  const readingContent = document.getElementById('readingContent');
  
  let readingViewed = false;
  let readingTimer;

  // Tab switching
  videoBtn.addEventListener('click', () => {
    videoContent.style.display = 'flex';
    readingContent.style.display = 'none';
    videoBtn.classList.add('btn-primary', 'active');
    videoBtn.classList.remove('btn-secondary');
    readingBtn.classList.add('btn-secondary');
    readingBtn.classList.remove('btn-primary', 'active');
  });

  readingBtn.addEventListener('click', () => {
    videoContent.style.display = 'none';
    readingContent.style.display = 'flex';
    readingBtn.classList.add('btn-primary', 'active');
    readingBtn.classList.remove('btn-secondary');
    videoBtn.classList.remove('btn-primary', 'active');
    videoBtn.classList.add('btn-secondary');
    
    // Start timer for reading section
    if (!readingViewed) {
      startReadingTimer();
    }
  });

  function enableReadingButton() {
    readingBtn.disabled = false;
    readingBtn.classList.remove('btn-secondary');
    readingBtn.classList.add('btn-primary');
  }

  function enableQuizzButton() {
    quizzBtn.disabled = false;
    quizzBtn.classList.remove('btn-secondary');
    quizzBtn.classList.add('btn-primary');
  }

  function startReadingTimer() {
    // Mark reading as viewed after 5 seconds
    readingTimer = setTimeout(() => {
      readingViewed = true;
      enableQuizzButton();
      markReadingAsViewed();
    }, 5000); // 5 seconds
  }

  function markReadingAsViewed() {
    // Add class to mark reading as viewed
    readingContent.classList.add('reading-viewed');
  }
});