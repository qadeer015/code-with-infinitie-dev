const db = require('../config/db');

class Announcement {
    static async createAnnouncement(title,content,id){
        try {
            const [result] = await db.execute(
                'INSERT INTO announcements (title, content, user_id) VALUES (?, ?, ?)',
                [title, content, id]
            );
            return result;
        } catch (error) {
            console.error("Error inserting announcement:", error);
            throw error;
        }
    }

    static async getAllAnnouncements(){
        try{
            const [result] = await db.execute(
                'SELECT * FROM announcements'
            );
            return result;
        }catch (error) {
            console.log("Error getting announcements:",error);
            throw error;
        }
    }

    static async findAnnouncement(id){
        try{
            const [result] = await db.execute(
                'SELECT * FROM announcements Where id = ?',
                [id]
            );
            return result;
        }catch (error) {
            console.log("Error getting announcement:",error);
            throw error;
        }
    }

    static async updateAnnouncement(id, title, content) {
        try {
            const [result] = await db.execute(
                'UPDATE announcements SET title = ?, content = ? WHERE id = ?',
                [title, content, id]
            );
    
            if (result.affectedRows > 0) {
                // Fetch the updated announcement
                const [rows] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
                return rows[0]; // Return the updated announcement object
            } else {
                return null; // No rows updated (invalid ID)
            }
        } catch (error) {
            console.error("Error updating announcement:", error);
            throw error;
        }
    }
    

    static async deleteAnnouncement(id){
        try {
            const [result] = await db.execute('UPDATE announcements SET is_deleted = "1" WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting announcement:", error);
            throw error;
        }
    }
}

module.exports = Announcement;