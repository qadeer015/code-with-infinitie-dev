const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');

class AssignmentSubmission {
    static async submitAssignment(assignment_id, user_id, submission_date, file, gained_marks = 0.00) {
        try {
            // Check if file is a ZIP archive
            if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
                return await this.handleZipSubmission(assignment_id, user_id, submission_date, file, gained_marks);
            } else {
                return await this.handleSingleFileSubmission(assignment_id, user_id, submission_date, file, gained_marks);
            }
        } catch (error) {
            console.error("Error submitting assignment:", error);
            throw error;
        }
    }

    static async saveGainedMarks(assignment_id, user_id, marks) {
        try {
            const [result] = await db.execute(
                'UPDATE assignment_submissions SET gained_marks = ?, status = "graded" WHERE assignment_id = ? AND user_id = ?',
                [marks, assignment_id, user_id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error giving marks:", error);
            throw error;
        }
    }

    static async handleSingleFileSubmission(assignment_id, user_id, submission_date, file, gained_marks) {
    const isMedia = this.isMediaFile(file.mimetype);
    let fileData = {
        originalName: file.originalname || 'unnamed_file',
        type: file.mimetype || 'application/octet-stream',
        size: file.size || 0
    };

    if (isMedia) {
        const newPath = this.generateMediaPath(file.originalname);
        fs.renameSync(file.path, newPath);
        fileData.path = newPath;
        fileData.isMedia = true;
    } else {
        try {
            const content = fs.readFileSync(file.path);
            fileData.content = content.toString('base64');
            fs.unlinkSync(file.path);
        } catch (error) {
            console.error("Error reading file:", error);
            throw new Error("Failed to process uploaded file");
        }
    }

    return this.saveSubmissionToDB(
        assignment_id, 
        user_id, 
        submission_date, 
        fileData, 
        gained_marks,
        isMedia
    );
}

    static async handleZipSubmission(assignment_id, user_id, submission_date, file, gained_marks) {
        const zip = new AdmZip(file.path);
        const zipEntries = zip.getEntries();
        const fileData = {
            files: [],
            isZip: true,
            originalName: file.originalname,
            size: file.size
        };

        for (const entry of zipEntries) {
            if (!entry.isDirectory) {
                const content = entry.getData().toString('base64');
                const entryName = entry.entryName;
                const mimeType = this.getMimeType(entryName);
                const isMedia = this.isMediaFile(mimeType);

                if (isMedia) {
                    // Save media files to filesystem
                    const mediaPath = this.generateMediaPath(entryName);
                    fs.writeFileSync(mediaPath, entry.getData());
                    fileData.files.push({
                        originalName: entryName,
                        type: mimeType,
                        path: mediaPath,
                        isMedia: true,
                        size: entry.header.size
                    });
                } else {
                    // Store other files directly in DB
                    fileData.files.push({
                        originalName: entryName,
                        type: mimeType,
                        content: content,
                        size: entry.header.size
                    });
                }
            }
        }

        fs.unlinkSync(file.path); // Remove the zip file
        return this.saveSubmissionToDB(
            assignment_id, 
            user_id, 
            submission_date, 
            fileData, 
            gained_marks,
            false
        );
    }

   static async saveSubmissionToDB(assignment_id, user_id, submission_date, fileData, gained_marks, isMedia) {
    const [existingSubmission] = await db.execute(
        'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?',
        [assignment_id, user_id]
    );

    // Ensure we have proper null values instead of undefined
    const fileContent = isMedia ? null : (fileData.content ? Buffer.from(fileData.content, 'base64') : null);
    const fileType = fileData.type || null;
    const filePath = fileData ? JSON.stringify(fileData) : null;
    const marks = gained_marks || 0.00;

    const query = existingSubmission.length > 0
        ? `UPDATE assignment_submissions 
           SET submission_date = ?, file_path = ?, file_content = ?, file_type = ?, is_media = ?, status = 'submitted', gained_marks = ?
           WHERE assignment_id = ? AND user_id = ?`
        : `INSERT INTO assignment_submissions 
           (assignment_id, user_id, submission_date, file_path, file_content, file_type, is_media, status, gained_marks) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`;

    const params = existingSubmission.length > 0
        ? [
            submission_date, 
            filePath, 
            fileContent, 
            fileType, 
            isMedia, 
            marks, 
            assignment_id, 
            user_id
          ]
        : [
            assignment_id, 
            user_id, 
            submission_date, 
            filePath, 
            fileContent, 
            fileType, 
            isMedia, 
            marks
          ];

    try {
        const [result] = await db.execute(query, params);
        return result;
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

    static isMediaFile(mimeType) {
        const mediaTypes = ['image/', 'video/', 'audio/'];
        return mediaTypes.some(type => mimeType.startsWith(type));
    }

    static getMimeType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.txt': 'text/plain',
            '.zip': 'application/zip'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    static generateMediaPath(originalName) {
        const ext = path.extname(originalName);
        const filename = `${uuidv4()}${ext}`;
        return path.join(__dirname, '../uploads', filename);
    }

     static async findSubmittedAssignment(id) {
    try {
        const [result] = await db.execute(
            `SELECT 
                assignment_submissions.*, 
                users.name, 
                assignments.due_date, 
                assignments.total_marks,
                assignments.title,
                assignments.details
             FROM assignment_submissions
             JOIN users ON assignment_submissions.user_id = users.id
             JOIN assignments ON assignment_submissions.assignment_id = assignments.id
             WHERE assignment_submissions.id = ?`,
            [id]
        );
        return result;
    } catch (error) {
        console.log("Error getting submitted assignment:", error);
        throw error;
    }
}


    static async getAllSubmittedAssignments() {
        try {
            const [result] = await db.execute('SELECT * FROM assignment_submissions');
            return result;
        } catch (error) {
            console.log("Error getting submitted assignments:", error);
            throw error;
        }
    }

    static async getSubmittedAssignmentsByCourseId(course_id) {
        try {
            const [result] = await db.execute(
                `
            SELECT asub.* 
            FROM assignment_submissions asub 
            INNER JOIN assignments a ON asub.assignment_id = a.id 
            WHERE a.course_id = ?
            `,
                [course_id]
            );
            return result;
        } catch (error) {
            console.log("Error getting assignments by course ID:", error);
            throw error;
        }
    }
}

module.exports = AssignmentSubmission;