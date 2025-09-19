const db = require('../config/db');

class TodoSchedule {
    static async create(session_id, course_id, title, description, type, start_date, end_date, created_by, status = 'scheduled') {
        try {
            const [result] = await db.execute(
                `INSERT INTO todo_schedules 
                (session_id, course_id, title, description, type, start_date, end_date, created_by, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [session_id, course_id, title, description, type, start_date, end_date, created_by, status]
            );
            return result;
        } catch (error) {
            console.error("Error creating todo schedule:", error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title, u.name as created_by_name, s.name as session_name 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                JOIN users u ON ts.created_by = u.id
                JOIN sessions s ON ts.session_id = s.id
                ORDER BY ts.start_date, ts.end_date
            `);
            return rows;
        } catch (error) {
            console.error("Error fetching all todo schedules:", error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title, u.name as created_by_name 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                JOIN users u ON ts.created_by = u.id 
                WHERE ts.id = ?
            `, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding todo schedule:", error);
            throw error;
        }
    }

    static async findBySession(session_id) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title, u.name as created_by_name 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                JOIN users u ON ts.created_by = u.id 
                WHERE ts.session_id = ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id]);
            return rows;
        } catch (error) {
            console.error("Error fetching todo schedules by session:", error);
            throw error;
        }
    }

    static async findBySessionAndCourse(session_id, course_id) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.course_id = ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id, course_id]);
            return rows;
        } catch (error) {
            console.error("Error fetching todo schedules by session and course:", error);
            throw error;
        }
    }

    static async findByDateRange(session_id, start_date, end_date) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.start_date BETWEEN ? AND ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id, start_date, end_date]);
            return rows;
        } catch (error) {
            console.error("Error fetching todo schedules by date range:", error);
            throw error;
        }
    }

    static async findByType(session_id, type) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.type = ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id, type]);
            return rows;
        } catch (error) {
            console.error("Error fetching todo schedules by type:", error);
            throw error;
        }
    }

    static async update(id, session_id, course_id, title, description, type, start_date, end_date, status) {
        try {
            const [result] = await db.execute(
                `UPDATE todo_schedules 
                SET session_id = ?, course_id = ?, title = ?, description = ?, type = ?, 
                    start_date = ?, end_date = ?, status = ? 
                WHERE id = ?`,
                [session_id, course_id, title, description, type, start_date, end_date, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating todo schedule:", error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM todo_schedules WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting todo schedule:", error);
            throw error;
        }
    }

    static async deleteBySession(session_id) {
        try {
            const [result] = await db.execute('DELETE FROM todo_schedules WHERE session_id = ?', [session_id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting todo schedules by session:", error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const [result] = await db.execute(
                'UPDATE todo_schedules SET status = ? WHERE id = ?',
                [status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating todo schedule status:", error);
            throw error;
        }
    }

    static async getCalendarEvents(session_id) {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    ts.id,
                    ts.title,
                    ts.description,
                    ts.type,
                    ts.start_date,
                    ts.end_date,
                    c.title as course_title,
                    ts.status,
                    ts.course_id
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id]);

            return rows.map(item => ({
                id: item.id,
                title: `${item.course_title} - ${item.title}`,
                start: item.start_date,
                end: item.end_date,
                description: item.description,
                type: item.type,
                status: item.status,
                course_id: item.course_id,
                className: `event-${item.type} event-${item.status}`
            }));
        } catch (error) {
            console.error("Error fetching calendar events:", error);
            throw error;
        }
    }

    static async getUpcomingEvents(session_id, limit = 10) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? 
                  AND ts.start_date >= NOW() 
                  AND ts.status = 'scheduled'
                ORDER BY ts.start_date 
                LIMIT ?
            `, [session_id, limit]);
            return rows;
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            throw error;
        }
    }

    static async getEventsByStatus(session_id, status) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.status = ? 
                ORDER BY ts.start_date, ts.end_date
            `, [session_id, status]);
            return rows;
        } catch (error) {
            console.error("Error fetching events by status:", error);
            throw error;
        }
    }

    static async bulkCreate(schedules) {
        try {
            const values = schedules.map(schedule => [
                schedule.session_id,
                schedule.course_id,
                schedule.title,
                schedule.description,
                schedule.type,
                schedule.start_date,
                schedule.end_date,
                schedule.created_by,
                schedule.status || 'scheduled'
            ]);

            const [result] = await db.query(
                `INSERT INTO todo_schedules 
                (session_id, course_id, title, description, type, start_date, end_date, created_by, status) 
                VALUES ?`,
                [values]
            );
            return result;
        } catch (error) {
            console.error("Error bulk creating todo schedules:", error);
            throw error;
        }
    }
}

module.exports = TodoSchedule;
