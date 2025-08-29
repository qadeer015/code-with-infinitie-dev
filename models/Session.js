const db = require('../config/db');

class Session {
    static async create(name, description, start_date, end_date, created_by, status = 'upcoming') {
        try {
            const [result] = await db.execute(
                'INSERT INTO sessions (name, description, start_date, end_date, created_by, status) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, start_date, end_date, created_by, status]
            );
            return result;
        } catch (error) {
            console.error("Error creating session:", error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT s.*, u.name as created_by_name 
                FROM sessions s 
                JOIN users u ON s.created_by = u.id 
                WHERE s.id = ?
            `, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding session:", error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const [rows] = await db.execute(`
                SELECT s.*, u.name as created_by_name 
                FROM sessions s 
                JOIN users u ON s.created_by = u.id 
                ORDER BY s.start_date DESC
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching all sessions:", error);
            throw error;
        }
    }

    static async findByStatus(status) {
        try {
            const [rows] = await db.execute(`
                SELECT s.*, u.name as created_by_name 
                FROM sessions s 
                JOIN users u ON s.created_by = u.id 
                WHERE s.status = ? 
                ORDER BY s.start_date DESC
            `, [status]);
            return rows;
        } catch (error) {
            console.error("Error fetching sessions by status:", error);
            throw error;
        }
    }

    static async update(id, name, description, start_date, end_date, status) {
        try {
            const [result] = await db.execute(
                'UPDATE sessions SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, description, start_date, end_date, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating session:", error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM sessions WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting session:", error);
            throw error;
        }
    }

    static async getSessionCourses(session_id) {
        try {
            const [rows] = await db.execute(`
                SELECT c.* 
                FROM featured_courses sc 
                JOIN courses c ON sc.course_id = c.id 
                WHERE sc.session_id = ?
            `, [session_id]);
            return rows;
        } catch (error) {
            console.error("Error fetching session courses:", error);
            throw error;
        }
    }

    static async getAvailableCoursesForSession(session_id) {
        try {
            const [rows] = await db.execute(`
                SELECT c.* 
                FROM courses c 
                WHERE c.id NOT IN (
                    SELECT course_id FROM featured_courses WHERE session_id = ?
                )
            `, [session_id]);
            return rows;
        } catch (error) {
            console.error("Error fetching available courses:", error);
            throw error;
        }
    }

    static async getSessionWithCourses(id) {
        try {
            const [session] = await db.execute('SELECT * FROM sessions WHERE id = ?', [id]);
            if (session.length === 0) return null;

            const [courses] = await db.execute(`
                SELECT c.* 
                FROM featured_courses sc 
                JOIN courses c ON sc.course_id = c.id 
                WHERE sc.session_id = ?
            `, [id]);

            return {
                ...session[0],
                courses
            };
        } catch (error) {
            console.error("Error fetching session with courses:", error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const [result] = await db.execute(
                'UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating session status:", error);
            throw error;
        }
    }

    static async getActiveSessions() {
        try {
            const [rows] = await db.execute(`
                SELECT s.*, u.name as created_by_name 
                FROM sessions s 
                JOIN users u ON s.created_by = u.id 
                WHERE s.status = 'active' 
                ORDER BY s.start_date DESC
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching active sessions:", error);
            throw error;
        }
    }

    static async validateSessionDuration(start_date, end_date) {
        try {
            const [result] = await db.execute(
                'SELECT DATEDIFF(?, ?) as diff_days',
                [end_date, start_date]
            );
            const diffDays = result[0].diff_days;
            return diffDays >= 90 && diffDays <= 180;
        } catch (error) {
            console.error("Error validating session duration:", error);
            throw error;
        }
    }
}

module.exports = Session;