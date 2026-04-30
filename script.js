// ---------- COURSES ----------
function addCourse() {
    const input = document.getElementById("courseInput");
    const list = document.getElementById("courseList");

    if (input.value.trim() !== "") {
        const li = document.createElement("li");

        li.textContent = input.value;

        // click to remove
        li.onclick = () => li.remove();

        list.appendChild(li);
        input.value = "";
    }
}

// ---------- GPA CALCULATOR ----------
let grades = [];

function addGrade() {
    const input = document.getElementById("gradeInput");
    const result = document.getElementById("gpaResult");

    let value = parseFloat(input.value);

    // validate input (0–4 scale)
    if (!isNaN(value) && value >= 0 && value <= 4) {
        grades.push(value);

        let sum = 0;
        for (let i = 0; i < grades.length; i++) {
            sum += grades[i];
        }

        let gpa = (sum / grades.length).toFixed(2);

        result.textContent = "GPA: " + gpa;
        input.value = "";
    } else {
        alert("Enter a valid grade between 0 and 4");
    }
}

// ---------- TO-DO LIST ----------
function addTask() {
    const input = document.getElementById("taskInput");
    const list = document.getElementById("taskList");

    if (input.value.trim() !== "") {
        const li = document.createElement("li");

        li.textContent = input.value;

        // click to remove task
        li.onclick = () => li.remove();

        list.appendChild(li);
        input.value = "";
    }
}
