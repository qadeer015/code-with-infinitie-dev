const db = require('../config/db');

class TodoSchedule {
    static async create(session_id, course_id, title, description, type, schedule_date, start_time, end_time, created_by, status = 'scheduled') {
        try {
            const [result] = await db.execute(
                `INSERT INTO todo_schedules 
                (session_id, course_id, title, description, type, schedule_date, start_time, end_time, created_by, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [session_id, course_id, title, description, type, schedule_date, start_time, end_time, created_by, status]
            );
            return result;
        } catch (error) {
            console.error("Error creating todo schedule:", error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT ts.*, c.title as course_title, c.code as course_code, u.username as created_by_name 
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
                SELECT ts.*, c.title as course_title, c.code as course_code, u.username as created_by_name 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                JOIN users u ON ts.created_by = u.id 
                WHERE ts.session_id = ? 
                ORDER BY ts.schedule_date, ts.start_time
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
                SELECT ts.*, c.title as course_title, c.code as course_code 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.course_id = ? 
                ORDER BY ts.schedule_date, ts.start_time
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
                SELECT ts.*, c.title as course_title, c.code as course_code 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.schedule_date BETWEEN ? AND ? 
                ORDER BY ts.schedule_date, ts.start_time
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
                SELECT ts.*, c.title as course_title, c.code as course_code 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.type = ? 
                ORDER BY ts.schedule_date, ts.start_time
            `, [session_id, type]);
            return rows;
        } catch (error) {
            console.error("Error fetching todo schedules by type:", error);
            throw error;
        }
    }

    static async update(id, session_id, course_id, title, description, type, schedule_date, start_time, end_time, status) {
        try {
            const [result] = await db.execute(
                `UPDATE todo_schedules 
                SET session_id = ?, course_id = ?, title = ?, description = ?, type = ?, 
                    schedule_date = ?, start_time = ?, end_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`,
                [session_id, course_id, title, description, type, schedule_date, start_time, end_time, status, id]
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
                'UPDATE todo_schedules SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
                    ts.schedule_date as start,
                    ts.start_time,
                    ts.end_time,
                    c.title as course_title,
                    c.code as course_code,
                    ts.status
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? 
                ORDER BY ts.schedule_date, ts.start_time
            `, [session_id]);

            return rows.map(item => ({
                id: item.id,
                title: `${item.course_code} - ${item.title}`,
                start: `${item.start}${item.start_time ? 'T' + item.start_time : ''}`,
                end: item.end_time ? `${item.start}T${item.end_time}` : null,
                description: item.description,
                type: item.type,
                status: item.status,
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
                SELECT ts.*, c.title as course_title, c.code as course_code 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.schedule_date >= CURDATE() AND ts.status = 'scheduled'
                ORDER BY ts.schedule_date, ts.start_time 
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
                SELECT ts.*, c.title as course_title, c.code as course_code 
                FROM todo_schedules ts 
                JOIN courses c ON ts.course_id = c.id 
                WHERE ts.session_id = ? AND ts.status = ? 
                ORDER BY ts.schedule_date, ts.start_time
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
                schedule.schedule_date,
                schedule.start_time,
                schedule.end_time,
                schedule.created_by,
                schedule.status || 'scheduled'
            ]);

            const [result] = await db.query(
                `INSERT INTO todo_schedules 
                (session_id, course_id, title, description, type, schedule_date, start_time, end_time, created_by, status) 
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