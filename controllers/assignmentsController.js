const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const formateTime = require('../middleware/formateTime');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

const showCourseAssignments = async (req, res) => {
    try {
        const { course_id } = req.query;
        const token = req.cookies.token;
        console.log('token : ', token);
        const courseAssignments = await Assignment.getAssignmentsByCourseId(course_id, req.user.id);
        const assignments = courseAssignments.map(assignment => ({
            ...assignment,
            created_at: formateTime.formatRelativeTime(assignment.created_at),
            due_date: formateTime.formatDate(assignment.due_date)
        }))
        res.render("assignments", { assignments, token });
    } catch (error) {
        console.error("Error retrieving announcements:", error);
        res.status(500).json({ message: 'Error retrieving announcements' });
    }
};


const createAssignment = async (req, res) => {
    try {
        const { course_id, title, details, due_date, total_marks } = req.body;

        await Assignment.createAssignment(course_id, title, details, due_date, total_marks);
        res.redirect('/assignments');
    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: 'Error creating announcement' });
    }
};

const submitAssignment = async (req, res) => {
    try {
        const userId = req.user.id;
        const assignmentId = req.params.id;
        const submissionDate = new Date();
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        // Handle ZIP extraction if needed
        if (req.file.mimetype === 'application/zip' || 
            req.file.mimetype === 'application/x-zip-compressed') {
            const zip = new AdmZip(req.file.path);
            const extractPath = path.dirname(req.file.path);
            zip.extractAllTo(extractPath, true);
            fs.unlinkSync(req.file.path); // Remove the zip after extraction
        }

        const fileData = {
            type: req.file.mimetype,
            path: req.file.path,
            originalName: req.file.originalname,
            size: req.file.size
        };
        
        const submittedAssignment = await AssignmentSubmission.submitAssignment(
            assignmentId, 
            userId, 
            submissionDate, 
            JSON.stringify(fileData)
        );

        res.status(201).json({
            success: true,
            data: submittedAssignment,
            message: 'Assignment submitted successfully'
        });

    } catch (error) {
        console.error("Error submitting assignment:", error);
        
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error("Error cleaning up file:", err);
            }
        }

        res.status(500).json({ 
            success: false,
            message: error.message || 'Error submitting assignment'
        });
    }
}

const getAllAssignments = async (req, res) => {
    try {
        const allAssignments = await Assignment.getAllAssignments();
        const assignments = allAssignments.map(assignment => ({
            ...assignment,
            created_at: formateRelativeTime(assignment.created_at)
        }))
        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error retrieving announcements:", error);
        res.status(500).json({ message: 'Error retrieving announcements' });
    }
};



// controllers/assignmentsController.js

const getSubmittedAssignments = async (req, res) => {
    try {
        const { course_id } = req.query;
        console.log('course_id : ', course_id);
        // Get all submitted assignments for a course
        const submittedAssignments = await AssignmentSubmission.getSubmittedAssignmentsByCourseId(course_id);
        
        // Format the data for display
       const formattedAssignments = submittedAssignments.map(assignment => ({
    ...assignment,
    submission_date: formateTime.formatDate(assignment.submission_date),
    file_path: typeof assignment.file_path === 'string' 
        ? JSON.parse(assignment.file_path) 
        : assignment.file_path
}));
        
        res.render("admin/assignment/submitted_assignments", { 
            assignments: formattedAssignments,
            courseId: course_id
        });
    } catch (error) {
        console.error("Error retrieving submitted assignments:", error);
        res.status(500).json({ message: 'Error retrieving submitted assignments' });
    }
};

const getSubmittedAssignmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id } = req.query;
        
        const assignment = await AssignmentSubmission.findSubmittedAssignment(id);
        
        if (!assignment || assignment.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        
        // Safely parse the file_path (handle both string and already-parsed cases)
        let filePathData;
        try {
            filePathData = typeof assignment[0].file_path === 'string' 
                ? JSON.parse(assignment[0].file_path) 
                : assignment[0].file_path;
        } catch (parseError) {
            console.error('Error parsing file_path:', assignment[0].file_path);
            filePathData = { 
                path: assignment[0].file_path,
                originalName: 'Unknown',
                type: 'unknown'
            };
        }
        
        const formattedAssignment = {
            ...assignment[0],
            file_path: filePathData,
            submission_date: formateTime.formatDate(assignment[0].submission_date)
        };
        
        res.render("admin/assignment/submitted_assignment_details", { 
            assignment: formattedAssignment ,
            courseId: course_id
        });
    } catch (error) {
        console.error("Error retrieving assignment details:", error);
        res.status(500).json({ message: 'Error retrieving assignment details' });
    }
};

module.exports = { showCourseAssignments, createAssignment, submitAssignment, getAllAssignments, getSubmittedAssignments, getSubmittedAssignmentDetails }
