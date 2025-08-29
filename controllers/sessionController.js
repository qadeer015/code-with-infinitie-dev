const Course = require('../models/Course');
const Session = require('../models/Session');

const createSession = async (req, res) => {
    try {
        const { name, description, start_date, end_date, status } = req.body;
        
        // Use the status from req.body if provided, otherwise default to 'upcoming'
        const sessionStatus = status || 'upcoming';
        
        const session = await Session.create(name, description, start_date, end_date, req.user.id, sessionStatus);
        res.status(201).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating session');
    }
}

const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.findAll();
        console.log(sessions);
        res.status(200).json(sessions);
    } catch (err) {
        console.error(err);
    }
}

const editSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session.findById(id);
        const courses = await Course.getAll()
        res.status(200).render('admin/session/edit', {session, courses});
    } catch (err) {
        console.error(err);
    }
}

const updateSession = async (req, res) => {
        try {
        const { name, description, start_date, end_date, status } = req.body;
        await Session.update(req.params.id, name, description, start_date, end_date, status);
        res.status(200).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
    }
}

const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await Session.delete(id);
        res.status(200).redirect('/users/admin/sessions');
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createSession,
    updateSession,
    deleteSession,
    getAllSessions,
    editSession
}