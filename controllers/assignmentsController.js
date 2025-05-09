const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { format } = require('date-fns');
require('dotenv').config();

// Function to format timestamp
function formatTimestamp(timestamp) {
    return format(new Date(timestamp), "MMMM dd, yyyy hh:mm a");
}

const createAssignment = async (req, res) => {
    try {
        const { course_id, title, details, due_date, total_marks } = req.body;

        await Assignment.createAssignment(course_id,title,details,due_date,total_marks);
        res.redirect('/assignments');
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Error creating announcement' });
    }
};

const submitAssignment = async (req, res) =>{
    try {
        const { userId, assignmentId, filePath } = req.body;

        const submitedAssignment = await AssignmentSubmission.submitAssignment( assignmentId, userId, new Date(), filePath);
        res.status(201).json(submitedAssignment);
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Error creating announcement' });
    }
}

module.exports = { createAssignment, submitAssignment };
