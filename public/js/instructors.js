const instructorsData = document.getElementById('Instructors-data');

document.addEventListener("DOMContentLoaded", function () {
    fetchInstructors();

    // Event delegation for dynamically added buttons
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-instructor')) {
            const id = e.target.getAttribute('data-id');
            deleteInstructor(id);
        }

        if (e.target.classList.contains('block-instructor')) {
            const id = e.target.getAttribute('data-id');
            const isBlocked = e.target.getAttribute('data-blocked') === 'true';
            toggleBlockInstructor(id, isBlocked, e.target);
        }
    });
});

function fetchInstructors() {
    fetch("/admin/get-instructors", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-cache",
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        instructorsData.innerHTML = '';
        data.forEach(instructor => {
            instructorsData.innerHTML += renderInstructors(instructor);
        });
    }).catch(error => {
        console.error("Error fetching instructors:", error);
        instructorsData.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Failed to load instructors. Please try again later.
                        </td>
                    </tr>
                `;
        showAlert('Failed to load instructors. Please try again later.', 'danger');
    });
}

function renderInstructors(instructor) {
    const isBlocked = instructor.status === 'blocked';
    return `
        <tr id="instructor-row-${instructor.user_id}">
            <td>
                <img src="${instructor.avatar}" alt="avatar" width="40px" class="rounded-circle">
                ${instructor.name}
            </td>
            <td>${instructor.email}</td>
            <td><a href="${instructor.repository_link}" target="_blank">Visit Repo</a></td>
            <td><a href="${instructor.page_link}" target="_blank">Visit Page</a></td>
            <td>
                <span class="status-badge badge ${isBlocked ? 'bg-danger' : 'bg-success'}">
                    ${isBlocked ? 'Blocked' : 'Active'}
                </span>
            </td>
            <td class="text-center">
                <div class="dropdown">
                    <button class="bg-transparent rounded-circle border-1 border-muted px-1 outline-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <a class="text-decoration-none text-dark" href="/users/${instructor.user_id}/profile">
                        <li class="dropdown-item mb-1">
                                <i class="bi bi-eye"></i>
                                View
                        </li>
                        </a>
                        <li class="dropdown-item mb-1">
                            <button class="text-start w-100 bg-transparent border-0 outline-0 block-instructor" 
                                    data-id="${instructor.user_id}" data-blocked="${isBlocked}">
                                ${isBlocked ? '<i class="bi bi-unlock"></i> Unblock' : '<i class="bi bi-lock"></i> Block'}
                            </button>
                        </li>
                        <li class="dropdown-item mb-1">
                            <button class="text-start w-100 bg-transparent border-0 outline-0 delete-instructor" data-id="${instructor.user_id}">
                                <i class="bi bi-trash"></i>
                                Delete
                            </button>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
    `;
}

function deleteInstructor(id) {
    if (!confirm('Are you sure you want to delete this instructor?')) {
        return;
    }

    fetch(`/admin/delete/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        const row = document.getElementById(`instructor-row-${id}`);
        if (row) row.remove();
        showAlert('Instructor deleted successfully!', 'success');
    }).catch(error => {
        console.error("Error deleting instructor:", error);
        showAlert('Failed to delete instructor.', 'danger');
    });
}

function toggleBlockInstructor(id, isBlocked, button) {
    const action = isBlocked ? 'unblock' : 'block';
    const url = `/admin/${action}/${id}`;
    
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Check for both possible success indicators
        const success = data.success || data.message?.includes('successfully');
        
        if (success) {
            // Update the button
            const newBlockedStatus = !isBlocked;
            button.setAttribute('data-blocked', newBlockedStatus);
            button.innerHTML = newBlockedStatus ? 
                '<i class="bi bi-unlock"></i> Unblock' : 
                '<i class="bi bi-lock"></i> Block';

            // Find and update the status badge
            const row = document.getElementById(`instructor-row-${id}`);
            if (row) {
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.className = `status-badge badge ${newBlockedStatus ? 'bg-danger' : 'bg-success'}`;
                    statusBadge.textContent = newBlockedStatus ? 'Blocked' : 'Active';
                }
            }
            
            showAlert(`Instructor ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully!`, 'success');
        } else {
            throw new Error(data.message || 'Action failed');
        }
    })
    .catch(error => {
        console.error(`Error ${action}ing instructor:`, error);
        showAlert(error.message || `Failed to ${action} instructor.`, 'danger');
    });
}