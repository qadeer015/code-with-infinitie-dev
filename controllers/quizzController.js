const Course = require('../models/Course');
const Question = require('../models/Question');
const Option = require('../models/Option');
const QuizResult = require('../models/QuizResult');
const Lecture = require('../models/Lecture');

const showQuizz = async (req, res) => {
    try {
        const course = await Course.findCourse(req.query.course_id);
        const lecture = await Lecture.findLecture(req.params.id);
        
        const quizData = await Question.getQuestionsAndOptions(req.params.id);

        const quizResults = await QuizResult.findBylectureId(req.params.id);

        let questionIds = new Set();
        let optionIds = new Set();

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questionIds.add(questionId);
                    optionIds.add(result.answers[questionId]);
                }
            }
        }

        // Convert sets to arrays
        const questionIdArray = Array.from(questionIds);
        const optionIdArray = Array.from(optionIds);

        // Batch fetch questions and options
        const questionsList = await Question.findByIds(questionIdArray);
        const optionsList = await Option.findByIds(optionIdArray);

        // Create maps for quick lookup
        const questionMap = Object.fromEntries(questionsList.map(q => [q.id, q]));
        const optionMap = Object.fromEntries(optionsList.map(o => [o.id, o]));

        let questions = [];
        let answers = [];

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questions.push(questionMap[questionId]);
                    answers.push(optionMap[result.answers[questionId]]);
                }
            }
        }
        
        res.status(200).render('quizz', {
            title: course.title,
            quizData,
            course,
            lecture,
            quizResults, 
            questions, 
            answers,
            optionsList,
            courseId: req.params.course_id,
            viewName: 'quizz'
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuizz = async (req, res) => {
    try {
        const course = await Course.findCourse(req.query.course_id);
        const lecture = await Lecture.findLecture(req.params.id);
        const quizData = await Question.getQuestionsAndOptions(req.params.id);
        res.status(200).render('admin/quizz/index', { title: course.title, quizData, course, lecture, courseId: req.params.course_id});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuizzResults = async (req, res) => {
    try {
        const quizResults = await QuizResult.findBylectureId(req.params.id);

        let questionIds = new Set();
        let optionIds = new Set();

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questionIds.add(questionId);
                    optionIds.add(result.answers[questionId]);
                }
            }
        }

        // Convert sets to arrays
        const questionIdArray = Array.from(questionIds);
        const optionIdArray = Array.from(optionIds);

        // Batch fetch questions and options
        const questionsList = await Question.findByIds(questionIdArray);
        const optionsList = await Option.findByIds(optionIdArray);

        // Create maps for quick lookup
        const questionMap = Object.fromEntries(questionsList.map(q => [q.id, q]));
        const optionMap = Object.fromEntries(optionsList.map(o => [o.id, o]));

        let questions = [];
        let answers = [];

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questions.push(questionMap[questionId]);
                    answers.push(optionMap[result.answers[questionId]]);
                }
            }
        }

        res.status(200).json({ quizResults, questions, answers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body.question_text, req.params.id);
        const questions = await Question.findByLectureId(req.params.id);
        const questionIndex = questions.findIndex(q => q.id === question.id) + 1;
 
        res.status(201).json({
            success: true,
            question: { id: question.id, index: questionIndex, question_text: question.question_text },
            courseId: req.params.course_id,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const updateQuestion = async (req, res) => {
    try {
        await Question.update(req.body.question_id, req.body.question_text);
        res.status(201).json({ newText: req.body.question_text })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteQuestion = async (req, res) => {
    try {
        await Question.delete(req.body.id);
        await Option.deleteByQuestionId(req.body.id);
        res.status(200).json({ success: true, message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const createOption = async (req, res) => {
    try {
        const option = await Option.create(
            req.body.option_text,
            req.params.question_id,
            req.body.is_correct
        );

        res.status(201).json({
            success: true,
            option: {
                id: option.id,
                option_text: option.option_text,
                is_correct: option.is_correct,
                question_id: option.question_id
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteOption = async (req, res) => {
    try {
        await Option.delete(req.body.id);
        res.status(200).json({ success: true, message: "Option deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const updateOption = async (req, res) => {
    try {
        await Option.update(req.params.id, req.body.option_text, req.body.is_correct);
        res.status(200).json({ success: true, message: "Option updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const takeQuizz = async (req, res) => {
    try {
        const course = await Course.findById(req.params.course_id);
        const quizData = await Question.getQuestionsAndOptions(req.params.id);
        res.status(200).render('takeQuizz', { title: course.title, quizData, course  });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const saveResults = async (req, res) => {
    try {
        const { user_id, course_id, lecture_id, total_marks, score, answers } = req.body;
        // Save the quiz result
        const quizResult = await QuizResult.create(user_id, course_id, lecture_id, total_marks, score, answers);
        if (!quizResult) throw new Error("Failed to save quiz result.");

        return res.status(200).json({
            success: true,
            message: "Quiz results saved successfully",
            data: quizResult
        });

    } catch (err) {
        console.error("Error saving quiz results:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { showQuizz, getQuizz, createQuestion, updateQuestion, deleteQuestion, createOption, deleteOption,updateOption, takeQuizz, saveResults, getQuizzResults };