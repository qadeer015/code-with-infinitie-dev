const express = require('express');
const lecturesController = require('../controllers/lecturesController.js');
const quizzController = require('../controllers/quizzController.js');
const Lecture = require('../models/Lecture.js');
const Course = require('../models/Course.js');
const QuizResult = require('../models/QuizResult.js');
const UserCourse = require('../models/UserCourse.js');
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
        const userId = req.user.id;

        const lectures = await Lecture.findAll(courseId, userId);
        let course = await Course.getCourse(userId, courseId);
        // Check if all lectures are viewed and course is not already completed
        if (lectures.length > 0 &&
            lectures.every(lecture => lecture.is_viewed === 1 && lecture.is_readed === 1 && lecture.is_quizz_completed === 1) &&
            course.status !== "completed") {
            await UserCourse.completeUserCourse(courseId, "completed");
            // Refresh course data after update
            course = await Course.getCourse(userId, courseId);
        }

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

router.get("/get-all", lecturesController.getCourseLectures);

router.get("/:id", lecturesController.showLecture);

router.get("/:id/reading", lecturesController.showLectureContent);

router.get("/:id/quizz", quizzController.showQuizz);

router.post("/:id/quizz-result", quizzController.saveResults);

router.post('/:id/mark-viewed', async (req, res) => {
    try {
        const { user_id } = req.body;
        const lecture_id = req.params.id;
        // 2. Update view status in database
        await Lecture.markLectureAsViewed(lecture_id, user_id);
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

router.post('/:id/mark-readed', async (req, res) => {
    try {
        const { user_id } = req.body;
        const lecture_id = req.params.id;
        // 2. Update view status in database
        await Lecture.markLectureAsRead(lecture_id, user_id);
        res.status(200).json({
            success: true,
            message: 'Lecture content marked as readed'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.post('/:id/quizz-completed', async (req, res) => {
    try {
        const { user_id } = req.body;
        const lecture_id = req.params.id;
        // 2. Update view status in database
        await Lecture.markLectureQuizzAsCompleted(lecture_id, user_id);
        res.status(200).json({
            success: true,
            message: 'Lecture quizz marked as completed'
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