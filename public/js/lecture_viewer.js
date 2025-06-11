document.addEventListener('DOMContentLoaded', function () {
    const videoBtn = document.getElementById('videoBtn');
    const readingBtn = document.getElementById('readingBtn');
    const videoContent = document.getElementById('videoContent');
    const readingContent = document.getElementById('readingContent');

    videoBtn.addEventListener('click', function () {
        videoContent.style.display = 'flex';
        readingContent.style.display = 'none';
        videoBtn.classList.add('btn-primary');
        videoBtn.classList.remove('btn-outline-secondary');
        readingBtn.classList.add('btn-outline-secondary');
        readingBtn.classList.remove('btn-primary');
    });

    readingBtn.addEventListener('click', function () {
        videoContent.style.display = 'none';
        readingContent.style.display = 'flex';
        readingBtn.classList.add('btn-primary');
        readingBtn.classList.remove('btn-outline-secondary');
        videoBtn.classList.add('btn-outline-secondary');
        videoBtn.classList.remove('btn-primary');
    });
});