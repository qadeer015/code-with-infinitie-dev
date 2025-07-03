document.addEventListener("DOMContentLoaded", function () {
    let currentQuestionIndex = 0;
    let selectedAnswers = {};
    let nextBtn = document.getElementById("next-btn");
    let questionIndexContainer = document.getElementById("question-index");
    let totalTime = quizData.length * 60;
    let timerInterval;

    // Track if current question is answered
    let isCurrentQuestionAnswered = false;
    let quizStarted = false;

    // Get the start button and quiz content elements
    const startQuizBtn = document.getElementById("start-quiz-btn");
    const startQuizContainer = document.getElementById("start-quiz-container");
    const quizContent = document.getElementById("quiz-content");

    // Function to start the quiz
    function startQuiz() {
        quizStarted = true;
        startQuizContainer.style.display = "none";
        quizContent.style.display = "block";
        startTimer();
        loadQuestion();
    }

    startQuizBtn.addEventListener('click', function() {
                const quizResultsContainer = document.getElementById('quiz-results-container');
                if (quizResultsContainer) {
                    quizResultsContainer.style.display = 'none';
                }
                startQuiz();
            });

    function calculateTime() {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        return `${minutes} : ${seconds} s`;
    }

    function startTimer() {
        document.getElementById("timer").textContent = calculateTime();
        timerInterval = setInterval(() => {
            if (totalTime <= 0) {
                clearInterval(timerInterval);
                showAlert("Time is up! Submitting the quiz...");
                submitQuiz();
                return;
            }
            totalTime--;
            document.getElementById("timer").textContent = calculateTime();
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function calculateResults() {
        let correctAnswers = 0;
        let totalQuestions = quizData.length;

        quizData.forEach((question) => {
            let selectedOptionId = selectedAnswers[question.id];

            if (selectedOptionId) {
                let selectedOption = question.options.find(option => option.id == selectedOptionId);
                if (selectedOption && selectedOption.is_correct) {
                    correctAnswers++;
                }
            }
        });

        return {
            correctAnswers,
            totalQuestions,
            score: ((correctAnswers / totalQuestions) * 100).toFixed(2) + "%"
        };
    }
    function submitQuiz() {
        stopTimer();
        let results = calculateResults();
        showAlert(`Your quiz has been submitted successfully.`);
        let quizResultsData = {
            user_id: userId,
            course_id: courseId,
            lecture_id: lectureId,
            total_marks: quizData.length,
            score: results.correctAnswers,
            answers: selectedAnswers
        };

        fetch("/lectures/" + lectureId + "/quizz-result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quizResultsData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    markLectureQuizzAsCompleted();
                    window.location.href = `/lectures/${lectureId}/quizz?course_id=${courseId}`;
                } else {
                    alert("Error saving results. Please try again.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while submitting the quiz. Please try again.");
            });
    }

    function loadQuestion() {
        if (!quizStarted) return;

        let question = quizData[currentQuestionIndex];
        document.getElementById("question-text").innerText = question.question_text;

        let optionsContainer = document.getElementById("options-container");
        optionsContainer.innerHTML = "";

        questionIndexContainer.innerText = "Question " + (currentQuestionIndex + 1) + " of " + quizData.length;

        // Check if current question is answered
        isCurrentQuestionAnswered = !!selectedAnswers[question.id];

        // Update next button state
        updateNextButtonState();

        question.options.forEach(option => {
            let listItem = document.createElement("li");
            listItem.classList.add("list-group-item", "p-3", "rounded-0", "d-flex", "align-items-center", "gap-1");

            let radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "question_" + question.id;
            radioInput.id = "option_" + option.id;
            radioInput.value = option.id;
            radioInput.classList.add("form-check-input");

            if (selectedAnswers[question.id] == option.id) {
                radioInput.checked = true;
            }

            radioInput.addEventListener("change", () => {
                selectedAnswers[question.id] = option.id;
                isCurrentQuestionAnswered = true;
                updateNextButtonState();

                // For the last question, check if all are answered
                if (currentQuestionIndex === quizData.length - 1) {
                    nextBtn.disabled = !allQuestionsAnswered();
                }
            });

            let label = document.createElement("label");
            label.setAttribute("for", "option_" + option.id);
            label.innerText = option.option_text;

            listItem.appendChild(radioInput);
            listItem.appendChild(label);
            optionsContainer.appendChild(listItem);
        });
    }

    function updateNextButtonState() {
        if (currentQuestionIndex < quizData.length - 1) {
            nextBtn.textContent = "Save & Next";
            nextBtn.disabled = !isCurrentQuestionAnswered;
        } else {
            nextBtn.textContent = "Submit";
            nextBtn.disabled = !allQuestionsAnswered();
        }
    }

    nextBtn.addEventListener("click", () => {
        if (!nextBtn.disabled) {
            loadNextQuestion();
        }
    });

    function allQuestionsAnswered() {
        return quizData.every(question => selectedAnswers[question.id]);
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" && isCurrentQuestionAnswered) {
            loadNextQuestion();
        }
    });

    function loadNextQuestion() {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            if (allQuestionsAnswered() && confirm("Are you sure you want to submit the quiz?")) {
                submitQuiz();
            }
        }
    }

    loadQuestion();
});


function markLectureQuizzAsCompleted() {
    fetch(`/lectures/${lectureId}/quizz-completed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    })
      .then(res => {
        if (res.ok) {
            console.log("Lecture quizz marked as completed");
        } else {
          console.error("[❌] Failed to mark lecture.");
        }
      })
      .catch(err => {
        console.error("[❌] Error marking lecture:", err);
      });
  }