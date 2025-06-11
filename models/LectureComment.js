const db = require('../config/db');

class LectureComment {
    static async createComment(lecture_id, user_id, comment, parent_comment_id = null) {
        try {
            const [result] = await db.execute(
                `INSERT INTO lecture_comments 
                    (lecture_id, user_id, comment, parent_comment_id) 
                 VALUES (?, ?, ?, ?)`,
                [lecture_id, user_id, comment, parent_comment_id]
            );
            return result;
        } catch (error) {
            console.error("Error creating comment:", error);
            throw error;
        }
    }

    static async getCommentsByLecture(lecture_id, current_user_id) {
        try {
            const [rows] = await db.execute(
                `SELECT lc.*, 
             u.name AS user_name, 
             u.avatar AS user_avatar,
             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = lc.id) AS likes_count,
             EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = lc.id AND user_id = ?) AS is_liked
             FROM lecture_comments lc
             LEFT JOIN users u ON lc.user_id = u.id
             WHERE lc.lecture_id = ?
             ORDER BY lc.created_at ASC`,
                [current_user_id, lecture_id]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching comments:", error);
            throw error;
        }
    }

    static async getReplies(parent_comment_id) {
        try {
            const [rows] = await db.execute(
                `SELECT lc.*, u.name AS user_name 
                 FROM lecture_comments lc
                 LEFT JOIN users u ON lc.user_id = u.id
                 WHERE lc.parent_comment_id = ?
                 ORDER BY lc.created_at ASC`,
                [parent_comment_id]
            );
            return rows;
        } catch (error) {
            console.error("Error fetching replies:", error);
            throw error;
        }
    }

    static async deleteComment(id) {
        try {
            const [result] = await db.execute(
                `DELETE FROM lecture_comments WHERE id = ?`,
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting comment:", error);
            throw error;
        }
    }

    static async getCommentById(id) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM lecture_comments WHERE id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error("Error fetching comment by ID:", error);
            throw error;
        }
    }
}

module.exports = LectureComment;
