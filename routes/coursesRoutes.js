const express = require('express');
const coursesController = require('../controllers/coursesController.js');
const Session = require('../models/Session');
const SessionCourse = require('../models/SessionCourse');
const router = express.Router();

router.get("/", async (req, res) => {
    const activeSession = await Session.getActiveSession();
    if(activeSession) {
        const courses = await SessionCourse.getAll(activeSession.id, req.user.id);
        console.log(activeSession)
        res.render("courses", {courses, currentSession: activeSession, viewName: 'courses'});
    }else{
        const courses = [];
        res.render("courses", {courses, currentSession: null, viewName: 'courses'});
    }
});
router.post("/:id/join",coursesController.joinCourse)
router.post("/get-assignments",coursesController.getAssignmentsForUserCourse)

module.exports = router;