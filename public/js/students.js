
const studentsData = document.getElementById('students-data');

document.addEventListener("DOMContentLoaded", function () {
    fetchStudents();

    // Event delegation for dynamically added buttons
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-student')) {
            const id = e.target.getAttribute('data-id');
            deleteStudent(id);
        }

        if (e.target.classList.contains('block-student')) {
            const id = e.target.getAttribute('data-id');
            const isBlocked = e.target.getAttribute('data-blocked') === 'true';
            toggleBlockStudent(id, isBlocked, e.target);
        }
    });
});

function fetchStudents() {
    fetch("/admin/get-students", {
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
        studentsData.innerHTML = '';
        data.forEach(student => {
            studentsData.innerHTML += renderStudents(student);
        });
    }).catch(error => {
        console.error("Error fetching students:", error);
        studentsData.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Failed to load students. Please try again later.
                        </td>
                    </tr>
                `;
        showAlert('Failed to load students. Please try again later.', 'danger');
    });
}

function renderStudents(student) {
    const isBlocked = student.status === 'blocked';
    return `
                <tr id="student-${student.id}">
                    <td>
                        <img src="${student.avatar}" alt="avatar" width="40px" class="rounded-circle">
                        ${student.name}
                    </td>
                    <td>${student.email}</td>
                    <td>${student.repository_link ? '<a href="${student.repository_link}" target="_blank">Visit Repo</a>' : '-' }</td>
                    <td>${student.page_link ? '<a href="${student.page_link}" target="_blank">Visit Page</a>' : '-' }</td>
                    <td>
                        <span class="badge ${isBlocked ? 'bg-danger' : 'bg-success'}">
                            ${isBlocked ? 'Blocked' : 'Active'}
                        </span>
                    </td>
                    <td class="text-center">
                        <div class="dropdown">
                            <button class="bg-transparent rounded-circle border-1 border-muted px-1 outline-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <a class="text-decoration-none text-dark" href="/users/${student.id}/profile">
                                <li class="dropdown-item mb-1">
                                        <i class="bi bi-eye"></i>
                                        View
                                </li>
                                </a>
                                <li class="dropdown-item mb-1">
                                    <button class="text-start w-100 bg-transparent border-0 outline-0 block-student" 
                                            data-id="${student.id}" data-blocked="${isBlocked}">
                                        ${isBlocked ? '<i class="bi bi-unlock"></i> Unblock' : '<i class="bi bi-lock"></i> Block'}
                                    </button>
                                </li>
                                <li class="dropdown-item mb-1">
                                    <button class="text-start w-100 bg-transparent border-0 outline-0 delete-student" data-id="${student.id}">
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

function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) {
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
        document.getElementById(`student-${id}`).remove();
        showAlert('Student deleted successfully!');
    }).catch(error => {
        console.error("Error deleting student:", error);
        showAlert('Failed to delete student.', 'danger');
    });
}

function toggleBlockStudent(id, isBlocked, button) {
    const action = isBlocked ? 'unblock' : 'block';
    const url = `/admin/${action}/${id}`;

    fetch(url, {
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
        // Update the button and status in the table
        const newBlockedStatus = !isBlocked;
        button.setAttribute('data-blocked', newBlockedStatus);
        button.innerHTML = newBlockedStatus ? '<i class="bi bi-unlock"></i> Unblock' : '<i class="bi bi-lock"></i> Block';

        // Update status badge
        const row = document.getElementById(`student-${id}`);
        const statusBadge = row.querySelector('td:nth-child(5) span');
        statusBadge.className = `badge ${newBlockedStatus ? 'bg-danger' : 'bg-success'}`;
        statusBadge.textContent = newBlockedStatus ? 'Blocked' : 'Active';

        showAlert(`Student ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully!`);
    }).catch(error => {
        console.error(`Error ${action}ing student:`, error);
        showAlert(`Failed to ${action} student.`, 'danger');
    });
}