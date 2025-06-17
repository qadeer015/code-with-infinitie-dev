const db = require('../config/db');

class QuizResult {
    static async create(userId, courseId, lectureId, totalMarks, score, answers) {
    const [result] = await db.query(
        `INSERT INTO quiz_results 
         (user_id, course_id, lecture_id, total_marks, score, answers) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         total_marks = VALUES(total_marks),
         score = VALUES(score),
         answers = VALUES(answers),
         updated_at = NOW()`,
        [userId, courseId, lectureId, totalMarks, score, JSON.stringify(answers)]
    );
    
    // Return the updated/inserted record
    const id = result.insertId || (await db.query(
        'SELECT id FROM quiz_results WHERE user_id = ? AND course_id = ? AND lecture_id = ?',
        [userId, courseId, lectureId]
    ))[0][0].id;
    
    const [record] = await db.query("SELECT * FROM quiz_results WHERE id = ?", [id]);
    return record[0];
}

    static async findBylectureId(lectureId) {
        const [quiz_result] = await db.query("SELECT * FROM quiz_results WHERE lecture_id = ?", [lectureId]);
        return quiz_result;
    }

    static async quizzesAttempted(userId, courseId) {
        const [rows] = await db.query(
            "SELECT COUNT(DISTINCT quiz_id) AS quizzes_attempted FROM quiz_results WHERE user_id = ? AND course_id = ?",
            [userId, courseId]
        );
        return rows.length ? rows[0].quizzes_attempted : 0; // Ensure it returns an integer
    }

}

module.exports = QuizResult;