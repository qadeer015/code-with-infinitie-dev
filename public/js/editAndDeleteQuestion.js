document.querySelectorAll(".delete-question").forEach(form => {
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent full-page reload

        const questionId = this.getAttribute("data-question-id");
        const actionUrl = this.getAttribute("action"); // Get API endpoint
        
        const response = await fetch(actionUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: questionId })
        });

        if (response.ok) {
            document.getElementById(`question_${questionId}`).closest("li").remove(); // Correct selector
        } else {
            const result = await response.json();
            alert("Error: " + result.message); // Show error if deletion fails
        }
    });
});


document.querySelectorAll(".edit-question-btn").forEach(button => {
    button.addEventListener("click", function () {
        const questionId = this.getAttribute("data-question-id");
        const questionTextElement = document.getElementById(`question-text-${questionId}`);
        const questionIndexContainer = document.querySelector(`#question-index-container-${questionId}`);
        // Check if an input field already exists
        if (questionTextElement.querySelector("input")) return;

        questionTextElement.classList.add("d-flex","align-itms-center","gap-1","justify-content-between");
        questionTextElement.style.width =  `calc(100% - ${questionIndexContainer.clientWidth*2}px )`
 
        // Get the current text
        const currentText = questionTextElement.textContent.trim();
        
        // Replace text with an input field
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.value = currentText;
        inputField.classList.add("form-control", "form-control-sm");
        
        // Add save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Update";
        saveButton.classList.add("btn", "btn-success", "btn-sm", "ms-2");
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("btn", "btn-secondary", "btn-sm", "ms-2");
        
        // Replace span content with input and button
        questionTextElement.innerHTML = "";
        questionTextElement.appendChild(inputField);
        questionTextElement.appendChild(saveButton);
        questionTextElement.appendChild(cancelButton);

        // Focus on input field
        inputField.focus();

        // Handle Save Click
        saveButton.addEventListener("click", async () => {
            const newText = inputField.value.trim();
            if (!newText) return alert("Question text cannot be empty!");

            // Send update request
            const response = await fetch(`/users/admin/lectures/${lectureId}/questions/${questionId}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_text: newText, question_id: questionId })
            });

            if (response.ok) {
                // Update UI
                questionTextElement.innerHTML = `${newText}`;
            } else {
                alert("Error updating question.");
            }
        });

        cancelButton.addEventListener("click",()=>{
            questionTextElement.innerHTML = `${currentText}`;
        });

        // Handle Enter Key
        inputField.addEventListener("keypress", async (event) => {
            if (event.key === "Enter") {
                saveButton.click(); // Trigger Save
            }
        });
    });
});






//edit and delete options

document.querySelectorAll(".delete-option").forEach(form => {
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent full-page reload

        const optionId = this.getAttribute("data-option-id");
        const actionUrl = this.getAttribute("action"); // Get API endpoint
        
        const response = await fetch(actionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: optionId })
        });

        if (response.ok) {
            document.getElementById(`option_${optionId}`).closest("li").remove(); // Correct selector
        } else {
            const result = await response.json();
            alert("Error: " + result.message); // Show error if deletion fails
        }
    });
});


// Use event delegation instead of direct event listeners
document.addEventListener('click', function(e) {
    // Check if the clicked element is an edit option button
    const editBtn = e.target.closest('.edit-option-btn');
    if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const optionId = editBtn.getAttribute("data-option-id");
        const optionElement = document.getElementById(`option_${optionId}`);

        // If already in edit mode, skip
        // if (optionElement.querySelector("form")) return;

        const originalHTML = optionElement.innerHTML;

        // Get existing values
        const label = optionElement.querySelector("label");
        const currentText = label?.textContent?.replace('(Correct)', '')?.trim() || "";
        const isCorrect = label?.textContent?.includes('(Correct)') || false;
        const radioInput = optionElement.querySelector("input[type='radio']");
        const radioName = radioInput?.name || "";

        // Create form
        const form = document.createElement("form");
        form.classList.add("d-flex", "align-items-center", "gap-2", "w-100", "flex-wrap");

        // Text input
        const input = document.createElement("input");
        input.type = "text";
        input.name = "option_text";
        input.value = currentText;
        input.required = true;
        input.classList.add("form-control", "form-control-sm", "w-50");

        // Select input
        const select = document.createElement("select");
        select.name = "is_correct";
        select.classList.add("form-select", "form-select-sm");

        const opt1 = new Option("Incorrect", "0", !isCorrect, !isCorrect);
        const opt2 = new Option("Correct", "1", isCorrect, isCorrect);
        select.add(opt1);
        select.add(opt2);

        // Update button
        const updateBtn = document.createElement("button");
        updateBtn.type = "submit";
        updateBtn.classList.add("btn", "btn-success", "btn-sm");
        updateBtn.textContent = "Update";

        // Cancel button
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.classList.add("btn", "btn-secondary", "btn-sm");
        cancelBtn.textContent = "Cancel";

        form.append(input, select, updateBtn, cancelBtn);
        optionElement.innerHTML = "";
        optionElement.appendChild(form);

        input.focus();

        // Handle Cancel
        cancelBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            optionElement.innerHTML = originalHTML;
        });

        // Handle Submit
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newText = input.value.trim();
            const newCorrect = select.value;

            if (!newText) return alert("Option text cannot be empty!");

            try {
                const response = await fetch(`/users/admin/lectures/${lectureId}/options/${optionId}/update`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ 
                        option_text: newText, 
                        is_correct: newCorrect 
                    })
                });

                if (response.ok) {
                    optionElement.innerHTML = `
                        <input type="radio" name="${radioName}" id="option_${optionId}" value="${newText}" class="form-check-input">
                        <label for="option_${optionId}">${newText} ${newCorrect === "1" ? "(Correct)" : ""}</label>
                        <div class="btn-group dropup">
                            <button type="button" class="bg-transparent border-0" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <button type="button" class="bg-transparent border-0 outline-0 dropdown-item edit-option-btn" data-option-id="${optionId}">
                                        <i class="bi bi-pencil"></i>
                                        Edit
                                    </button>
                                </li>
                                <li class="dropdown-item text-danger">
                                    <form class="delete-option" data-option-id="${optionId}"
                                        action="/users/admin/lectures/<%= lecture.id %>/questions/<%= question.id %>/options/${optionId}/delete"
                                        method="post">
                                        <button type="submit" class="bg-transparent border-0 outline-0">
                                            <i class="bi bi-trash"></i>
                                            Delete
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    `;
                } else {
                    throw new Error('Failed to update');
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Failed to update option.");
            }
        });
    }
});
