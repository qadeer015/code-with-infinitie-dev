const db = require('../config/db');

class Announcement {
    static async createAnnouncement(title,content,course_id){
        try {
            const [result] = await db.execute(
                'INSERT INTO announcements (title, content, course_id) VALUES (?, ?, ?)',
                [title, content, course_id]
            );
            return result;
        } catch (error) {
            console.error("Error inserting announcement:", error);
            throw error;
        }
    }

    static async getAllAnnouncements(){
        try{
            const [rows] = await db.execute(`
            SELECT announcements.*, courses.title AS course_title 
            FROM announcements 
            INNER JOIN courses ON announcements.course_id = courses.id;
        `);
            return rows;
        }catch (error) {
            console.log("Error getting announcements:",error);
            throw error;
        }
    }

    static async findAnnouncement(id) {
    try {
        const [result] = await db.execute(
            `SELECT announcements.*, courses.title AS course_title
             FROM announcements
             JOIN courses ON announcements.course_id = courses.id
             WHERE announcements.id = ?`,
            [id]
        );
        return result[0];
    } catch (error) {
        console.log("Error getting announcement:", error);
        throw error;
    }
}


    static async updateAnnouncement(id, title, content, course_id) {
        try {
            const [result] = await db.execute(
                'UPDATE announcements SET title = ?, content = ?, course_id = ? WHERE id = ?',
                [title, content, course_id, id]
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
            const [result] = await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting announcement:", error);
            throw error;
        }
    }

   static async getAnnouncementsByCourseId(courseId) {
    try {
        const [rows] = await db.execute(
            `SELECT announcements.*, courses.title AS course_title
             FROM announcements
             JOIN courses ON announcements.course_id = courses.id
             WHERE announcements.course_id = ?`,
            [courseId]
        );
        return rows;
    } catch (error) {
        console.error("Error getting announcements by course ID:", error);
        throw error;
    }
}

}

module.exports = Announcement;