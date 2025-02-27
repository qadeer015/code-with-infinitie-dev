const db = require('../config/db');

class AnnouncementView {
  static async viewedByUser(userId, announcementId) {
    try {
      // Check if the user has already viewed the announcement
      const [existing] = await db.execute(
        'SELECT * FROM announcement_views WHERE user_id = ? AND announcement_id = ?',
        [userId, announcementId]
      );

      if (existing.length > 0) {
        return { message: 'Already viewed' }; // Avoid duplicate inserts
      }

      // Insert new view record
      const [result] = await db.execute(
        'INSERT INTO announcement_views (user_id, announcement_id) VALUES (?, ?)',
        [userId, announcementId]
      );

      return { message: 'View recorded', result };
    } catch (error) {
      console.error('Error inserting announcement view:', error);
      throw error;
    }
  }

  static async unViewedCount(userId) {
    try {
      const [result] = await db.execute(
        `SELECT COUNT(a.id) AS unviewed_count 
             FROM announcements a
             LEFT JOIN announcement_views av 
             ON a.id = av.announcement_id AND av.user_id = ?
             WHERE av.id IS NULL`,
        [userId]
      );
      return result;
    } catch (error) {
      console.error("Error fetching unviewed announcements:", error);
      throw error;
    }
  }
}

module.exports = AnnouncementView;
