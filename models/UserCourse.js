const db = require('../config/db');

class UserCourse {
    static async joinCourse(user_id, course_id, enrollment_date, status = 'enrolled') {
        try {
            console.log(user_id, course_id, enrollment_date, status);
            const [result] = await db.execute(
                'INSERT INTO user_courses (user_id, course_id, enrollment_date, status) VALUES (?, ?, ?, ?)',
                [user_id, course_id, enrollment_date, status]
            );
            return result;
        } catch (error) {
            console.error("Error inserting user courses:", error);
            throw error;
        }
    }

    static async findUserCourses(user_id) {
        try {
            const [result] = await db.execute(
                `
            SELECT 
                c.id AS course_id,
                c.title,
                c.description,
                c.course_duration,
                c.course_fee,
                c.status AS course_status,
                c.created_at,
                c.updated_at,
                uc.enrollment_date,
                uc.status AS enrollment_status
            FROM user_courses uc
            INNER JOIN courses c ON uc.course_id = c.id
            WHERE uc.user_id = ? AND uc.status = 'enrolled'
            `,
                [user_id]
            );
            return result;
        } catch (error) {
            console.log("Error getting user courses:", error);
            throw error;
        }
    }



    static async deleteUserCourse(id) {
        try {
            const [result] = await db.execute('DELETE FROM user_courses WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting user courses:", error);
            throw error;
        }
    }

    static async updateUserCourse(id, user_id, course_id, status) {
        try {
            const [result] = await db.execute(
                'UPDATE user_courses SET user_id = ?, course_id = ? status = ? WHERE id = ?',
                [user_id, course_id, status, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating user courses:", error);
            throw error;
        }
    }

    static async dropUserCourse(course_id, status = 'dropped') {
        try {
            const [result] = await db.execute(
                'UPDATE user_courses SET status = ? WHERE course_id = ?',
                [status, course_id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error dropping user courses:", error);
            throw error;
        }
    }

    static async completeUserCourse(course_id, status = 'completed') {
        try {
            const [result] = await db.execute(
                'UPDATE user_courses SET status = ? WHERE course_id = ?',
                [status, course_id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error completing user courses:", error);
            throw error;
        }
    }


    static async getUserAssignmentsByCourse(user_id, course_id) {
        try {
            const [result] = await db.execute(
                `
            SELECT 
                a.id AS assignment_id,
                a.title,
                a.details,
                a.due_date,
                a.total_marks,
                COALESCE(asub.status, 'pending') AS status
            FROM assignments a
            INNER JOIN user_courses uc ON uc.course_id = a.course_id
            LEFT JOIN assignment_submissions asub 
                ON asub.assignment_id = a.id AND asub.user_id = ?
            WHERE uc.user_id = ? AND uc.course_id = ?
            `,
                [user_id, user_id, course_id]
            );
            return result;
        } catch (error) {
            console.error("Error fetching user assignments by course:", error);
            throw error;
        }
    }

    static async getCompletedCourses(user_id) {
        try {
            const [result] = await db.execute(
                `
            SELECT 
                c.id AS course_id,
                c.title,
                c.description,
                c.course_duration,
                c.course_fee,
                c.status AS course_status,
                c.created_at,
                c.updated_at,
                uc.enrollment_date,
                uc.status AS enrollment_status
            FROM user_courses uc
            INNER JOIN courses c ON uc.course_id = c.id
            WHERE uc.user_id = ? AND uc.status = 'completed'
            `,
                [user_id]
            );
            return result;
        } catch (error) {
            console.log("Error getting completed courses:", error);
            throw error;
        }
    }

}
module.exports = UserCourse;