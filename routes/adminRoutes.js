const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const coursesController = require('../controllers/coursesController.js');
const announcementsController = require('../controllers/announcementController');
const assignmentsController = require('../controllers/assignmentsController.js');
const sessionCoursesController = require('../controllers/sessionCoursesController.js');
const lecturesController = require('../controllers/lecturesController.js');
const videosController = require('../controllers/videosController');
const quizzController = require('../controllers/quizzController.js');
const instructorController = require('../controllers/instructorController.js');
const sessionController = require('../controllers/sessionController.js');
const upload = require('../middleware/cloudinaryUpload.js');


const Course = require('../models/Course');
const Video = require('../models/Video');
const Lecture = require('../models/Lecture.js')
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement.js');
const Session = require('../models/Session');

// home page
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard',{req:req.session.user || null});
});

// Students
router.get("/students",(req, res) => {
    res.render("admin/student/index");
});
router.get("/get-students",userController.getStudents);
router.post("/block/:id", userController.blockUser);
router.post("/unblock/:id", userController.unblockUser);
router.post("/delete/:id", userController.deleteUser);

// Courses
router.get("/courses", (req, res) => {res.render("admin/course/index")});
router.get("/courses/new", (req, res) => {res.render("admin/course/new")});
router.get("/courses/get-all", coursesController.getAllCourses);
router.get("/courses/:id/edit", coursesController.editCourse);
router.post("/courses/:id/update", coursesController.updateCourse);
router.post("/courses/create", coursesController.createCourse);
router.delete("/courses/:id/delete", coursesController.deleteCourse);

// session Courses
router.get("/session-courses", (req, res) => {
    res.render("admin/sessionCourse/index")
});
router.get("/session-courses/get-all", sessionCoursesController.getAllSessionCourses);
router.get("/session-courses/new", async (req, res) => { res.render("admin/sessionCourse/new", { sessions: await Session.findAll() }) });
router.post("/session-courses/create", sessionCoursesController.createSessionCourse);
router.get("/session-courses/:id", sessionCoursesController.getSessionCourse);
router.get("/session-courses/:id/edit", sessionCoursesController.editSessionCourse);
router.post("/session-courses/:id/update", sessionCoursesController.updateSessionCourse);
router.post("/session-courses/:id/delete", sessionCoursesController.deleteSessionCourse);

// Assignments
router.get("/assignments", (req, res) => {
    res.render("admin/assignment/index")
});
router.get("/assignments/submitted", assignmentsController.getSubmittedAssignments);
router.get("/assignments/submitted/:id", assignmentsController.getSubmittedAssignmentDetails);
router.get("/assignments/get-all", assignmentsController.getAllAssignments);
router.get("/assignments/new", async (req, res) => { res.render("admin/assignment/new", { courses: await Course.getAll() }) });
router.post("/assignments/create", assignmentsController.createAssignment)
router.post("/assignments/:assignmentId/users/:userId/grade", assignmentsController.gradeAssignment);
router.get("/assignments/:assignment_id/edit", async (req, res) => {
    res.render("admin/assignment/edit", { assignmentId: req.params.assignment_id, assignment: await Assignment.findAssignment(req.params.assignment_id), courses: await Course.getAll() })
})
router.post("/assignments/:assignment_id/update", assignmentsController.updateAssignment);
router.post("/assignments/:assignment_id/delete", assignmentsController.deleteAssignment);

// In your routes file
router.get('/files/:submissionId/:filename', assignmentsController.serveSubmissionFile);

// Announcements
router.get("/announcements", (req, res) => {
    res.render("admin/announcement/index")
});
router.get("/announcements/get-all", announcementsController.getAllAnnouncements);
router.get("/announcements/new", async (req, res) => { res.render("admin/announcement/new", { courses: await Course.getAll() }) });
router.post("/announcements/create", announcementsController.createAnnouncement)
router.get("/announcements/:announcement_id/edit", async (req, res) => {
    const announcement = await Announcement.findAnnouncement(req.params.announcement_id);
    res.render("admin/announcement/edit", { announcementId: req.params.announcement_id, announcement, courses: await Course.getAll() })
})
router.post("/announcements/:announcement_id/update", announcementsController.updateAnnouncement);
router.post("/announcements/:announcement_id/delete", announcementsController.deleteAnnouncement);

// Lectures
router.get("/lectures", (req, res) => {
    res.render("admin/lecture/index")
});
router.get("/lectures/get-all", lecturesController.getAllLectures);
router.get("/lectures/new", async (req, res) => {
    res.render("admin/lecture/new", { courses: await Course.getAll(), videos: await Video.getAll() })
})
router.get("/lectures/:id/edit", async (req, res) => {
    res.render("admin/lecture/edit", { lectureId: req.params.id, courses: await Course.getAll(), videos: await Video.getAll(), lecture: await Lecture.getLectureDetails(req.params.id) })
});
router.post("/lectures/create", lecturesController.createLecture);
router.post("/lectures/:id/update", lecturesController.updateLecture);
router.post("/lectures/:id/delete", lecturesController.deleteLecture);

// videos
router.get('/videos/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  try {
    const videos = await Video.searchByTitle(q);
    res.json(videos.map(video => ({
      id: video.id,
      title: video.title
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// render videos page
router.get("/videos",videosController.getAllVideos);

router.get("/videos/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).send("Video not found");
        }
        res.render("viewer", { video });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving video");
    }
});
router.post("/videos/create", videosController.createVideo);
router.post("/videos/:id/update", videosController.updateVideo);
router.post("/videos/:id/delete", videosController.deleteVideo);

// Quizz
router.get("/lectures/:id/questions", quizzController.getQuizz);
router.post("/lectures/:id/questions/create", quizzController.createQuestion);
router.post("/lectures/:id/questions/:question_id/update", quizzController.updateQuestion);
router.post("/lectures/:id/questions/:question_id/delete", quizzController.deleteQuestion);

router.post("/lectures/:id/questions/:question_id/options/create", quizzController.createOption);
router.post("/lectures/:id/options/:option_id/delete", quizzController.deleteOption);
router.post("/lectures/:lecture_id/options/:id/update", quizzController.updateOption);


// Instructors
router.get("/instructors",(req, res) => {
    res.render("admin/instructor/index");
});

// Get all instructors
router.get(
    '/get-instructors',
    instructorController.getAllInstructors
);

// Create instructor profile
router.post(
    '/:userId/instructor/create',
    upload('document'),
    instructorController.createInstructorProfile
);

// Update instructor profile
router.put(
    '/:userId/profile',
    upload('document'),
    instructorController.updateInstructorProfile
);

// Get instructor profile
router.get(
    '/:userId/profile',
    instructorController.getInstructorProfile
);

// Delete instructor profile
router.delete(
    '/:userId/profile',
    instructorController.deleteInstructorProfile
);

router.get("/sessions", (req, res) => {
    res.render("admin/session/index")
});

router.get("/sessions/get-all", sessionController.getAllSessions);
router.get("/sessions/new", async (req, res) => { res.render("admin/session/new", { courses: await Course.getAll() }) });
router.post("/sessions/create", sessionController.createSession);
router.get("/sessions/:id/edit", sessionController.editSession);
router.post("/sessions/:id/update", sessionController.updateSession);
router.post("/sessions/:id/delete", sessionController.deleteSession);


module.exports = router;