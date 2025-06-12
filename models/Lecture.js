const db = require('../config/db');

class Lecture {
    static async createLecture(title, course_id, video_id, description, tasks, notes, status) {
        try {
            const [result] = await db.execute(
                'INSERT INTO lectures (title, course_id, video_id, description, tasks, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, course_id, video_id, description, tasks, notes, status]
            );
            return result;
        } catch (error) {
            console.error("Error inserting lecture:", error);
            throw error;
        }
    }

    static async findAll(course_id) {
        try {
            const [rows] = await db.execute(`
            SELECT 
                l.id, 
                l.title, 
                l.video_id, 
                v.title as video_title,
                c.title as course_title,
                l.description,
                l.status,
                l.created_at,
                l.updated_at,
                COUNT(lc.id) as comment_count
            FROM lectures l 
            LEFT JOIN videos v ON l.video_id = v.id
            LEFT JOIN courses c ON l.course_id = c.id
            LEFT JOIN lecture_comments lc ON l.id = lc.lecture_id
            WHERE l.course_id = ?
            GROUP BY l.id, l.title, l.video_id, v.title, c.title, l.description, l.status, l.created_at, l.updated_at
        `, [course_id]);
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async getLectureDetails(id) {
        try {
            const [result] = await db.execute(
                `
            SELECT 
                l.*, 
                c.title AS course_title, 
                c.description AS course_description,
                v.title AS video_title, 
                v.iframe_link AS video_iframe_link 
            FROM lectures l
            LEFT JOIN courses c ON l.course_id = c.id
            LEFT JOIN videos v ON l.video_id = v.id
            WHERE l.id = ?
            `,
                [id]
            );
            return result[0];
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM lectures ORDER BY id ASC');
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async findLecture(id) {
        try {
            const [result] = await db.execute(
                'SELECT * FROM lectures Where id = ?',
                [id]
            );
            return result[0];
        } catch (error) {
            console.log("Error getting lecture:", error);
            throw error;
        }
    }


    static async deleteLecture(id) {
        try {
            const [result] = await db.execute('DELETE FROM lectures WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting lecture:", error);
            throw error;
        }
    }

    static async updateLecture(id, title, course_id, video_id, description, tasks, notes, status) {
        try {
            const [result] = await db.execute(
                'UPDATE lectures SET title = ?, course_id = ?, video_id = ?, description = ?, tasks = ?, notes = ?, status = ? WHERE id = ?',
                [title, course_id, video_id, description, tasks, notes, status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating lecture:", error);
            throw error;
        }
    }

}
module.exports = Lecture;