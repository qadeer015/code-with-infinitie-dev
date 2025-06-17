const db = require('../config/db');

class Question {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM questions');
        return rows;
    }

    static async findByIds(ids) {
        if (!ids.length) return [];
        const [rows] = await db.query(`SELECT * FROM questions WHERE id IN (?)`, [ids]);
        return rows;
    }
    

    static async findByLectureId(lectureId) {
        const [rows] = await db.query('SELECT * FROM questions WHERE lecture_id = ?', [lectureId]);
        return rows;
    }

    static async getQuestionsAndOptions(lectureId) {
    const [rows] = await db.query(`
        SELECT q.id AS question_id, q.question_text, o.id AS option_id, o.option_text, o.is_correct
        FROM questions q
        LEFT JOIN options o ON q.id = o.question_id
        WHERE q.lecture_id = ?
    `, [lectureId]);

    // Transform flat data into nested structure
    const questionsMap = new Map();

    for (const row of rows) {
        if (!questionsMap.has(row.question_id)) {
            questionsMap.set(row.question_id, {
                id: row.question_id,
                question_text: row.question_text,
                options: []
            });
        }

        if (row.option_id) {
            questionsMap.get(row.question_id).options.push({
                id: row.option_id,
                option_text: row.option_text,
                is_correct: row.is_correct
            });
        }
    }

    return Array.from(questionsMap.values());
}


    static async create(question_text, lectureId) {
        const [result] = await db.query('INSERT INTO questions (question_text, lecture_id) VALUES (?, ?)', [question_text, lectureId]);
        const [question] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]); // Get full question
        return question[0]; // Return question object
        // return result.insertId;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async deleteByLectureId(lectureId) {
        const [result] = await db.query('DELETE FROM questions WHERE lecture_id = ?', [lectureId]);
        return result.affectedRows;
    }

    static async update(id, question_text) {
        const [result] = await db.query('UPDATE questions SET question_text = ? WHERE id = ?', [question_text, id]);
        return result.affectedRows;
    }

}

module.exports = Question;