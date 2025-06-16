const express = require('express');
const assignmentsController = require('../controllers/assignmentsController.js');
const singleUpload = require('../middleware/uploadAssignment.js');
const router = express.Router();
const db = require('../config/db');

router.get("/", assignmentsController.showCourseAssignments);

router.get("/:course_id/unsubmitted-count", assignmentsController.getUnsubmittedAssignemntCountsByCourseId);

router.post("/:id/submit",singleUpload,assignmentsController.submitAssignment);

// In your routes file
router.get('/stats', async (req, res) => {
    try {
        const courseId = req.query.course_id;
        
        // Get total assignments for the course
        const [totalAssignments] = await db.execute(
            'SELECT COUNT(*) as count FROM assignments WHERE course_id = ?',
            [courseId]
        );
        
        // Get submitted assignments for the current user
        const [submittedAssignments] = await db.execute(
            `SELECT COUNT(DISTINCT a.id) as count 
             FROM assignments a
             JOIN assignment_submissions s ON a.id = s.assignment_id
             WHERE a.course_id = ? AND s.user_id = ? AND s.status != 'pending'`,
            [courseId, req.user.id] // assuming you have user authentication
        );
        
        res.json({
            total: totalAssignments[0].count,
            submitted: submittedAssignments[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch assignment stats' });
    }
});

module.exports = router;