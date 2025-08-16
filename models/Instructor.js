const db = require('../config/db');

class Instructor {
    /**
     * Create a new instructor profile
     * @param {number} userId - The user ID from users table
     * @param {object} profileData - Instructor profile data
     * @returns {Promise<object>} The created profile
     */
    static async create(userId, profileData) {
        try {
            const [result] = await db.execute(
                `INSERT INTO instructor_profiles 
                (user_id, qualification, specialization, address, phone, salary, document_image, hire_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    profileData.qualification,
                    profileData.specialization,
                    profileData.address,
                    profileData.phone,
                    profileData.salary,
                    profileData.document_image,
                    profileData.hire_date
                ]
            );
            return { id: result.insertId, ...profileData };
        } catch (error) {
            console.error("Error creating instructor profile:", error);
            throw error;
        }
    }

    /**
     * Find instructor profile by user ID
     * @param {number} userId - The user ID to search for
     * @returns {Promise<object|null>} The instructor profile or null if not found
     */
    static async findByUserId(userId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM instructor_profiles WHERE user_id = ?', 
                [userId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding instructor profile:", error);
            throw error;
        }
    }

    /**
     * Find instructor profile by profile ID
     * @param {number} id - The profile ID to search for
     * @returns {Promise<object|null>} The instructor profile or null if not found
     */
    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM instructor_profiles WHERE id = ?', 
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding instructor profile:", error);
            throw error;
        }
    }

    /**
     * Update an instructor profile
     * @param {number} userId - The user ID of the profile to update
     * @param {object} profileData - The data to update
     * @returns {Promise<boolean>} True if update was successful
     */
    static async update(userId, profileData) {
        try {
            const [result] = await db.execute(
                `UPDATE instructor_profiles SET 
                qualification = ?, 
                specialization = ?, 
                address = ?, 
                phone = ?, 
                salary = ?, 
                document_image = ?, 
                hire_date = ? 
                WHERE user_id = ?`,
                [
                    profileData.qualification,
                    profileData.specialization,
                    profileData.address,
                    profileData.phone,
                    profileData.salary,
                    profileData.document_image,
                    profileData.hire_date,
                    userId
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error updating instructor profile:", error);
            throw error;
        }
    }

    /**
     * Delete an instructor profile
     * @param {number} userId - The user ID of the profile to delete
     * @returns {Promise<boolean>} True if deletion was successful
     */
    static async delete(userId) {
        try {
            const [result] = await db.execute(
                'DELETE FROM instructor_profiles WHERE user_id = ?', 
                [userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error deleting instructor profile:", error);
            throw error;
        }
    }

    /**
     * Get all instructor profiles with user details
     * @returns {Promise<Array>} Array of instructor profiles with user data
     */
    static async findAllWithUserData() {
        try {
            const [rows] = await db.execute(
                `SELECT u.id as user_id, u.name, u.email, u.avatar, u.role, u.status,
                ip.id as profile_id, ip.qualification, ip.specialization, ip.address, 
                ip.phone, ip.salary, ip.document_image, ip.hire_date
                FROM users u
                JOIN instructor_profiles ip ON u.id = ip.user_id
                WHERE u.role = 'instructor' AND u.status != 'deleted'`
            );
            return rows;
        } catch (error) {
            console.error("Error finding all instructors:", error);
            throw error;
        }
    }

    /**
     * Get instructor profile with user details by user ID
     * @param {number} userId - The user ID to search for
     * @returns {Promise<object|null>} The combined instructor and user data or null
     */
    static async findWithUserData(userId) {
        try {
            const [rows] = await db.execute(
                `SELECT u.id as user_id, u.name, u.email, u.avatar, u.role, u.status,
                ip.id as profile_id, ip.qualification, ip.specialization, ip.address, 
                ip.phone, ip.salary, ip.document_image, ip.hire_date
                FROM users u
                JOIN instructor_profiles ip ON u.id = ip.user_id
                WHERE u.id = ?`,
                [userId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding instructor with user data:", error);
            throw error;
        }
    }
}

module.exports = Instructor;