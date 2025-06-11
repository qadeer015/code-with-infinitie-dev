const LectureComment = require('../models/LectureComment');
const db = require('../config/db');

const lectureCommentController = {
    async create(req, res) {
        const { lecture_id, user_id, comment, parent_comment_id } = req.body;

        try {
            const result = await LectureComment.createComment(
                lecture_id,
                user_id,
                comment,
                parent_comment_id || null
            );
            res.status(201).json({ success: true, message: "Comment created successfully!", comment_id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error creating comment" });
        }
    },

    async getComments(req, res) {
        const { lecture_id } = req.params;
        try {
            const comments = await LectureComment.getCommentsByLecture(lecture_id, req.user.id);
           
            res.status(200).json({ success: true, comments });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching comments" });
        }
    },

    async getReplies(req, res) {
        const { parent_comment_id } = req.params;

        try {
            const replies = await LectureComment.getReplies(parent_comment_id);
            res.status(200).json({ success: true, replies });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching replies" });
        }
    },

    async like(req, res) {
        const { comment_id } = req.params;
        const { user_id } = req.body;

        try {
            // Check if the user already liked this comment
            const [existingLike] = await db.execute(
                `SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
                [comment_id, user_id]
            );

            if (existingLike.length > 0) {
                // User already liked - remove the like (dislike)
                await db.execute(
                    `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
                    [comment_id, user_id]
                );
                await updateLikeCount(comment_id);
                res.status(200).json({ action: 'disliked' });
            } else {
                // User hasn't liked - add the like
                await db.execute(
                    `INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)`,
                    [comment_id, user_id]
                );
                await updateLikeCount(comment_id);
                res.status(200).json({ action: 'liked' });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            res.status(500).json({ success: false, message: "Error toggling like" });
        }
    },

    async delete(req, res) {
        const { id } = req.params;

        try {
            const deleted = await LectureComment.deleteComment(id);
            if (deleted) {
                res.status(200).json({ success: true, message: "Comment deleted" });
            } else {
                res.status(404).json({ success: false, message: "Comment not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "Error deleting comment" });
        }
    }
};

async function updateLikeCount(comment_id) {
    await db.execute(
        `UPDATE lecture_comments 
         SET likes_count = (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ?)
         WHERE id = ?`,
        [comment_id, comment_id]
    );
}

module.exports = lectureCommentController;
