const db = require('../config/db');

class FeaturedCourse {
    static async create(course_id, difficulty_lvl) {
        try {
            const [result] = await db.execute(
                'INSERT INTO featured_courses (course_id, difficulty_lvl) VALUES (?, ?)',
                [course_id, difficulty_lvl]
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
                'SELECT * FROM featured_courses Where id = ?',
                [id]
            );
            return result;
        } catch (error) {
            console.log("Error getting featured course:", error);
            throw error;
        }
    }


    static async delete(id) {
        try {
            const [result] = await db.execute('DELETE FROM featured_courses WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting featured course:", error);
            throw error;
        }
    }

    static async update(id, course_id, difficulty_lvl) {
        try {
            const [result] = await db.execute(
                'UPDATE featured_courses SET course_id = ?, difficulty_lvl = ? WHERE id = ?',
                [course_id, difficulty_lvl, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating featured course:", error);
            throw error;
        }
    }

}
module.exports = FeaturedCourse;