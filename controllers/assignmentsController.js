const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const formateTime = require('../middleware/formateTime');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { tr } = require('date-fns/locale');

const showCourseAssignments = async (req, res) => {
    try {
        const { course_id } = req.query;
        const token = req.cookies.token;
        const courseAssignments = await Assignment.getAssignmentsByCourseId(course_id, req.user.id);
        const assignments = courseAssignments.map(assignment => ({
            ...assignment,
            created_at: formateTime.formatRelativeTime(assignment.created_at),
            due_date: formateTime.formatDate(assignment.due_date)
        }))
        res.render("assignments", { assignments, token, viewName: 'assignments' });
    } catch (error) {
        console.error("Error retrieving assignments:", error);
        res.status(500).json({ message: 'Error retrieving assignments' });
    }
};

const getAllAssignments = async (req, res) => {
    try {
        const allAssignments = await Assignment.getAllAssignments();
        const assignments = allAssignments.map(assignment => ({
            ...assignment,
            created_at: formateTime.formatRelativeTime(assignment.created_at),
            due_date: formateTime.formatDate(assignment.due_date)
        }))
        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error retrieving assignments:", error);
        res.status(500).json({ message: 'Error retrieving assignments' });
    }
};

const getUnsubmittedAssignemntCountsByCourseId = async (req, res) => {
    try {
        const { course_id } = req.params;
        const count = await Assignment.getUnsubmittedAssignemntCountsByCourseId(course_id);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting unsubmitted assignments:", error);
        res.status(500).json({ message: 'Error getting unsubmitted assignments' });
    }
}


const createAssignment = async (req, res) => {
    try {
        const { course_id, title, details, due_date, total_marks } = req.body;

        await Assignment.createAssignment(course_id, title, details, due_date, total_marks);
        res.redirect('/users/admin/dashboard');
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: 'Error creating assignment' });
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

        // Basic validation
        if (!req.file.originalname || !req.file.mimetype) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file format'
            });
        }

        const submittedAssignment = await AssignmentSubmission.submitAssignment(
            assignmentId,
            userId,
            submissionDate,
            req.file
        );

        res.status(201).json({
            success: true,
            data: submittedAssignment,
            message: 'Assignment submitted successfully'
        });

    } catch (error) {
        console.error("Error submitting assignment:", error);

        if (req.file?.path) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (err) {
                console.error("Error cleaning up file:", err);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error submitting assignment',
            error: error.message
        });
    }
};

const getSubmittedAssignments = async (req, res) => {
    try {
        const { course_id } = req.query;
        const submittedAssignments = await AssignmentSubmission.getSubmittedAssignmentsByCourseId(course_id);

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

        const submission = assignment[0];
        let fileData;

        try {
            fileData = typeof submission.file_path === 'string'
                ? JSON.parse(submission.file_path)
                : submission.file_path;

            // Process files to handle linked resources
            if (fileData.isZip) {
                const baseUrl = `/assignments/files/${submission.id}`;
                for (const file of fileData.files) {
                    if (file.content) {
                        file.decodedContent = Buffer.from(file.content, 'base64').toString('utf-8');

                        // Rewrite resource URLs in HTML files
                        if (file.type.includes('html') || file.originalName.endsWith('.html')) {
                            file.decodedContent = rewriteResourceUrls(
                                file.decodedContent,
                                fileData.files,
                                baseUrl
                            );
                        }
                    }
                }
            }
        } catch (parseError) {
            console.error('Error parsing file_path:', submission.file_path);
            fileData = {
                originalName: 'Unknown',
                type: 'unknown',
                decodedContent: 'Could not parse file content'
            };
        }

        const formattedAssignment = {
            ...submission,
            file_data: fileData,
            submission_date: formateTime.formatDate(submission.submission_date),
            created_at: formateTime.formatDate(submission.created_at),
            due_date: formateTime.formatDate(submission.due_date),
            updated_at: formateTime.formatDate(submission.updated_at)

        };

        res.render("admin/assignment/submitted_assignment_details", {
            assignment: formattedAssignment,
            courseId: course_id
        });
    } catch (error) {
        console.error("Error retrieving assignment details:", error);
        res.status(500).json({ message: 'Error retrieving assignment details' });
    }
};

const serveSubmissionFile = async (req, res) => {
    try {
        const submission = await AssignmentSubmission.findSubmittedAssignment(req.params.submissionId);
        if (!submission || !submission[0]) {
            return res.status(404).send('File not found');
        }

        const fileData = typeof submission[0].file_path === 'string'
            ? JSON.parse(submission[0].file_path)
            : submission[0].file_path;

        if (!fileData.isZip) {
            return res.status(404).send('Not a ZIP archive');
        }

        const filename = decodeURIComponent(req.params.filename);
        const file = fileData.files.find(f =>
            f.originalName === filename ||
            f.originalName.endsWith(filename)
        );

        if (!file) {
            return res.status(404).send('File not found in archive');
        }

        if (file.isMedia && file.path) {
            return res.sendFile(path.resolve(file.path));
        }

        if (file.content) {
            res.set('Content-Type', file.type || 'application/octet-stream');
            return res.send(Buffer.from(file.content, 'base64'));
        }

        return res.status(404).send('File content not available');
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).send('Error serving file');
    }
};

function rewriteResourceUrls(htmlContent, files, baseUrl) {
    return htmlContent.replace(
        /(src|href)="([^"]*)"/g,
        (match, attr, url) => {
            // Skip absolute URLs and data URIs
            if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
                return match;
            }

            // Find matching file in the archive
            const filename = url.split('/').pop();
            const foundFile = files.find(f =>
                f.originalName.endsWith(filename) ||
                f.originalName === url ||
                f.originalName.endsWith(url)
            );

            if (foundFile) {
                return `${attr}="${baseUrl}/${encodeURIComponent(foundFile.originalName)}"`;
            }
            return match;
        }
    );
}

const gradeAssignment = async (req, res) => {
    const { user_id, assignment_id, marks } = req.body;
    try {
        const result = await AssignmentSubmission.saveGainedMarks(assignment_id, user_id, marks);

        if (result) {
            return res.status(200).json({ message: 'Marks saved successfully' });
        } else {
            return res.status(400).json({ message: 'Error saving marks' });
        }
    } catch (error) {
        console.error('Error saving marks:', error);
        return res.status(500).json({ message: 'Error saving marks' });
    }
}

module.exports = {
    showCourseAssignments,
    createAssignment,
    submitAssignment,
    getAllAssignments,
    getSubmittedAssignments,
    getSubmittedAssignmentDetails,
    serveSubmissionFile,
    gradeAssignment,
    getUnsubmittedAssignemntCountsByCourseId
};