const db = require('../config/db');

class Course {
    static async createCourse(title, description, course_duration, course_fee, status) {
        try {
            const [result] = await db.execute(
                'INSERT INTO courses (title, description, course_duration, course_fee, status) VALUES (?, ?, ?, ?, ?)',
                [title, description, course_duration, course_fee, status]
            );
            return result;
        } catch (error) {
            console.error("Error inserting course:", error);
            throw error;
        }
    }

    static async findAll(user_id) {
        try {
            const [rows] = await db.execute(`
            SELECT 
                c.id, 
                c.title, 
                c.description,
                c.ratting,
                c.course_duration,
                c.course_fee,
                c.status AS course_status,
                c.created_at,
                c.updated_at,
                uc.status 
            FROM courses c 
            LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
            ORDER BY c.id ASC
        `, [user_id]);
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM courses ORDER BY id ASC');
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async findCourse(id) {
        try {
            const [result] = await db.execute(
                'SELECT * FROM courses Where id = ?',
                [id]
            );
            return result[0];
        } catch (error) {
            console.log("Error getting course:", error);
            throw error;
        }
    }

     static async getCount() {
        try {
            const result = await db.execute('SELECT COUNT(id) AS courses_count  FROM courses');
            return result[0];
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async getCourse(userId, courseId) {
        try {
            const [result] = await db.execute(
                `SELECT c.*, uc.progress , uc.status
             FROM courses c
             LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
             WHERE c.id = ?`,
                [userId, courseId]
            );
            return result[0];
        } catch (error) {
            console.log("Error getting course:", error);
            throw error;
        }
    }

    static async deleteCourse(id) {
        try {
            const [result] = await db.execute('DELETE FROM courses WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting course:", error);
            throw error;
        }
    }

    static async updateCourse(id, title, description, course_duration, course_fee, status) {
        try {
            const [result] = await db.execute(
                'UPDATE courses SET title = ?, description = ?, course_duration = ?, course_fee = ?, status = ? WHERE id = ?',
                [title, description, course_duration, course_fee, status, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating Course:", error);
            throw error;
        }
    }

    static async getUserCourses(userId) {
        try {
            const [courses] = await db.execute(
            `SELECT c.*, uc.status AS enrollment_status, ( SELECT COUNT(*) FROM assignments a LEFT JOIN assignment_submissions asub 
            ON a.id = asub.assignment_id AND asub.user_id = ?
            WHERE a.course_id = c.id AND (asub.id IS NULL OR (asub.status = 'pending' AND a.due_date > NOW())) ) AS unsubmitted_count,
            ( SELECT COUNT(*) FROM announcements ann WHERE ann.course_id = c.id ) AS announcements_count
            FROM courses c
            JOIN user_courses uc ON c.id = uc.course_id
            WHERE uc.user_id = ?`,
                [userId, userId]
            );
            return courses;
        } catch (error) {
            console.error("Error getting user courses:", error);
            throw error;
        }
    }

}
module.exports = Course;