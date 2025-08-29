const db = require('../config/db');

class FeaturedCourse {
    static async create(course_id, difficulty_lvl, session_id) {
        try {
            const [result] = await db.execute(
                'INSERT INTO featured_courses (course_id, difficulty_lvl, session_id) VALUES (?, ?, ?)',
                [course_id, difficulty_lvl, session_id]
            );
            return result;
        } catch (error) {
            console.error("Error creating featured course:", error);
            throw error;
        }
    }

  static async getAll() {
  try {
    const [rows] = await db.execute(`
      SELECT courses.*, featured_courses.*
      FROM courses
      INNER JOIN featured_courses ON courses.id = featured_courses.course_id
    `);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}


    static async find(id) {
    try {
        const [result] = await db.execute(
            `SELECT featured_courses.*, courses.title AS course_title
             FROM featured_courses
             JOIN courses ON featured_courses.course_id = courses.id
             WHERE featured_courses.id = ?`,
            [id]
        );
        return result[0];
    } catch (error) {
        console.log("Error getting featured course:", error);
        throw error;
    }
}


     static async delete(session_id, course_id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM featured_courses WHERE session_id = ? AND course_id = ?',
                [session_id, course_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error removing course from session:", error);
            throw error;
        }
    }


    static async update(id, course_id, difficulty_lvl, session_id) {
        try {
            const [result] = await db.execute(
                'UPDATE featured_courses SET course_id = ?, difficulty_lvl = ? session_id = ? WHERE id = ?',
                [course_id, difficulty_lvl, session_id, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating featured course:", error);
            throw error;
        }
    }

}
module.exports = FeaturedCourse;