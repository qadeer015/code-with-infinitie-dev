const db = require('../config/db');

class Video {
    static async create(title, description, iframe_link, totalSeconds) {
        try {
            const [result] = await db.execute(
                'INSERT INTO videos (title, description, iframe_link) VALUES (?, ?, ?, ?)',
                [title, description, iframe_link, totalSeconds]
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

    static async updateVideo(id, title, description, iframe_link, totalSeconds) {
        try {
            const [result] = await db.execute(
                'UPDATE videos SET title = ?, description = ?, iframe_link = ?, duration = ? WHERE id = ?',
                [title, description, iframe_link, totalSeconds, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating video:", error);
            throw error;
        }
    }

    static async deleteVideo(id) {
        try {
            const [result] = await db.execute('DELETE FROM videos WHERE id = ?', [id]);
            return result.affectedRows > 0; // Returns true if a row was deleted
        } catch (error) {
            console.error("Error deleting video:", error);
            throw error;
        }
    }
}

module.exports = Video;
