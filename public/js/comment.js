document.addEventListener('DOMContentLoaded', () => {
    const lectureId = document.getElementById('lecture_id').value;
    loadComments(lectureId);

    // Handle new comment submission
    document.getElementById('new-comment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('comment-text').value;
        const user_id = document.getElementById('user_id').value;

        const response = await fetch('/lecture-comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment, user_id, lecture_id: lectureId })
        });

        if (response.ok) {
            document.getElementById('comment-text').value = '';
            loadComments(lectureId);
            const data = await response.json();
            showAlert(data.message, 'success');
        }
    });
});

// Load comments and replies
async function loadComments(lectureId) {
    try {
        const response = await fetch(`/lecture-comments/${lectureId}`);
        if (!response.ok) throw new Error('Failed to load comments');

        const data = await response.json();
        const container = document.getElementById('comments-list');
        container.innerHTML = '';

        // Group comments by parent_comment_id
        const commentMap = {};
        data.comments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        // Build comment tree
        const topLevel = [];
        data.comments.forEach(comment => {
            if (comment.parent_comment_id) {
                if (commentMap[comment.parent_comment_id]) {
                    commentMap[comment.parent_comment_id].replies.push(comment);
                }
            } else {
                topLevel.push(comment);
            }
        });

        // Render comments
        topLevel.forEach(comment => {
            container.appendChild(renderComment(comment));
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        showAlert('Failed to load comments. Please try again.', 'danger');
    }
}

// Render a single comment and its replies
function renderComment(comment) {
    const div = document.createElement('div');
    div.className = 'comment mb-3';
    div.dataset.commentId = comment.id;

    const accordionId = `accordion-${comment.id}`;
    const collapseId = `collapse-${comment.id}`;

    div.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex align-items-start gap-2">
                    <img src="${comment.user_avatar}" alt="User Avatar" 
                         class="rounded-circle mt-1" style="width: 30px; height: 30px;">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                            <strong>${comment.user_name}</strong>
                            <small class="text-muted">${formatDate(comment.created_at)}</small>
                        </div>
                        <p class="mb-2">${comment.comment}</p>
                    </div>
                </div>
                
                <div class="d-flex align-items-center gap-2 mt-2">
                    <button class="btn btn-sm btn-link p-0" onclick="showReplyForm(${comment.id})">
                        Reply
                    </button>
                    <button class="btn btn-sm like-btn ${comment.is_liked ? 'text-primary' : 'text-muted'}" 
                            onclick="toggleLike(${comment.id})" 
                            data-comment-id="${comment.id}">
                        <i class="bi ${comment.is_liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}"></i>
                        <span class="like-count ms-1">${comment.likes_count || 0}</span>
                    </button>
                </div>

                ${comment.replies.length > 0 ? `
                    <div class="accordion mt-2" id="${accordionId}">
                        <div class="accordion-item border-0">
                            <h2 class="accordion-header" id="heading-${comment.id}">
                                <button class="accordion-button collapsed shadow-none bg-light py-1" 
                                        type="button" data-bs-toggle="collapse" 
                                        data-bs-target="#${collapseId}" 
                                        aria-expanded="false" 
                                        aria-controls="${collapseId}">
                                        (${comment.replies.length}) ${comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                </button>
                            </h2>
                            <div id="${collapseId}" class="accordion-collapse collapse" 
                                 aria-labelledby="heading-${comment.id}" 
                                 data-bs-parent="#${accordionId}">
                                <div class="accordion-body p-0 pt-2 replies"></div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="reply-form mt-3" id="reply-form-${comment.id}" style="display:none;">
                    <textarea rows="2" class="form-control mb-2" 
                              placeholder="Type your reply..." 
                              id="reply-text-${comment.id}"></textarea>
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="document.getElementById('reply-form-${comment.id}').style.display='none'">
                            Cancel
                        </button>
                        <button class="btn btn-sm btn-primary" 
                                onclick="submitReply(${comment.id})">
                            Post Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render replies if any
    const repliesDiv = div.querySelector('.replies');
    if (repliesDiv && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
            repliesDiv.appendChild(renderComment(reply));
        });
    }

    return div;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString(); // Adjust format as needed
}

async function toggleLike(commentId) {
    const likeBtn = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
    const likeIcon = likeBtn.querySelector('i');
    const likeCount = likeBtn.querySelector('.like-count');
    const userId = document.getElementById('user_id').value;

    if (!userId) {
        showAlert('Please login to like comments', 'warning');
        return;
    }

    try {
        const response = await fetch(`/lecture-comments/like/${commentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        });

        if (response.ok) {
            const result = await response.json();

            // Update UI
            if (result.action === 'liked') {
                likeBtn.classList.remove('text-muted');
                likeBtn.classList.add('text-primary');
                likeIcon.classList.remove('bi-hand-thumbs-up');
                likeIcon.classList.add('bi-hand-thumbs-up-fill');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                likeBtn.classList.remove('text-primary');
                likeBtn.classList.add('text-muted');
                likeIcon.classList.remove('bi-hand-thumbs-up-fill');
                likeIcon.classList.add('bi-hand-thumbs-up');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        } else {
            throw new Error('Failed to toggle like');
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        showAlert('Failed to update like. Please try again.', 'danger');
    }
}

function showReplyForm(commentId) {
    document.getElementById(`reply-form-${commentId}`).style.display = 'block';
}

async function submitReply(parentCommentId) {
    const comment = document.getElementById(`reply-text-${parentCommentId}`).value;
    const user_id = document.getElementById('user_id').value;
    const lecture_id = document.getElementById('lecture_id').value;
    const response = await fetch('/lecture-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, user_id, lecture_id, parent_comment_id: parentCommentId })
    });

    if (response.ok) {
        loadComments(lecture_id);
        showAlert('Reply submitted successfully!', 'success');
    }
}