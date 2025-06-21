const db = require('../config/db');

class User {
    static async create(name, password, email, avatar, signature) {
        try {
            const [result] = await db.execute(
                'INSERT INTO users (name, password, email, avatar, signature) VALUES (?, ?, ?, ?, ?)',
                [name, password, email, avatar, signature]
            );
            return result;
        } catch (error) {
            console.error("Error inserting user:", error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async findAll(role) {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE role = ?', [role]);
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async updateUser(id, name, email, role, avatar, page_link, repository_link, signature) {
        try {
            const [result] = await db.execute(
                'UPDATE users SET name = ?, email = ?, role = ?, avatar = ?, page_link = ?, repository_link = ?, signature = ? WHERE id = ?',
                [name, email, role, avatar, page_link, repository_link, signature, id]
            );
            return result.affectedRows > 0; // Returns true if at least one row is updated
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    static async deleteUser(id) {
        try {
            const [result] = await db.execute('UPDATE users SET role = "deleted" WHERE id = ?', [id]);
            return result.affectedRows > 0; // Returns true if a row was deleted
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }

    static async blockUser(id) {
        try {
            const [result] = await db.execute('UPDATE users SET status = "blocked" WHERE id = ?', [id]);
            return result.affectedRows > 0; // Returns true if a row was blocked
        } catch (error) {
            console.error("Error blocking user:", error);
            throw error;
        }
    }

    static async unblockUser(id) {
        try {
            const [result] = await db.execute('UPDATE users SET status = "active" WHERE id = ?', [id]);
            return result.affectedRows > 0; // Returns true if a row was active
        } catch (error) {
            console.error("Error unblocking user:", error);
            throw error;
        }
    }

    static async getUserSignature(id){
        try {
            const [rows] = await db.execute('SELECT signature FROM users WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }
}

module.exports = User;
