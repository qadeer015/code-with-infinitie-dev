
document.addEventListener("DOMContentLoaded", function () {
    const lecturesMenu = document.getElementById("lectures-menu");
    const course = document.getElementById("course-data").textContent;
    const courseId = JSON.parse(course).id;
    fetch(`/lectures/get-all?course_id=${courseId}`)
        .then(res => res.json())
        .then(data => {
            lecturesMenu.innerHTML = ''; // Clear existing
             let currentLectureIndex = 0;
            for(let i = 0; i < data.length; i++) {
              if(!(data[i].is_viewed && data[i].is_readed && data[i].is_quizz_completed)) {
                currentLectureIndex = i;
                break;
              }
            }
            data.forEach((lecture, index) => {
                const isComplete = lecture.is_viewed && lecture.is_readed && lecture.is_quizz_completed;
                const borderClass = isComplete ? 'border-success bg-secondary' : 'border-secondary-subtle bg-primary';

                const li = document.createElement("li");
                li.className = "list-group-item bg-transparent border-0 outline-0 position-relative p-0";

                li.innerHTML = `
          <div class="d-flex align-items-center mb-1" ${ index === currentLectureIndex ? '' : 'disabled' }>
            <form action="/lectures/${lecture.id}" method="get">
              <input type="hidden" name="course_id" value="${courseId}">
              <button type="submit" ${ index === currentLectureIndex ? '' : 'disabled' } class="btn bg-transparent border-0 outline-0 text-muted text-truncate d-flex align-items-center gap-2 p-0" style="max-width: 300px;">
                <span class="badge rounded-circle top-0 border border-3 d-flex align-items-center justify-content-center ${borderClass}" style="width: 30px; height: 30px; font-size: 20px;">
                  <i class="bi bi-play"></i>
                </span>
                ${lecture.title}
              </button>
            </form>
          </div>

          ${ index === currentLectureIndex ? `
          <div class="current-lecture-indicator bg-secondary rounded-circle position-absolute d-flex align-items-center justify-content-center" 
         style="width: 20px; height: 20px; top: 5px; left: 5px; transition: all 0.3s ease; z-index: 1000;">
         <img src="/img/favicon/infinitidev.png" alt="logo" width="15px">
        </div>
          ` : '' }
        `;

                lecturesMenu.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Error fetching lectures:", err);
            lecturesMenu.innerHTML = `<li class="text-danger px-3">Error loading lectures</li>`;
        });
});
