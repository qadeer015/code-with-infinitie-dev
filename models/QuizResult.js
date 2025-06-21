const db = require('../config/db');

class QuizResult {
    static async create(userId, courseId, lectureId, totalMarks, score, answers) {
    const [result] = await db.query(
        `INSERT INTO quiz_results 
         (user_id, course_id, lecture_id, total_marks, score, answers, attempts) 
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
         total_marks = VALUES(total_marks),
         score = VALUES(score),
         answers = VALUES(answers),
         updated_at = NOW(),
         attempts = attempts + 1`,
        [userId, courseId, lectureId, totalMarks, score, JSON.stringify(answers)]
    );

    const id = result.insertId || (await db.query(
        'SELECT id FROM quiz_results WHERE user_id = ? AND course_id = ? AND lecture_id = ?',
        [userId, courseId, lectureId]
    ))[0][0].id;

    const [record] = await db.query("SELECT * FROM quiz_results WHERE id = ?", [id]);
    return record[0];
}



    static async findBylectureIdAndUserId(lectureId, userId) {
        const [quiz_result] = await db.query("SELECT * FROM quiz_results WHERE lecture_id = ? AND user_id = ?", [lectureId, userId]);
        return quiz_result;
    }

    static async quizzesAttempted(userId, courseId) {
        const [rows] = await db.query(
            "SELECT COUNT(DISTINCT quiz_id) AS quizzes_attempted FROM quiz_results WHERE user_id = ? AND course_id = ?",
            [userId, courseId]
        );
        return rows.length ? rows[0].quizzes_attempted : 0; // Ensure it returns an integer
    }

    // QuizResult.js - Add this new static method
    static async getQuizStats(userId, courseId) {
        const [totalQuizzes] = await db.query(
            "SELECT COUNT(*) AS total FROM lectures WHERE course_id = ?",
            [courseId]
        );

        const [attemptedQuizzes] = await db.query(
            "SELECT COUNT(DISTINCT lecture_id) AS attempted FROM quiz_results WHERE user_id = ? AND course_id = ?",
            [userId, courseId]
        );

        return {
            total: totalQuizzes[0].total,
            attempted: attemptedQuizzes[0].attempted
        };
    }

}

module.exports = QuizResult;