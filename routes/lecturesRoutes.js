const express = require('express');
const lecturesController = require('../controllers/lecturesController.js');
const quizzController = require('../controllers/quizzController.js');
const Lecture = require('../models/Lecture.js');
const Course = require('../models/Course.js');
const QuizResult = require('../models/QuizResult.js');
const router = express.Router();
const db = require('../config/db');


// In your routes file (e.g., routes/quiz.js)
router.get('/stats', async (req, res) => {
    try {
        const { course_id } = req.query;
        const userId = req.user.id; // Assuming you have user authentication
        const stats = await QuizResult.getQuizStats(userId, course_id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        res.status(500).json({ error: 'Failed to fetch quiz statistics' });
    }
});

router.get("/", async (req, res) => {
  try {
    const courseId = req.query.course_id;
    const lectures = await Lecture.findAll(courseId, req.user.id);
    const course = await Course.getCourse(req.user.id, courseId);
    res.render("lectures", {
      lectures,
      course,
      viewName: 'lectures'
    });
  } catch (err) {
    console.error("Error fetching lectures or course:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id", lecturesController.showLecture);

router.get("/:id/quizz", quizzController.showQuizz);

router.post("/:id/quizz-result", quizzController.saveResults);

// In your routes file (e.g., lectures.js)
router.post('/:id/mark-viewed', async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        const lecture_id = req.params.id;
        // 2. Update view status in database
        await db.execute(`
            INSERT INTO lecture_views
                (user_id, lecture_id, is_viewed, created_at, updated_at)
            VALUES (?, ?, TRUE, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
                is_viewed = TRUE, 
                created_at = NOW(), 
                updated_at = NOW()
        `, [user_id, lecture_id]);

        res.status(200).json({ 
            success: true,
            message: 'Lecture marked as completed' 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
});



module.exports = router;