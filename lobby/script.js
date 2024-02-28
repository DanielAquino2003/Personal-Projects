// Obtén referencias a los elementos del DOM
const taskInput = document.getElementById("task-input");
const taskDatetime = document.getElementById("task-datetime");
const taskType = document.getElementById("task-type");
const taskSubject = document.getElementById("task-subject");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const imageButton = document.getElementById("image-button");
const filterType = document.getElementById('filter-type');
const filterSubject = document.getElementById('filter-subject');

let tasks = [];

function addTask() {
  const taskText = taskInput.value.trim();
  const taskDate = taskDatetime.value;
  const taskSubjectValue = taskSubject.value;
  const taskTypeValue = taskType.value;

  if (taskText !== "") {
    tasks.push({ text: taskText, datetime: taskDate, type: taskTypeValue, subject: taskSubjectValue });
    filterTasks();
    taskInput.value = "";
    taskDatetime.value = "";
    taskType.value = "";
    taskSubject.value = "";
    saveTasks();
  }
}

function deleteTask(index) {
  tasks.splice(index, 1);
  filterTasks();
  saveTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks !== null) {
    tasks = JSON.parse(savedTasks);
  }
  filterType.value = "all";
  filterSubject.value = "Todas";
  filterTasks();
}

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Agregar ceros iniciales
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

filterType.addEventListener('change', filterTasks);
filterSubject.addEventListener('change', filterTasks);

// Manejar la presión de "Enter" en el input
taskInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Añadir tarea al hacer clic en el botón
addTaskButton.addEventListener("click", addTask);

imageButton.addEventListener("click", function () {
  const imageUrl = "images/horario.jpg"; // Reemplaza con la URL de tu imagen
  window.open(imageUrl, "_blank", "width=400, height=400");
});

function updateTaskList(filterType, filterSubject) {
  taskList.innerHTML = "";

  const currentDate = new Date();

  tasks.sort((a, b) => {
    const dateA = new Date(a.datetime);
    const dateB = new Date(b.datetime);

    return dateA - dateB;
  });

  const filteredTasks = tasks.filter(task => (filterType === 'all' || task.type === filterType) && (filterSubject === 'Todas' || task.subject === filterSubject));


  if (filteredTasks.length === 0) {
    // No existen tareas con el filtro seleccionado
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("no-tasks-message");
    messageDiv.innerHTML = 'No existen tareas con estas características';
    taskList.appendChild(messageDiv);
  } else {
    tasks.forEach((task, index) => {
      if ((filterType === 'all' || task.type === filterType) && (filterSubject === 'Todas' || task.subject == filterSubject)) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task-item");

        const taskDate = new Date(task.datetime);
        const timeRemaining = taskDate - currentDate;
        const formattedDateTime = task.datetime ? formatDateTime(taskDate) : ''; // Comprobación para la fecha

        const daysRemaining = task.datetime ? Math.floor(timeRemaining / (24 * 60 * 60 * 1000) + 1) : ''; // Comprobación para la fecha
        if (task.datetime) {
          if (timeRemaining < 0) {
            // La tarea ha pasado
            taskItem.classList.add("task-past");
          } else if (daysRemaining > 1 && daysRemaining <= 2) {
            // La tarea es para hoy
            taskItem.classList.add("task-urgent");
          } else if (daysRemaining <= 4 && daysRemaining > 2) {
            // La tarea es en los próximos 3 días
            taskItem.classList.add("task-less-urgent");
          } else if (daysRemaining <= 7 && daysRemaining > 4) {
            // La tarea es en menos de 7 días
            taskItem.classList.add("task-soon"); // Nueva clase para tareas cercanas
          }
          else if (daysRemaining <= 1) {
            taskItem.classList.add("task-hoy");
          }
          else {
            taskItem.classList.add("task-normal")
          }
        }
        taskItem.innerHTML = `
            <span class= "task-text">${task.text}</span>
            <span class="task-type">${task.type}</span>
            <span class="task-subject">${task.subject}</span>
            ${formattedDateTime ? `<span class="task-datetime">${formattedDateTime}</span>` : ''}
            ${daysRemaining ? `<span class="task-remaining">${daysRemaining} días restantes</span>` : ''} 
            <button onclick="finishTask(${index})">Terminar tarea</button>
            <button onclick="deleteTask(${index})">Borrar</button>
          `;
        taskItem.setAttribute('data-task-type', task.type);
        taskItem.setAttribute('data-task-subject', task.subject);
        taskList.appendChild(taskItem);
      }
    });
  }
}

function filterTasks() {
  const selectedType = filterType.value;
  const selectedSubject = filterSubject.value;
  updateTaskList(selectedType, selectedSubject);
}

function finishTask(index) {
  const task = tasks[index];

  if (task.type === "Examen") {
    const sliderDiv = document.createElement("div");
    // Agrega el botón de "Cancelar"
    sliderDiv.innerHTML = `
      <div id="terminar-examen">
        <p>Por favor, elige una nota del 0 al 10 para este examen:</p>
        <input type="range" id="gradeSlider" min="0" max="10" step="0.1" value="5">
        <output for="gradeSlider" id="gradeOutput">5</output>
        <button id="finishButton">Terminar</button>
        <button id="cancelButton">Cancelar</button>
      </div>
    `;


    sliderDiv.classList.add("grade-slider");

    taskList.appendChild(sliderDiv);

    const gradeSlider = document.getElementById("gradeSlider");
    const gradeOutput = document.getElementById("gradeOutput");
    const finishButton = document.getElementById("finishButton");

    gradeSlider.addEventListener("input", function () {
      gradeOutput.value = gradeSlider.value;
    });

    finishButton.addEventListener("click", function () {
      const grade = parseFloat(gradeSlider.value);

      if (grade >= 0 && grade <= 10) {
        if (grade <= 3) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'La nota es muy baja';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
        if (grade < 5 && grade > 3) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'Hay que estudiar más';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
        if (grade >= 5 && grade < 6) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'Un aprobado es un aprobado';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
        if (grade < 8 && grade >= 6) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'Boff vaya maquina';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
        if (grade < 10 && grade >= 8) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'Pero tio bajale a eso';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
        if (grade == 10) {
          // Si la nota es menor que 3, mostrar mensaje
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("warning-message");
          messageDiv.innerHTML = 'Fakin bestia';
          taskList.appendChild(messageDiv);

          setTimeout(() => {
            // Eliminar la tarea y el mensaje después de 3 segundos
            tasks.splice(index, 1);
            taskList.removeChild(sliderDiv);
            taskList.removeChild(messageDiv);
            updateTaskList("all");
            saveTasks();
          }, 1500);
        }
      }
    });
    const cancelButton = document.getElementById("cancelButton");
    cancelButton.addEventListener("click", function () {
      // Oculta el formulario de terminación
      taskList.removeChild(sliderDiv);
    });
  } else if (task.type === "Práctica") {
    // Si la tarea es de tipo "Práctica", mostrar un formulario para adjuntar un archivo
    const practiceDiv = document.createElement("div");
    practiceDiv.innerHTML = `
      <div id="terminar-practica">
        <h3>Por favor, adjunta un archivo para validar la práctica:</h3>
        <input type="file" id="practiceFile" accept=".pdf, .docx, .zip">
        <button id="finishPracticeButton">Enviar</button>
        <button id="cancelButton">Cancelar</button>
      </div>
    `;
    practiceDiv.classList.add("practice-validation");

    taskList.appendChild(practiceDiv);

    const practiceFileInput = document.getElementById("practiceFile");
    const finishPracticeButton = document.getElementById("finishPracticeButton");

    finishPracticeButton.addEventListener("click", function () {
      // Validar si se adjuntó un archivo
      if (practiceFileInput.files.length > 0) {
        // Aquí puedes realizar la validación del archivo o proceso necesario
        // Luego, puedes borrar la tarea y el formulario de validación
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("success-message");
        messageDiv.innerHTML = '<h3 class="pr-enviada">Tarea de práctica validada correctamente.</h3>';
        taskList.appendChild(messageDiv);

        setTimeout(() => {
          // Eliminar la tarea y el mensaje después de 3 segundos
          tasks.splice(index, 1);
          taskList.removeChild(practiceDiv);
          taskList.removeChild(messageDiv);
          updateTaskList("all");
          saveTasks();
        }, 1500);
      } else {
        // Mostrar un mensaje de error si no se adjuntó ningún archivo
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("error-message");
        taskList.appendChild(messageDiv);

        setTimeout(() => {
          // Eliminar el mensaje de error después de 3 segundos
          taskList.removeChild(messageDiv);
        }, 1500);
      }
    });
    const cancelButton = document.getElementById("cancelButton");
    cancelButton.addEventListener("click", function () {
      // Oculta el formulario de terminación
      taskList.removeChild(practiceDiv);
    });
  }
  else {
    // Si la tarea no es de tipo "Examen," eliminarla sin pedir una nota
    tasks.splice(index, 1);
    updateTaskList("all");
    saveTasks();
  }
}


loadTasks();
