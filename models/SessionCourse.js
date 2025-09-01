const db = require('../config/db');

class SessionCourse {
    static async create(course_id, difficulty_lvl=null, session_id) {
        try {
            const [result] = await db.execute(
                'INSERT INTO session_courses (course_id, difficulty_lvl, session_id) VALUES (?, ?, ?)',
                [course_id, difficulty_lvl, session_id]
            );
            return result;
        } catch (error) {
            console.error("Error creating featured course:", error);
            throw error;
        }
    }

    static async getAll(sessionId, userId) {
        try {
            const [rows] = await db.execute(`
      SELECT 
          c.id, 
          c.title, 
          c.description,
          c.ratting,
          c.course_duration,
          c.course_fee,
          c.status AS course_status,
          c.created_at,
          c.updated_at,
          sc.id AS session_course_id,
          sc.session_id,
          uc.status AS user_course_status
      FROM courses c
      INNER JOIN session_courses sc ON c.id = sc.course_id
      LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
      WHERE sc.session_id = ?
      ORDER BY c.id ASC
    `, [userId, sessionId]);

            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }


    static async getBySessionId(sessionId) {
        try {
            const [rows] = await db.execute(`
      SELECT 
          c.id, 
          c.title, 
          c.description,
          c.ratting,
          c.course_duration,
          c.course_fee,
          c.status AS course_status,
          c.created_at,
          c.updated_at,
          sc.id AS session_course_id,
          sc.difficulty_lvl,
          sc.session_id
      FROM courses c
      INNER JOIN session_courses sc ON c.id = sc.course_id
      WHERE sc.session_id = ?
      ORDER BY c.id ASC
    `, [sessionId]);

            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }




    static async find(id) {
        try {
            const [result] = await db.execute(
                `SELECT session_courses.*, courses.title AS course_title
             FROM session_courses
             JOIN courses ON session_courses.course_id = courses.id
             WHERE session_courses.id = ?`,
                [id]
            );
            return result[0];
        } catch (error) {
            console.log("Error getting featured course:", error);
            throw error;
        }
    }

    static async delete(id, courseId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM session_courses WHERE id = ? AND course_id = ?',
                [id, courseId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting session course:", error);
            throw error;
        }
    }


    // SessionCourse.js
static async update(id, {course_id, difficulty_lvl, session_id}) {
    try {
        // If difficulty_lvl is explicitly provided, use it, otherwise preserve existing
        let query, params;
        if (difficulty_lvl !== undefined) {
            query = 'UPDATE session_courses SET course_id = ?, difficulty_lvl = ?, session_id = ? WHERE id = ?';
            params = [course_id, difficulty_lvl, session_id, id];
        } else {
            query = 'UPDATE session_courses SET course_id = ?, session_id = ? WHERE id = ?';
            params = [course_id, session_id, id];
        }
        
        const [result] = await db.execute(query, params);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating session course:", error);
        throw error;
    }
}

static async updateDifficulty(session_id, course_id, difficulty_lvl) {
    try {
        const query = `
            UPDATE session_courses 
            SET difficulty_lvl = ? 
            WHERE session_id = ? AND course_id = ?
        `;
        const [result] = await db.execute(query, [difficulty_lvl, session_id, course_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error updating session course:", error);
        throw error;
    }
}

}
module.exports = SessionCourse;