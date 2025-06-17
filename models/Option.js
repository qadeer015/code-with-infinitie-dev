const db = require('../config/db');

class Option {
    static async create(option_text, question_id, is_correct) {
        const [result] = await db.query('INSERT INTO options (option_text, question_id, is_correct) VALUES (?, ?, ?)', [option_text, question_id, is_correct]);
        const [option] = await db.query('SELECT * FROM options WHERE id = ?', [result.insertId]); // Get full option
        return option[0];
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM options WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async update(id, option_text, is_correct) {
        const [result] = await db.query('UPDATE options SET option_text = ?, is_correct = ? WHERE id = ?', [option_text, is_correct, id]);
        return result.affectedRows;
    }

    static async findByIds(ids) {
        if (!ids.length) return [];
        const [rows] = await db.query(`SELECT * FROM options WHERE id IN (?)`, [ids]);
        return rows;
    }
    

    static async findByQuestionId(question_id) {
        const [rows] = await db.query('SELECT * FROM options WHERE question_id = ?', [question_id]);
        return rows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM options');
        return rows;
    }

    static async deleteByQuestionId(question_id) {
        const [result] = await db.query('DELETE FROM options WHERE question_id = ?', [question_id]);
        return result.affectedRows;
    }

    static async findByLectureId(lectureId) {
        const [rows] = await db.query('SELECT * FROM options WHERE question_id IN (SELECT id FROM questions WHERE lecture_id = ?)', [lectureId]);
        return rows;
    }
}

module.exports = Option;