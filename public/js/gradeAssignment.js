const gradeForm = document.getElementById('gradeForm');
gradeForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const marksInput = document.getElementById('marks');
    const marks = parseFloat(marksInput.value);
    const feedbackInput = document.getElementById('feedback');
    const feedback = feedbackInput.value.trim();
    const assignmentId = document.querySelector('input[name="assignment_id"]').value;
    const userId = document.querySelector('input[name="user_id"]').value;

    // Validation
    if (isNaN(marks)) {
        showAlert('Please enter a valid number for marks.', 'danger');
        return;
    }

    if (marks < 0 || marks > 10) {
        showAlert('Marks must be between 0 and 10.', 'danger');
        return;
    }

    if (feedback.length > 100) {
        showAlert('Feedback should not exceed 100 characters.', 'danger');
        return;
    }

    try {
        // Send the request
        const response = await fetch(gradeForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assignment_id: assignmentId,
                user_id: userId,
                marks: marks,
                feedback: feedback,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Grade submitted successfully!', 'success');
            // You can optionally reset the form here if needed
            // gradeForm.reset();
        } else {
            showAlert(result.message || 'Failed to submit grade.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('An error occurred while submitting the grade.', 'danger');
    }
});