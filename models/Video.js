const db = require('../config/db');

class Video {
    static async create(title, iframe_link) {
        try {
            const [result] = await db.execute(
                'INSERT INTO videos (title, iframe_link) VALUES (?, ?)',
                [title, iframe_link]
            );
            return result;
        } catch (error) {
            console.error("Error inserting video:", error);
            throw error;
        }
    }

    static async searchByTitle(query) {
        try {
            const likeQuery = `%${query.toLowerCase()}%`;
            const [rows] = await db.execute(
                'SELECT id, title FROM videos WHERE LOWER(title) LIKE ? ORDER BY id DESC LIMIT 10',
                [likeQuery]
            );
            return rows;
        } catch (error) {
            console.error("Error searching videos:", error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM videos WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM videos ORDER BY id ASC');
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async updateVideo(id, title, iframe_link) {
        try {
            const [result] = await db.execute(
                'UPDATE videos SET title = ?, iframe_link = ? WHERE id = ?',
                [title, iframe_link, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating video:", error);
            throw error;
        }
    }

    static async deleteVideo(id) {
        try {
            const [result] = await db.execute('DELETE FROM videos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    }
}

module.exports = Video;
