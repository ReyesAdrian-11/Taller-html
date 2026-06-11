"use strict";

const studentForm = document.getElementById("studentForm");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const emptyState = document.getElementById("emptyState");
const studentCount = document.getElementById("studentCount");
const searchInput = document.getElementById("searchInput");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEdit = document.getElementById("cancelEdit");
const clearButton = document.getElementById("clearButton");
const formMessage = document.getElementById("formMessage");

const fieldIds = [
    "cedula",
    "apellidos",
    "nombres",
    "direccion",
    "telefono",
    "correo",
    "facultad",
    "nivel",
    "paralelo"
];

let students = loadStudents();
let editingIndex = null;

function loadStudents() {
    try {
        const stored = JSON.parse(localStorage.getItem("students") || "[]");
        return Array.isArray(stored) ? stored : [];
    } catch {
        return [];
    }
}

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}

function normalize(value) {
    return value.trim().replace(/\s+/g, " ");
}

function renderTable() {
    const query = searchInput.value.trim().toLocaleLowerCase("es");
    const visibleStudents = students
        .map((student, index) => ({ student, index }))
        .filter(({ student }) =>
            Object.values(student).join(" ").toLocaleLowerCase("es").includes(query)
        );

    studentsTableBody.innerHTML = visibleStudents.map(({ student, index }) => `
        <tr>
            <td>
                <span class="dato-principal">${escapeHtml(student.apellidos)}, ${escapeHtml(student.nombres)}</span>
                <span class="dato-secundario">C.I. ${escapeHtml(student.cedula)}</span>
            </td>
            <td>
                <span>${escapeHtml(student.telefono)}</span>
                <span class="dato-secundario">${escapeHtml(student.correo)}</span>
            </td>
            <td>
                <span>${escapeHtml(student.facultad)}</span>
                <span class="dato-secundario">${escapeHtml(student.direccion)}</span>
            </td>
            <td><span class="curso">${escapeHtml(student.nivel)} · ${escapeHtml(student.paralelo)}</span></td>
            <td>
                <div class="acciones">
                    <button class="boton-tabla" type="button" data-edit="${index}">Editar</button>
                </div>
            </td>
        </tr>
    `).join("");

    const noResults = visibleStudents.length === 0;
    document.getElementById("studentsTable").classList.toggle("oculto", noResults);
    emptyState.classList.toggle("oculto", !noResults);
    emptyState.querySelector("h3").textContent =
        students.length && noResults ? "No hay coincidencias" : "No hay estudiantes registrados";
    emptyState.querySelector("p").textContent =
        students.length && noResults
            ? "Prueba con otro nombre, cédula o facultad."
            : "Los registros aparecerán aquí automáticamente.";
    studentCount.textContent = students.length;
}

function validateStudent(student) {
    const regexCedula = /^[0-9]{10}$/;
    const regexTexto = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/;
    const regexTelefono = /^[0-9]{7,10}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidFields = [];

    if (!regexCedula.test(student.cedula)) invalidFields.push("cedula");
    if (!regexTexto.test(student.apellidos)) invalidFields.push("apellidos");
    if (!regexTexto.test(student.nombres)) invalidFields.push("nombres");
    if (!student.direccion) invalidFields.push("direccion");
    if (!regexTelefono.test(student.telefono)) invalidFields.push("telefono");
    if (!regexCorreo.test(student.correo)) invalidFields.push("correo");
    if (!regexTexto.test(student.facultad)) invalidFields.push("facultad");
    if (!student.nivel) invalidFields.push("nivel");
    if (!/^[A-Za-z0-9]{1,2}$/.test(student.paralelo)) invalidFields.push("paralelo");

    fieldIds.forEach((id) => {
        document.getElementById(id).classList.toggle("invalido", invalidFields.includes(id));
    });

    if (invalidFields.length) {
        formMessage.textContent = "Revisa los campos marcados. La cédula debe tener 10 dígitos y el correo debe ser válido.";
        document.getElementById(invalidFields[0]).focus();
        return false;
    }

    const duplicated = students.some(
        (savedStudent, index) => savedStudent.cedula === student.cedula && index !== editingIndex
    );
    if (duplicated) {
        document.getElementById("cedula").classList.add("invalido");
        formMessage.textContent = "Ya existe un estudiante con esta cédula.";
        return false;
    }

    formMessage.textContent = "";
    return true;
}

function getStudentFromForm() {
    return {
        cedula: normalize(document.getElementById("cedula").value),
        apellidos: normalize(document.getElementById("apellidos").value),
        nombres: normalize(document.getElementById("nombres").value),
        direccion: normalize(document.getElementById("direccion").value),
        telefono: normalize(document.getElementById("telefono").value),
        correo: normalize(document.getElementById("correo").value).toLocaleLowerCase("es"),
        facultad: normalize(document.getElementById("facultad").value),
        nivel: normalize(document.getElementById("nivel").value),
        paralelo: normalize(document.getElementById("paralelo").value).toLocaleUpperCase("es")
    };
}

function resetForm() {
    studentForm.reset();
    editingIndex = null;
    formTitle.textContent = "Nuevo registro";
    submitButton.textContent = "Registrar estudiante";
    cancelEdit.classList.add("oculto");
    formMessage.textContent = "";
    document.querySelectorAll(".invalido").forEach((field) => field.classList.remove("invalido"));
}

function editStudent(index) {
    const student = students[index];
    if (!student) return;

    editingIndex = index;
    fieldIds.forEach((id) => {
        document.getElementById(id).value = student[id];
    });
    formTitle.textContent = "Editar estudiante";
    submitButton.textContent = "Guardar cambios";
    cancelEdit.classList.remove("oculto");
    formMessage.textContent = "";
    document.querySelectorAll(".invalido").forEach((field) => field.classList.remove("invalido"));
    document.querySelector(".form-container").scrollIntoView({ behavior: "smooth", block: "start" });
}

studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const student = getStudentFromForm();
    if (!validateStudent(student)) return;

    if (editingIndex === null) {
        students.push(student);
    } else {
        students[editingIndex] = student;
    }

    saveStudents();
    resetForm();
    renderTable();
});

studentsTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit]");
    if (button) editStudent(Number(button.dataset.edit));
});

document.getElementById("cedula").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
});

document.getElementById("paralelo").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^A-Za-z0-9]/g, "").toLocaleUpperCase("es");
});

searchInput.addEventListener("input", renderTable);
cancelEdit.addEventListener("click", resetForm);
clearButton.addEventListener("click", resetForm);

renderTable();
