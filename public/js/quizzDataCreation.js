

const submitButton = document.getElementById("predefined-questions-button");
const data = [];
const questionDataMap = new Map();


submitButton.addEventListener("click", () => {
   
    const predefinedQuestionsText = document.getElementById("predefined-questions").value;
    if(predefinedQuestionsText === '') return showAlert('Please enter some questions data in JSON format.');
    const predefinedQuestionsContainer = document.getElementById("predefined-questions-container");
    predefinedQuestionsContainer.remove();
    try {
        // Parse the JSON input
        const parsedQuestions = JSON.parse(predefinedQuestionsText);
        
        // If it's a single question object, wrap it in an array
        const questionsArray = Array.isArray(parsedQuestions) ? parsedQuestions : [parsedQuestions];
        
        // Clear existing data and add new questions
        data.length = 0;
        data.push(...questionsArray);
        
        // Refresh the display
        displayJsonQuestions();
        
        showToast('Questions loaded successfully!');
    } catch (error) {
        console.error('Error parsing JSON:', error);
        showToast('Invalid JSON format. Please check your input.', 'danger');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    displayJsonQuestions();
});

// Rest of your existing code (displayJsonQuestions, createQuestionWithOptions, etc.) remains the same

function displayJsonQuestions() {
    const jsonQuestionsContainer = document.getElementById('json-questions-container');
    jsonQuestionsContainer.innerHTML = ''; // Clear existing content

    data.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'card mb-3';

        const buttonId = `question-btn-${question.id}`;

        questionDiv.innerHTML = `
            <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${index + 1}. ${question.question_text}</h5>
                <button class="btn btn-sm btn-primary create-question-btn" 
                         id="${buttonId}" >
                    Create
                </button>
            </div>
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    ${question.options.map(option => `
                        <li class="list-group-item d-flex align-items-center">
                            <input type="radio" class="form-check-input me-2" 
                                   ${option.is_correct ? 'checked' : ''} disabled>
                            ${option.option_text}
                            ${option.is_correct ? '<span class="badge bg-success ms-2">Correct</span>' : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        jsonQuestionsContainer.appendChild(questionDiv);
        questionDataMap.set(buttonId, question);
    });
    
    // Add event listeners to all create buttons
    document.querySelectorAll('.create-question-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const questionData = questionDataMap.get(this.id);
            await createQuestionWithOptions(questionData, this.id);
        });
    });
}

async function createQuestionWithOptions(questionData, buttonId) {
    try {

        // 1. Create the question
        const questionResponse = await fetch(`/users/admin/lectures/${lectureId}/questions/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                question_text: questionData.question_text,
                lecture_id: lectureId 
            })
        });
        
        const questionResult = await questionResponse.json();
        
        if (questionResult.success && questionResult.question) {
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                const cardElement = buttonElement.closest('.card');
                if (cardElement) {
                    cardElement.remove();
                }
            }
            // 2. Create the question UI element
            let li = document.createElement("li");
            li.classList.add("list-group-item", "bg-primary-subtle", "rounded-0", "mb-2");
            li.innerHTML = `
                <div id="question_${questionResult.question.id}" class="border border-1 border-dark p-3 d-flex align-items-center justify-content-between">
                    <strong>${questionResult.question.index} : ${questionResult.question.question_text}</strong>
                </div> 
                <h5 class="mt-3">Options</h5>
                <ul class="list-group" id="options-container-${questionResult.question.id}" data-option-count="0"></ul>
                
                <!-- Form to create an option -->
                <form class="option-form" action="/users/admin/lectures/${lectureId}/questions/${questionResult.question.id}/options/create" method="post">
                    <input type="text" name="option_text" class="form-control mt-3" placeholder="Enter Option text" required>
                    <select name="is_correct" class="form-select mt-3">
                        <option value="0">Incorrect</option>
                        <option value="1">Correct</option>
                    </select>
                    <div class="text-end mb-2">
                        <button type="submit" class="btn btn-sm btn-primary mt-3">Add Option</button>
                    </div>
                </form>
            `;
            
            document.getElementById("questions-container").appendChild(li);
            document.getElementById("questions-container").scrollTop = document.getElementById("questions-container").scrollHeight;
            
            // 3. Create all options for this question
            const optionsContainer = document.getElementById(`options-container-${questionResult.question.id}`);
            const optionForm = li.querySelector(".option-form");
            
            // Disable the form while we're adding options
            optionForm.style.display = 'none';
            
            for (const option of questionData.options) {
                const optionResponse = await fetch(optionForm.action, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        option_text: option.option_text,
                        is_correct: option.is_correct,
                        question_id: questionResult.question.id
                    })
                });
                
                const optionResult = await optionResponse.json();
                
                if (optionResult.success && optionResult.option) {
                    let optionCount = parseInt(optionsContainer.getAttribute("data-option-count")) || 0;
                    
                    let optionLi = document.createElement("li");
                    optionLi.classList.add("list-group-item", "rounded-0", "d-flex", "align-items-center", "gap-1");
                    optionLi.innerHTML = `
                        <input type="radio" name="question_${questionResult.question.id}" id="option_${optionResult.option.id}" 
                               value="${optionResult.option.id}" class="form-check-input" ${option.is_correct ? 'checked' : ''}>
                        <label for="option_${optionResult.option.id}" class="form-check-label">
                            ${optionResult.option.option_text} ${optionResult.option.is_correct ? '(Correct)' : ''}
                        </label>
                    `;
                    
                    optionsContainer.appendChild(optionLi);
                    optionCount++;
                    optionsContainer.setAttribute("data-option-count", optionCount);
                }
            }
            
            // Remove the form if we've added all options
            if (questionData.options.length >= 4) {
                optionForm.remove();
            } else {
                optionForm.style.display = 'block';
            }
            
            // Attach event listener for the option form
            attachOptionFormListener(optionForm);
            
            // Show success message
            showToast('Question and options created successfully!');
            
        } else {
            console.error('Failed to create question:', questionResult);
            showToast('Failed to create question. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Error creating question:', error);
        showToast('An error occurred while creating the question.', 'danger');
    }
}

// Helper function to show toast messages
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex my-1">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '11';
    document.body.appendChild(container);
    return container;
}


const copyFormateBtn = document.getElementById("copyFormate");
copyFormateBtn.addEventListener("click",copyToClipboard);

function copyToClipboard() {
    const text = document.getElementById('predefined-questions-formate').value;
    navigator.clipboard.writeText(text)
      .then(() => {
        showAlert('Text copied to clipboard!')
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }