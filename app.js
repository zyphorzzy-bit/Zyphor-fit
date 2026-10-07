const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".nav-button");

const storageKey = "zyphorFitData";

let data = JSON.parse(localStorage.getItem(storageKey)) || {
    workouts: 0,
    totalMinutes: 0,
    streak: 0,
    lastWorkout: null
};

let timerInterval = null;
let timerSeconds = 60;
let currentWorkout = null;

const workouts = {
    peito: {
        name: "Peito",
        exercises: [
            ["Flexão", "3 séries × 10 repetições"],
            ["Flexão inclinada", "3 séries × 8 repetições"],
            ["Flexão com joelhos", "2 séries × 10 repetições"]
        ]
    },

    costas: {
        name: "Costas",
        exercises: [
            ["Superman", "3 séries × 12 repetições"],
            ["Remada com mochila", "3 séries × 10 repetições"]
        ]
    },

    bracos: {
        name: "Braços",
        exercises: [
            ["Rosca com mochila", "3 séries × 10 repetições"],
            ["Tríceps", "3 séries × 10 repetições"]
        ]
    },

    pernas: {
        name: "Pernas",
        exercises: [
            ["Agachamento", "3 séries × 12 repetições"],
            ["Afundo", "3 séries × 8 repetições por lado"]
        ]
    },

    abdomen: {
        name: "Abdômen",
        exercises: [
            ["Prancha", "3 séries × 30 segundos"],
            ["Abdominal", "3 séries × 12 repetições"]
        ]
    },

    corpo: {
        name: "Corpo inteiro",
        exercises: [
            ["Agachamento", "3 séries × 12 repetições"],
            ["Flexão", "3 séries × 10 repetições"],
            ["Prancha", "3 séries × 30 segundos"]
        ]
    }
};


/* =========================
   NAVEGAÇÃO
========================= */

function showScreen(id) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const selected = document.getElementById(id);

    if (selected) {
        selected.classList.add("active");
    }

    navButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.screen === id
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        showScreen(button.dataset.screen);
    });
});

document
    .getElementById("settingsButton")
    .addEventListener("click", () => {
        showScreen("settingsScreen");
    });


/* =========================
   DADOS
========================= */

function saveData() {
    localStorage.setItem(
        storageKey,
        JSON.stringify(data)
    );

    updateStats();
}

function updateStats() {
    document.getElementById("workoutCount").textContent =
        data.workouts;

    document.getElementById("progressWorkouts").textContent =
        data.workouts;

    document.getElementById("totalTime").textContent =
        `${data.totalMinutes} min`;

    document.getElementById("progressTime").textContent =
        `${data.totalMinutes} min`;

    document.getElementById("streak").textContent =
        `${data.streak} dias`;

    document.getElementById("progressStreak").textContent =
        `${data.streak} dias`;
}

updateStats();


/* =========================
   INICIAR TREINO
========================= */

document
    .getElementById("startToday")
    .addEventListener("click", () => {
        startWorkout("corpo");
    });

document
    .querySelectorAll(".workout-card")
    .forEach(card => {

        card.addEventListener("click", () => {
            startWorkout(card.dataset.workout);
        });

    });


function startWorkout(type) {

    currentWorkout = {
        type,
        exerciseIndex: 0,
        series: 1,
        startTime: Date.now()
    };

    const workout = workouts[type];

    document.getElementById("activeWorkoutCategory")
        .textContent = "TREINO";

    document.getElementById("activeWorkoutName")
        .textContent = workout.name;

    updateExercise();

    showScreen("activeWorkoutScreen");
}


function updateExercise() {

    if (!currentWorkout) return;

    const workout =
        workouts[currentWorkout.type];

    const exercise =
        workout.exercises[currentWorkout.exerciseIndex];

    document.getElementById("exerciseNumber")
        .textContent =
        `EXERCÍCIO ${currentWorkout.exerciseIndex + 1}`;

    document.getElementById("exerciseName")
        .textContent =
        exercise[0];

    document.getElementById("exerciseInfo")
        .textContent =
        exercise[1];
}


/* =========================
   CONCLUIR SÉRIE
========================= */

document
    .getElementById("completeExercise")
    .addEventListener("click", () => {

        if (!currentWorkout) return;

        startTimer();

        vibrate();

        const workout =
            workouts[currentWorkout.type];

        currentWorkout.series++;

        if (currentWorkout.series > 3) {

            currentWorkout.series = 1;
            currentWorkout.exerciseIndex++;

            if (
                currentWorkout.exerciseIndex >=
                workout.exercises.length
            ) {
                finishWorkout();
                return;
            }

            updateExercise();
        }
    });


/* =========================
   CRONÔMETRO
========================= */

function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60)
            .toString()
            .padStart(2, "0");

    const seconds =
        (timerSeconds % 60)
            .toString()
            .padStart(2, "0");

    document.getElementById("timer")
        .textContent =
        `${minutes}:${seconds}`;
}

function startTimer() {

    clearInterval(timerInterval);

    timerSeconds = 60;

    updateTimerDisplay();

    timerInterval = setInterval(() => {

        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {

            clearInterval(timerInterval);

            timerSeconds = 0;

            updateTimerDisplay();

            vibrate();

            sendNotification(
                "Zyphor Fit",
                "Descanso terminado. Próxima série!"
            );
        }

    }, 1000);
}

document
    .getElementById("startTimer")
    .addEventListener("click", startTimer);

document
    .getElementById("skipTimer")
    .addEventListener("click", () => {

        clearInterval(timerInterval);

        timerSeconds = 0;

        updateTimerDisplay();
    });


/* =========================
   FINALIZAR TREINO
========================= */

function finishWorkout() {

    clearInterval(timerInterval);

    const now = new Date();

    const today =
        now.toISOString().split("T")[0];

    if (data.lastWorkout !== today) {

        data.workouts++;
        data.streak++;

        data.lastWorkout = today;

        const elapsed =
            Math.max(
                1,
                Math.round(
                    (Date.now() -
                        currentWorkout.startTime) /
                    60000
                )
            );

        data.totalMinutes += elapsed;
    }

    saveData();

    vibrate();

    sendNotification(
        "Treino concluído!",
        "Boa! Você terminou seu treino."
    );

    alert("Treino concluído!");

    currentWorkout = null;

    showScreen("homeScreen");
}


/* =========================
   VOLTAR
========================= */

document
    .getElementById("backFromWorkout")
    .addEventListener("click", () => {

        clearInterval(timerInterval);

        currentWorkout = null;

        showScreen("workoutsScreen");
    });


/* =========================
   VIBRAÇÃO
========================= */

function vibrate() {

    if (
        "vibrate" in navigator
    ) {
        navigator.vibrate(250);
    }
}

document
    .getElementById("vibrationButton")
    .addEventListener("click", () => {

        vibrate();

        alert("Vibração testada.");
    });


/* =========================
   NOTIFICAÇÕES
========================= */

document
    .getElementById("notificationButton")
    .addEventListener("click", async () => {

        if (!("Notification" in window)) {

            alert(
                "Seu navegador não suporta notificações."
            );

            return;
        }

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {

            sendNotification(
                "Zyphor Fit",
                "Notificações ativadas!"
            );

            document
                .getElementById("notificationButton")
                .textContent = "ATIVADAS";

        } else {

            alert(
                "Permissão de notificação não concedida."
            );
        }
    });


function sendNotification(title, body) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification(title, {
            body: body,
            icon: "icons/icon-192.png"
        });
    }
}


/* =========================
   MÚSICA
========================= */

const musicInput =
    document.getElementById("musicInput");

const audioPlayer =
    document.getElementById("audioPlayer");

const musicName =
    document.getElementById("musicName");

musicInput.addEventListener("change", () => {

    const file =
        musicInput.files[0];

    if (!file) return;

    const url =
        URL.createObjectURL(file);

    audioPlayer.src = url;

    musicName.textContent =
        file.name;

    audioPlayer.play().catch(() => {});
});


/* =========================
   APAGAR DADOS
========================= */

document
    .getElementById("clearData")
    .addEventListener("click", () => {

        const confirmed =
            confirm(
                "Apagar todo o progresso deste aparelho?"
            );

        if (!confirmed) return;

        localStorage.removeItem(storageKey);

        data = {
            workouts: 0,
            totalMinutes: 0,
            streak: 0,
            lastWorkout: null
        };

        updateStats();

        alert("Progresso apagado.");
    });


/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("sw.js")
            .catch(error => {
                console.log(
                    "Service Worker:",
                    error
                );
            });

    });

    }
