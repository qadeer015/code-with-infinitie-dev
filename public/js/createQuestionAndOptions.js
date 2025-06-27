
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".option-form").forEach(attachOptionFormListener);
});

// Function to handle option form submission dynamically
function attachOptionFormListener(form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const optionText = form.querySelector(`input[name="option_text"]`).value;
        const isCorrect = form.querySelector(`select[name="is_correct"]`).value;
        const questionId = form.action.split('/').slice(-2, -1)[0]; // Extract question ID
        const option = { option_text: optionText, is_correct: isCorrect };
        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(option),
            });

            const text = await response.text();
            const data = JSON.parse(text);

            if (data.success && data.option) {
                let optionsContainer = document.getElementById(`options-container-${questionId}`);
                let optionCount = parseInt(optionsContainer.getAttribute("data-option-count")) || 0;

                let li = document.createElement("li");
                li.classList.add("list-group-item", "rounded-0", "d-flex", "align-items-center", "gap-1");
                li.innerHTML = `
          <input type="radio" name="question_${questionId}" id="option_${data.option.id}" value="${data.option.id}" class="form-check-input">
          <label for="option_${data.option.id}" class="form-check-label">${data.option.option_text} ${data.option.is_correct ? '(Correct)' : ''}</label>
      `;

                optionsContainer.appendChild(li);
                optionCount++;

                // Update option count in data attribute
                optionsContainer.setAttribute("data-option-count", optionCount);

                // Reset form fields
                form.querySelector(`input[name="option_text"]`).value = "";
                form.querySelector(`select[name="is_correct"]`).value = "0";

                // Remove form if 4 options are added
                if (optionCount >= 4) {
                    form.remove();
                }
            } else {
                console.error("Invalid response format", data);
            }
        } catch (error) {
            console.error(error);
        }
    });
}
