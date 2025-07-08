const db = require('../config/db');

class Lecture {
    static async createLecture(title, course_id, video_id, description, tasks, notes) {
        try {
            const [result] = await db.execute(
                'INSERT INTO lectures (title, course_id, video_id, description, tasks, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [title, course_id, video_id, description, tasks, notes]
            );
            return result;
        } catch (error) {
            console.error("Error inserting lecture:", error);
            throw error;
        }
    }

    static async findAll(course_id, user_id) {
    try {
        const [rows] = await db.execute(`
            SELECT 
                l.id,
                l.title, 
                l.video_id, 
                v.title as video_title,
                c.title as course_title,
                l.description,
                l.created_at,
                l.updated_at,
                ulv.is_viewed as is_viewed,
                ulv.is_readed,
                ulv.is_quizz_completed,
                ulv.created_at as viewed_at
            FROM lectures l 
            LEFT JOIN videos v ON l.video_id = v.id
            LEFT JOIN courses c ON l.course_id = c.id
            LEFT JOIN lecture_views ulv ON l.id = ulv.lecture_id AND ulv.user_id = ?
            WHERE l.course_id = ?
            GROUP BY l.id, l.title, l.video_id, v.title, c.title, l.description, 
                     l.created_at, l.updated_at, ulv.is_viewed, ulv.created_at, 
                     ulv.is_readed, ulv.is_quizz_completed
                     ORDER BY l.id ASC
        `, [user_id, course_id]);
        
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

static async getUserLectureDetails(id, userId) {
    try {
        const [result] = await db.execute(
            `
            SELECT 
                l.*, 
                c.title AS course_title, 
                c.description AS course_description,
                v.title AS video_title, 
                v.iframe_link AS video_iframe_link,
                lv.is_viewed, 
                lv.is_readed,
                lv.is_quizz_completed,
                lv.created_at AS view_created_at,
                lv.updated_at AS view_updated_at
            FROM lectures l
            LEFT JOIN courses c ON l.course_id = c.id
            LEFT JOIN videos v ON l.video_id = v.id
            LEFT JOIN lecture_views lv 
                ON lv.lecture_id = l.id AND lv.user_id = ?
            WHERE l.id = ?
            `,
            [userId, id]
        );
        return result[0];
    } catch (error) {
        console.error("Database query error:", error);
        throw error;
    }
}



    static async getAll() {
        try {
            const [rows] = await db.execute(`
            SELECT lectures.*, courses.title AS course_title
            FROM lectures
            JOIN courses ON lectures.course_id = courses.id
            ORDER BY lectures.id ASC
        `);
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

    static async updateLecture(id, title, course_id, video_id, description, tasks, notes) {
        try {
            const [result] = await db.execute(
                'UPDATE lectures SET title = ?, course_id = ?, video_id = ?, description = ?, tasks = ?, notes = ? WHERE id = ?',
                [title, course_id, video_id, description, tasks, notes, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating lecture:", error);
            throw error;
        }
    }

    static async markLectureAsViewed(lectureId, userId) {
        try {
            const [result] = await db.execute(`
            INSERT INTO lecture_views
                (user_id, lecture_id, is_viewed, created_at, updated_at)
            VALUES (?, ?, TRUE, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
                is_viewed = TRUE, 
                created_at = NOW(), 
                updated_at = NOW()
        `, [userId, lectureId]);
            return result[0];
        } catch (error) {
            console.error("Error inserting lecture view:", error);
            throw error;
        }
    }

    static async markLectureAsRead(lectureId, userId) {
        try {
            const [result] = await db.execute(
                'UPDATE lecture_views SET is_readed = TRUE WHERE lecture_id = ? AND user_id = ?',
                [lectureId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error marking lecture as viewed:", error);
            throw error;
        }
    }

    static async markLectureQuizzAsCompleted(lectureId, userId) {
        try {
            const [result] = await db.execute(
                'UPDATE lecture_views SET is_quizz_completed = TRUE WHERE lecture_id = ? AND user_id = ?',
                [lectureId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error marking lecture as viewed:", error);
            throw error;
        }
    }



}
module.exports = Lecture;