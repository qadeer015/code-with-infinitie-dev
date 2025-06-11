const express = require('express');
const router = express.Router();
const lectureCommentController = require('../controllers/lectureCommentController');

// POST /lecture-comments - create a new comment or reply
router.post('/', lectureCommentController.create);

// GET /lecture-comments/:lecture_id - get all comments for a lecture
router.get('/:lecture_id', lectureCommentController.getComments);

// GET /lecture-comments/replies/:parent_comment_id - get replies for a comment
router.get('/replies/:parent_comment_id', lectureCommentController.getReplies);

// POST /lecture-comments/like/:comment_id - like a comment
router.post('/like/:comment_id', lectureCommentController.like);

// DELETE /lecture-comments/:id - delete a comment
router.delete('/:id', lectureCommentController.delete);

module.exports = router;