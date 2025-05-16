const db = require('../config/db');

class AssignmentSubmission {
    static async submitAssignment(assignment_id, user_id, submission_date, file_path, gained_marks = 0.00) {
        try {
            const [existingSubmission] = await db.execute(
                'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?',
                [assignment_id, user_id]
            );

            if (existingSubmission.length > 0) {
                // Update existing submission
                const [updateResult] = await db.execute(
                    `UPDATE assignment_submissions 
                 SET submission_date = ?, file_path = ?, status = 'submitted', gained_marks = ?
                 WHERE assignment_id = ? AND user_id = ?`,
                    [submission_date, file_path, gained_marks, assignment_id, user_id]
                );
                return updateResult;
            } else {
                // Insert new submission
                const [insertResult] = await db.execute(
                    `INSERT INTO assignment_submissions 
                (assignment_id, user_id, submission_date, file_path, status, gained_marks) 
                VALUES (?, ?, ?, ?, 'submitted', ?)`,
                    [assignment_id, user_id, submission_date, file_path, gained_marks]
                );
                return insertResult;
            }

        } catch (error) {
            console.error("Error submitting assignment:", error);
            throw error;
        }
    }


    static async findSubmittedAssignment(id) {
        try {
            const [result] = await db.execute(
                'SELECT * FROM assignment_submissions Where id = ?',
                [id]
            );
            return result;
        } catch (error) {
            console.log("Error getting submitted assignment:", error);
            throw error;
        }
    }

    static async getAllSubmittedAssignments() {
        try {
            const [result] = await db.execute('SELECT * FROM assignment_submissions');
            return result;
        } catch (error) {
            console.log("Error getting submitted assignments:", error);
            throw error;
        }
    }

    static async getSubmittedAssignmentsByCourseId(course_id) {
        try {
            const [result] = await db.execute(
                `
            SELECT asub.* 
            FROM assignment_submissions asub 
            INNER JOIN assignments a ON asub.assignment_id = a.id 
            WHERE a.course_id = ?
            `,
                [course_id]
            );
            return result;
        } catch (error) {
            console.log("Error getting assignments by course ID:", error);
            throw error;
        }
    }


}

module.exports = AssignmentSubmission;