
const STORAGE_KEY = "studentManagementRecords";

const studentForm = document.getElementById("studentForm");
const studentDialog = document.getElementById("studentDialog");
const studentTableBody = document.getElementById("studentTableBody");

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");
const yearFilter = document.getElementById("yearFilter");

const formError = document.getElementById("formError");
const toast = document.getElementById("toast");

let students = loadStudents();
let editingStudentId = null;
let toastTimer;

// Read saved students from localStorage
function loadStudents() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const parsedData = savedData ? JSON.parse(savedData) : [];

        if (!Array.isArray(parsedData)) {
            return [];
        }

        // Check that saved records have the expected fields.
        return parsedData.filter(student =>
            student &&
            typeof student.id === "string" &&
            typeof student.name === "string" &&
            typeof student.email === "string" &&
            typeof student.department === "string" &&
            ["1", "2", "3", "4"].includes(String(student.year))
        ).map(student => ({
            ...student,
            year: String(student.year)
        }));
    } catch (error) {
        console.error("Could not load student data:", error);
        return [];
    }
}

// Save the current student list
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        console.error("Could not save student data:", error);
        showToast("Could not save data. Check browser storage.");
        return false;
    }
}

// Display temporary success or error messages
function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// Convert year numbers into readable labels
function getYearLabel(year) {
    const labels = {
        "1": "First Year",
        "2": "Second Year",
        "3": "Third Year",
        "4": "Final Year"
    };

    return labels[String(year)] || "Unknown";
}

// Create an HTML element safely using textContent
function createCell(text, className = "") {
    const cell = document.createElement("td");
    cell.textContent = text;

    if (className) {
        cell.className = className;
    }

    return cell;
}

// Create a badge without inserting untrusted HTML
function createBadge(text, className) {
    const badge = document.createElement("span");
    badge.className = className;
    badge.textContent = text;
    return badge;
}

// Update the four dashboard summary cards
function updateStats() {
    document.getElementById("totalStudents").textContent =
        students.length;

    const departments = new Set(
        students.map(student => student.department)
    );

    document.getElementById("totalDepartments").textContent =
        departments.size;

    document.getElementById("firstYearCount").textContent =
        students.filter(student => student.year === "1").length;

    document.getElementById("finalYearCount").textContent =
        students.filter(student => student.year === "4").length;
}

// Get students matching the search and filters
function getFilteredStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const department = departmentFilter.value;
    const year = yearFilter.value;

    return students.filter(student => {
        const matchesSearch =
            student.id.toLowerCase().includes(query) ||
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query);

        const matchesDepartment =
            !department || student.department === department;

        const matchesYear =
            !year || student.year === year;

        return matchesSearch && matchesDepartment && matchesYear;
    });
}

// Draw the student table
function renderStudents() {
    const filteredStudents = getFilteredStudents();

    studentTableBody.replaceChildren();

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        // Student ID
        row.appendChild(createCell(student.id));

        // Student name and avatar
        const nameCell = document.createElement("td");

        const avatar = createBadge(
            student.name.trim().charAt(0).toUpperCase() || "?",
            "student-avatar"
        );

        const name = document.createElement("span");
        name.className = "student-name";
        name.textContent = student.name;

        nameCell.append(avatar, name);
        row.appendChild(nameCell);

        // Email
        row.appendChild(createCell(student.email));

        // Department badge
        const departmentCell = document.createElement("td");
        departmentCell.appendChild(
            createBadge(student.department, "department-badge")
        );
        row.appendChild(departmentCell);

        // Academic year badge
        const yearCell = document.createElement("td");
        yearCell.appendChild(
            createBadge(getYearLabel(student.year), "year-badge")
        );
        row.appendChild(yearCell);

        // Edit and delete buttons
        const actionCell = document.createElement("td");
        const actionGroup = document.createElement("div");
        actionGroup.className = "action-group";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.setAttribute(
            "aria-label",
            `Edit ${student.name}`
        );
        editButton.addEventListener("click", () => {
            openEditDialog(student.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete ${student.name}`
        );
        deleteButton.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        actionGroup.append(editButton, deleteButton);
        actionCell.appendChild(actionGroup);
        row.appendChild(actionCell);

        studentTableBody.appendChild(row);
    });

    document.getElementById("recordCount").textContent =
        `${filteredStudents.length} record${filteredStudents.length === 1 ? "" : "s"}`;

    document.getElementById("emptyState").hidden =
        filteredStudents.length > 0;

    updateStats();
}

// Open a blank form for a new student
function openAddDialog() {
    editingStudentId = null;
    studentForm.reset();
    formError.textContent = "";
    document.getElementById("dialogTitle").textContent = "Add Student";

    studentDialog.showModal();
    document.getElementById("studentId").focus();
}

// Open the form with existing student details
function openEditDialog(id) {
    const student = students.find(item => item.id === id);

    if (!student) {
        showToast("Student record not found.");
        return;
    }

    editingStudentId = id;
    formError.textContent = "";

    document.getElementById("dialogTitle").textContent = "Edit Student";
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentDepartment").value =
        student.department;
    document.getElementById("studentYear").value = student.year;

    studentDialog.showModal();
}

// Add a student or update an existing student
studentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    formError.textContent = "";

    const id = document.getElementById("studentId").value.trim();
    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const department =
        document.getElementById("studentDepartment").value;
    const year = document.getElementById("studentYear").value;

    if (!id || !name || !email || !department || !year) {
        formError.textContent = "Please complete every field.";
        return;
    }

    // Student IDs must be unique, ignoring letter case.
    const duplicate = students.some(student =>
        student.id.toLowerCase() === id.toLowerCase() &&
        student.id !== editingStudentId
    );

    if (duplicate) {
        formError.textContent =
            "This student ID already exists. Please use a different ID.";
        return;
    }

    const studentData = {
        id,
        name,
        email,
        department,
        year
    };

    let updatedStudents;

    if (editingStudentId !== null) {
        updatedStudents = students.map(student =>
            student.id === editingStudentId
                ? studentData
                : student
        );
    } else {
        updatedStudents = [...students, studentData];
    }

    // Update in memory only if saving succeeds.
    const previousStudents = students;
    students = updatedStudents;

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    studentDialog.close();
    renderStudents();

    showToast(
        editingStudentId !== null
            ? "Student updated successfully!"
            : "Student added successfully!"
    );

    editingStudentId = null;
});

// Delete a student after confirmation
function deleteStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) {
        showToast("Student record not found.");
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) {
        return;
    }

    const previousStudents = students;
    students = students.filter(item => item.id !== id);

    if (!saveStudents()) {
        students = previousStudents;
        return;
    }

    renderStudents();
    showToast("Student deleted successfully!");
}

// Close the dialog and clear form errors
function closeDialog() {
    studentDialog.close();
    formError.textContent = "";
}

// Search and filters update the table instantly
searchInput.addEventListener("input", renderStudents);
departmentFilter.addEventListener("change", renderStudents);
yearFilter.addEventListener("change", renderStudents);

// Reset search and filters
document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    searchInput.value = "";
    departmentFilter.value = "";
    yearFilter.value = "";
    renderStudents();
});

// Buttons that open and close the form
document.getElementById("addStudentBtn").addEventListener(
    "click",
    openAddDialog
);

document.getElementById("closeDialogBtn").addEventListener(
    "click",
    closeDialog
);

document.getElementById("cancelBtn").addEventListener(
    "click",
    closeDialog
);

// Initial page rendering
renderStudents();
