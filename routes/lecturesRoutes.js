const express = require('express');
const lecturesController = require('../controllers/lecturesController.js');
const quizzController = require('../controllers/quizzController.js');
const Lecture = require('../models/Lecture.js');
const Course = require('../models/Course.js');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const courseId = req.query.course_id;
    const lectures = await Lecture.findAll(courseId);
    const course = await Course.findCourse(courseId);
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


module.exports = router;