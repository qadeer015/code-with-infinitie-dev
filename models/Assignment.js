const db = require('../config/db');

class Assignment {
    static async createAssignment(course_id, title, details, due_date, total_marks) {
        try {
            const [result] = await db.execute(
                'INSERT INTO assignments (course_id, title, details, due_date, total_marks) VALUES (?, ?, ?, ?, ?)',
                [course_id, title, details, due_date, total_marks]
            );
            return result;
        } catch (error) {
            console.error("Error inserting assignment:", error);
            throw error;
        }
    }

    static async findAssignment(id) {
        try {
            const [result] = await db.execute(
                'SELECT * FROM assignments Where id = ?',
                [id]
            );
            return result;
        } catch (error) {
            console.log("Error getting assignment:", error);
            throw error;
        }
    }


    static async getAllAssignments() {
        try {
            const [rows] = await db.execute(`
            SELECT assignments.*, courses.title AS course_title 
            FROM assignments 
            INNER JOIN courses ON assignments.course_id = courses.id;
        `);
            return rows;
        } catch (error) {
            console.error("Database error in getAllAssignments:", error.message);
            throw new Error("Failed to fetch assignments. Please try again.");
        }
    }


    static async deleteAssignment(id) {
        try {
            const [result] = await db.execute('UPDATE assignments SET is_deleted = "1" WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting assignment:", error);
            throw error;
        }
    }

    static async updateAssignment(id, course_id, title, details, due_date, total_marks) {
        try {
            const [result] = await db.execute(
                'UPDATE assignments SET course_id = ?, title = ?, details = ?, due_date = ?, total_marks = ? WHERE id = ?',
                [course_id, title, details, due_date, total_marks, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating assignment:", error);
            throw error;
        }
    }

   static async getAssignmentsByCourseId(course_id) {
    try {
        const [rows] = await db.execute(
            `SELECT assignments.*, courses.title AS course_title 
            FROM assignments 
            INNER JOIN courses ON assignments.course_id = courses.id 
            WHERE assignments.course_id = ?`,
            [course_id]
        );
        return rows;
    } catch (error) {
        console.log("Error getting assignments:", error);
        throw error;
    }
}

}

module.exports = Assignment;