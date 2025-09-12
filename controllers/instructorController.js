const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Instructor = require('../models/Instructor');
require('dotenv').config();

// Configure Cloudinary (if not already done in another file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createInstructorProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            qualification, 
            specialization, 
            address, 
            phone,
            salary, 
            hire_date 
        } = req.body;
        // Check if user exists and is an instructor
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role !== 'instructor') {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not an instructor. Update role first.' 
            });
        }

        // Check if profile already exists
        const existingProfile = await Instructor.findByUserId(userId);
        if (existingProfile) {
            return res.status(400).json({ 
                success: false, 
                message: 'Instructor profile already exists' 
            });
        }

        let documentImageUrl = null;
        if (req.file) {
            documentImageUrl = req.file.path;
        }

        const newProfile = await Instructor.create(userId, {
            qualification,
            specialization,
            address,
            phone,
            salary: parseFloat(salary),
            document_image: documentImageUrl,
            hire_date
        });

        res.status(201).json({ 
            success: true, 
            message: 'Instructor profile created successfully',
            profile: newProfile
        });
    } catch (error) {
        console.error('Error creating instructor profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating instructor profile' 
        });
    }
};

const updateInstructorProfile = async (req, res) => {
   try {
        const id = req.params.userId; // <-- FIXED (no destructuring)
        const {
            name, email, role, page_link, repository_link, signature,
            qualification, specialization, address, phone, salary, hire_date
        } = req.body;
        
        const userProfile = await User.findById(id);
        if (!userProfile) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Handle avatar
        let avatarUrl = userProfile.avatar;
        if (req.files?.avatar) {
            avatarUrl = req.files.avatar[0].path;
        }
        // Update user
        await User.updateUser(
            id,
            name ?? userProfile.name,
            email ?? userProfile.email,
            role ?? userProfile.role,
            avatarUrl,
            page_link ?? userProfile.page_link,
            repository_link ?? userProfile.repository_link,
            signature ?? userProfile.signature
        );

        // If user is instructor → also update instructor profile
        if (role === "instructor" || userProfile.role === "instructor") {
            const instructorProfile = await Instructor.findByUserId(id);
            if(!instructorProfile) {
                return res.status(404).json({ success: false, message: "Instructor profile not found" });
            }
            let documentImageUrl = instructorProfile?.document_image;
            if (req.files?.document) {
                documentImageUrl = req.files.document[0].path;
            }

            await Instructor.update(id, {
                qualification: qualification ?? instructorProfile?.qualification,
                specialization: specialization ?? instructorProfile?.specialization,
                address: address ?? instructorProfile?.address,
                phone: phone ?? instructorProfile?.phone,
                salary: salary ? parseFloat(salary) : instructorProfile?.salary,
                document_image: documentImageUrl,
                hire_date: hire_date ?? instructorProfile?.hire_date
            });
        }

        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating full profile:", error);
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

const getInstructorProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const profile = await Instructor.findWithUserData(userId);
        if (!profile) {
            return res.status(404).json({ 
                success: false, 
                message: 'Instructor profile not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            profile 
        });
    } catch (error) {
        console.error('Error fetching instructor profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching instructor profile' 
        });
    }
};

const getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.findAllWithUserData();
        res.status(200).json(instructors);
    } catch (error) {
        console.error('Error fetching all instructors:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching all instructors' 
        });
    }
};

const deleteInstructorProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if profile exists
        const existingProfile = await Instructor.findByUserId(userId);
        if (!existingProfile) {
            return res.status(404).json({ 
                success: false, 
                message: 'Instructor profile not found' 
            });
        }

        // Delete document file if exists
        if (existingProfile.document_image && 
            existingProfile.document_image.includes('res.cloudinary.com')) {
            try {
                const publicId = existingProfile.document_image.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error('Error deleting document:', err);
            }
        }

        const deleted = await Instructor.delete(userId);
        if (deleted) {
            res.status(200).json({ 
                success: true, 
                message: 'Instructor profile deleted successfully' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Failed to delete instructor profile' 
            });
        }
    } catch (error) {
        console.error('Error deleting instructor profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting instructor profile' 
        });
    }
};

const editInstructorProfile = async (req, res) => {
    
};

module.exports = {
    createInstructorProfile,
    updateInstructorProfile,
    getInstructorProfile,
    getAllInstructors,
    deleteInstructorProfile,
    editInstructorProfile
};