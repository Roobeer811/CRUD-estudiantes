// Importa las funciones que necesitas del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de tu aplicación Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7Pge-QF85I0doZKnHdE7zBG1BWsmXyfg",
    authDomain: "crud-js-394b8.firebaseapp.com",
    projectId: "crud-js-394b8",
    storageBucket: "crud-js-394b8.appspot.com",
    messagingSenderId: "260132245242",
    appId: "1:260132245242:web:6ae36a22b666d275af0343",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Eventos al cargar el documento
document.addEventListener("DOMContentLoaded", async () => {
    await mostrarEstudiantes(); // Llamar a mostrarEstudiantes al cargar la página

    const registerForm = document.getElementById("register-form");
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

    // Agregar un evento de escucha para el envío del formulario de registro
    registerForm.addEventListener("submit", registrarOActualizarEstudiante);
});

// Función para validar los datos del formulario
function validarDatosFormulario({ nombre, ape1, ape2, telef, email }) {
    if (!nombre || !ape1 || !ape2 || !telef || !email) {
        alert('Por favor, completa todos los campos requeridos.');
        return false;
    }

    const regexTelefono = /^\d{9}$/;
    if (!regexTelefono.test(telef)) {
        alert('Por favor, introduce un número de teléfono válido.');
        return false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        alert('Por favor, introduce una dirección de correo electrónico válida.');
        return false;
    }

    return true;
}

// Función para registrar o actualizar un estudiante
async function registrarOActualizarEstudiante(e) {
    e.preventDefault();
    const registerForm = document.getElementById("register-form");
    const studentId = registerForm.getAttribute("data-student-id");

    const studentData = {
        nombre: registerForm["nombre"].value.trim(),
        ape1: registerForm["apellido1"].value.trim(),
        ape2: registerForm["apellido2"].value.trim(),
        telef: registerForm["telefono"].value.trim(),
        email: registerForm["email"].value.trim(),
        desc: registerForm["descripcion"].value.trim(),
    };

    if (!validarDatosFormulario(studentData)) {
        return;
    }

    if (studentId) {
        await actualizarEstudiante(studentId, studentData);
        actualizarFilaEstudiante(studentId, studentData);
        alert("Estudiante actualizado correctamente");
    } else {
        const newStudentRef = await push(ref(db, "Students"));
        await set(newStudentRef, studentData);
        agregarFilaEstudiante(newStudentRef.key, studentData);
        alert("Nuevo estudiante registrado");
    }

    registerModal.hide();
    registerForm.reset();
    registerForm.removeAttribute("data-student-id");
}

// Funciones para manejar la UI de la tabla de estudiantes
function agregarFilaEstudiante(studentId, studentData) {
    const studentTableBody = document.getElementById("studentTableBody");
    const row = construirFilaEstudiante(studentId, studentData, studentTableBody.children.length + 1);
    studentTableBody.innerHTML += row;
}

function actualizarFilaEstudiante(studentId, studentData) {
    const existingRow = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (existingRow) {
        const updatedRow = construirFilaEstudiante(studentId, studentData, Array.from(existingRow.parentNode.children).indexOf(existingRow) + 1);
        existingRow.outerHTML = updatedRow;
    }
}

function construirFilaEstudiante(studentId, studentData, index) {
    return `
        <tr data-student-id="${studentId}">
            <th scope="row">${index}</th>
            <td>${studentData.nombre}</td>
            <td>${studentData.ape1}</td>
            <td>${studentData.ape2}</td>
            <td>${studentData.telef}</td>
            <td>${studentData.email}</td>
            <td>
                <button type="button" class="btn btn-warning edit-btn" data-student-id="${studentId}" data-bs-toggle="modal" data-bs-target="#registerModal">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-danger delete-btn" data-student-id="${studentId}">
                    <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
            </td>
        </tr>
    `;
}

// Funciones CRUD
async function mostrarEstudiantes() {
    const students = await obtenerEstudiantes();
    const studentTableBody = document.getElementById("studentTableBody");
    studentTableBody.innerHTML = ""; // Limpiar la tabla antes de agregar datos
    students.forEach((student, index) => {
        const row = construirFilaEstudiante(student.id, student, index + 1);
        studentTableBody.innerHTML += row;
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const studentId = e.target.closest('button').getAttribute('data-student-id');
            cargarDatosEstudianteEnFormulario(studentId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const studentId = e.target.closest('button').getAttribute('data-student-id');
            await eliminarEstudiante(studentId);
            document.querySelector(`tr[data-student-id="${studentId}"]`).remove(); // Eliminar la fila del estudiante directamente
        });
    });
}

async function obtenerEstudiantes() {
    const studentsRef = ref(db, "Students");
    const snapshot = await get(studentsRef);
    const students = [];
    snapshot.forEach(childSnapshot => {
        students.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return students;
}

async function eliminarEstudiante(studentId) {
    await remove(ref(db, `Students/${studentId}`));
    alert("Estudiante eliminado correctamente");
}

async function actualizarEstudiante(studentId, studentData) {
    await update(ref(db, `Students/${studentId}`), studentData);
}

async function cargarDatosEstudianteEnFormulario(studentId) {
    const snapshot = await get(ref(db, `Students/${studentId}`));
    const studentData = snapshot.val();
    const registerForm = document.getElementById("register-form");
    registerForm["nombre"].value = studentData.nombre || "";
    registerForm["apellido1"].value = studentData.ape1 || "";
    registerForm["apellido2"].value = studentData.ape2 || "";
    registerForm["telefono"].value = studentData.telef || "";
    registerForm["email"].value = studentData.email || "";
    registerForm["descripcion"].value = studentData.desc || "";
    registerForm.setAttribute("data-student-id", studentId);
}
