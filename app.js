
"use strict";

/* =========================================
   ZYPHOR FIT — APLICATIVO LOCAL
   Sem login, banco de dados ou backend.
   ========================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const STORAGE = {
  settings: "zyphorFit_settings_v1",
  history: "zyphorFit_history_v1",
  custom: "zyphorFit_custom_v1"
};

const EXERCISES = [
  {
    id: "squat",
    name: "Agachamento",
    category: "pernas",
    icon: "🦵",
    desc: "Desça de forma controlada e mantenha os pés apoiados.",
    reps: "8–12 repetições"
  },
  {
    id: "wall-pushup",
    name: "Flexão na parede",
    category: "peito",
    icon: "🧍",
    desc: "Apoie as mãos na parede e aproxime o peito com controle.",
    reps: "8–12 repetições"
  },
  {
    id: "pushup",
    name: "Flexão adaptada",
    category: "peito",
    icon: "💪",
    desc: "Use uma superfície firme e elevada se precisar de uma versão mais fácil.",
    reps: "6–10 repetições"
  },
  {
    id: "plank",
    name: "Prancha",
    category: "abdomen",
    icon: "🧘",
    desc: "Mantenha o corpo alinhado e respire normalmente.",
    reps: "15–30 segundos"
  },
  {
    id: "bridge",
    name: "Elevação de quadril",
    category: "pernas",
    icon: "🏃",
    desc: "Deitado de costas, eleve o quadril sem forçar a lombar.",
    reps: "10–15 repetições"
  },
  {
    id: "calf",
    name: "Elevação de panturrilha",
    category: "pernas",
    icon: "🦶",
    desc: "Eleve os calcanhares devagar e retorne com controle.",
    reps: "10–15 repetições"
  },
  {
    id: "bird-dog",
    name: "Bird dog",
    category: "costas",
    icon: "🐕",
    desc: "Em quatro apoios, estenda braço e perna opostos sem girar o tronco.",
    reps: "6–10 por lado"
  },
  {
    id: "superman",
    name: "Extensão de costas",
    category: "costas",
    icon: "🦸",
    desc: "De bruços, faça uma elevação suave sem exagerar o movimento.",
    reps: "8–12 repetições"
  },
  {
    id: "curl",
    name: "Rosca de bíceps",
    category: "bracos",
    icon: "💪",
    desc: "Se usar peso adequado, mantenha os cotovelos próximos ao corpo.",
    reps: "8–12 repetições"
  },
  {
    id: "arm-circles",
    name: "Círculos com os braços",
    category: "mobilidade",
    icon: "🔄",
    desc: "Faça círculos pequenos e controlados com os ombros relaxados.",
    reps: "20–30 segundos"
  },
  {
    id: "march",
    name: "Marcha no lugar",
    category: "corpo",
    icon: "🚶",
    desc: "Marche em um ritmo confortável, mantendo a postura natural.",
    reps: "30–60 segundos"
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    category: "abdomen",
    icon: "🪲",
    desc: "Deitado de costas, mova braço e perna opostos sem arquear a lombar.",
    reps: "6–10 por lado"
  },
  {
    id: "stretch",
    name: "Alongamento suave",
    category: "mobilidade",
    icon: "🧘",
    desc: "Faça movimentos confortáveis, sem balanços bruscos nem dor.",
    reps: "20–30 segundos"
  }
];

const CATEGORY_NAMES = {
  corpo: "Corpo inteiro",
  peito: "Peito",
  costas: "Costas",
  bracos: "Braços",
  pernas: "Pernas",
  abdomen: "Abdômen",
  mobilidade: "Mobilidade"
};

const DEFAULT_WORKOUTS = [
  {
    id: "full",
    name: "Corpo inteiro",
    category: "corpo",
    desc: "Uma sessão geral para movimentar o corpo.",
    icon: "⚡",
    exercises: ["march", "squat", "wall-pushup", "bird-dog", "bridge", "stretch"]
  },
  {
    id: "chest",
    name: "Peito e braços",
    category: "peito",
    desc: "Movimentos de empurrar e trabalhar os braços.",
    icon: "💪",
    exercises: ["wall-pushup", "pushup", "curl", "arm-circles"]
  },
  {
    id: "legs",
    name: "Pernas",
    category: "pernas",
    desc: "Movimentos básicos para pernas e quadril.",
    icon: "🦵",
    exercises: ["squat", "bridge", "calf", "stretch"]
  },
  {
    id: "core",
    name: "Abdômen e estabilidade",
    category: "abdomen",
    desc: "Prática controlada de estabilidade do tronco.",
    icon: "🎯",
    exercises: ["dead-bug", "plank", "bird-dog"]
  },
  {
    id: "mobility",
    name: "Mobilidade leve",
    category: "mobilidade",
    desc: "Movimentos suaves para começar ou terminar o dia.",
    icon: "🌿",
    exercises: ["arm-circles", "march", "stretch"]
  },
  {
    id: "back",
    name: "Costas e postura",
    category: "costas",
    desc: "Exercícios de controle e estabilidade.",
    icon: "🧭",
    exercises: ["bird-dog", "superman", "dead-bug", "stretch"]
  }
];

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn("Não foi possível carregar:", key, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Não foi possível salvar:", error);
    toast("Não foi possível salvar. Verifique o espaço disponível.");
    return false;
  }
}

let settings = {
  sound: true,
  vibration: false,
  defaultExercise: 30,
  defaultRest: 60,
  keepAwake: false,
  ...loadJSON(STORAGE.settings, {})
};

let history = loadJSON(STORAGE.history, []);
let customWorkouts = loadJSON(STORAGE.custom, []);

if (!Array.isArray(history)) history = [];
if (!Array.isArray(customWorkouts)) customWorkouts = [];

let currentScreen = "home";
let selectedCategory = "todos";
let session = null;
let timerInterval = null;
let timerMode = "exercise";
let timerRemaining = Number(settings.defaultExercise) || 30;
let totalSessionSeconds = 0;
let totalTimerStartedAt = 0;
let wakeLock = null;
let calendarDate = new Date();
let selectedHistoryDate = dateKey(new Date());

/* ---------- UTILIDADES ---------- */

function toast(message) {
  const element = $("#toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function getExercise(id) {
  return EXERCISES.find(item => item.id === id);
}

function getAllWorkouts() {
  return [
    ...DEFAULT_WORKOUTS,
    ...customWorkouts.map(workout => ({
      ...workout,
      custom: true
    }))
  ];
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function playBeep() {
  if (!settings.sound) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = 660;
    gain.gain.value = 0.08;

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.18
    );

    oscillator.stop(context.currentTime + 0.18);
    oscillator.onended = () => context.close();
  } catch (error) {
    console.warn("Som indisponível:", error);
  }
}

function vibrate() {
  if (settings.vibration && "vibrate" in navigator) {
    navigator.vibrate(100);
  }
}

/* ---------- NAVEGAÇÃO ---------- */

function showScreen(screenName) {
  const target = $(`#${screenName}`);
  if (!target) return;

  currentScreen = screenName;

  $$(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === screenName);
  });

  $$(".bottom-nav [data-screen]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.screen === screenName
    );
  });

  if (screenName === "history") renderHistory();
  if (screenName === "builder") renderCustomWorkouts();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$("[data-screen]").forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    showScreen(button.dataset.screen);
  });
});

/* ---------- BIBLIOTECA DE TREINOS ---------- */

function renderHomeCategories() {
  const container = $("#homeCategories");
  if (!container) return;

  const categories = [
    ["corpo", "Corpo inteiro"],
    ["pernas", "Pernas"],
    ["peito", "Peito"],
    ["mobilidade", "Mobilidade"]
  ];

  container.innerHTML = categories.map(([id, name]) => `
    <button class="category-chip" data-category="${id}">
      ${escapeHTML(name)}
    </button>
  `).join("");

  $$(".category-chip", container).forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderWorkoutFilters();
      renderWorkoutList();
      showScreen("workouts");
    });
  });
}

function renderWorkoutFilters() {
  const container = $("#filters");
  if (!container) return;

  const categories = [
    ["todos", "Todos"],
    ...Object.entries(CATEGORY_NAMES)
  ];

  container.innerHTML = categories.map(([id, label]) => `
    <button
      class="filter-chip ${selectedCategory === id ? "active" : ""}"
      data-filter="${id}"
    >${escapeHTML(label)}</button>
  `).join("");

  $$("[data-filter]", container).forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.filter;
      renderWorkoutFilters();
      renderWorkoutList();
    });
  });
}

function renderWorkoutList() {
  const container = $("#workoutList");
  if (!container) return;

  const search = ($("#search")?.value || "").trim().toLowerCase();

  const filtered = getAllWorkouts().filter(workout => {
    const categoryMatch =
      selectedCategory === "todos" ||
      workout.category === selectedCategory;

    const exerciseNames = workout.exercises
      .map(id => getExercise(id)?.name || "")
      .join(" ");

    const textMatch = [
      workout.name,
      workout.desc,
      CATEGORY_NAMES[workout.category] || "",
      exerciseNames
    ].join(" ").toLowerCase().includes(search);

    return categoryMatch && textMatch;
  });

  if (!filtered.length) {
    container.innerHTML = `
      <article class="panel">
        <b>Nenhum treino encontrado</b>
        <p class="muted">Tente outra pesquisa ou categoria.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = filtered.map(workout => `
    <article class="workout-card">
      <div class="art" aria-hidden="true">${escapeHTML(workout.icon || "⚡")}</div>
      <h3>${escapeHTML(workout.name)}</h3>
      <p>${escapeHTML(workout.desc)}</p>
      <button class="primary" data-start-workout="${escapeHTML(workout.id)}">
        Começar →
      </button>
    </article>
  `).join("");

  $$("[data-start-workout]", container).forEach(button => {
    button.addEventListener("click", () => {
      const workout = getAllWorkouts().find(
        item => item.id === button.dataset.startWorkout
      );
      if (workout) startWorkout(workout);
    });
  });
}

$("#search")?.addEventListener("input", renderWorkoutList);

$("#startSuggested")?.addEventListener("click", () => {
  const workout = DEFAULT_WORKOUTS.find(item => item.id === "full");
  startWorkout(workout);
});

/* ---------- CRIADOR DE TREINOS ---------- */

function renderExerciseChoices() {
  const container = $("#exerciseChoices");
  if (!container) return;

  container.innerHTML = EXERCISES.map(exercise => `
    <label class="choice">
      <input type="checkbox" name="exerciseChoice" value="${exercise.id}">
      <span>${escapeHTML(exercise.icon)} ${escapeHTML(exercise.name)}</span>
    </label>
  `).join("");
}

function renderCustomWorkouts() {
  const container = $("#customList");
  if (!container) return;

  if (!customWorkouts.length) {
    container.innerHTML = `
      <p class="muted">Você ainda não criou treinos personalizados.</p>
    `;
    return;
  }

  container.innerHTML = customWorkouts.map(workout => `
    <article class="custom-workout">
      <div>
        <b>${escapeHTML(workout.name)}</b>
        <p>${escapeHTML(CATEGORY_NAMES[workout.category] || "Treino")} · ${workout.exercises.length} exercícios</p>
      </div>
      <div>
        <button class="primary" data-custom-start="${escapeHTML(workout.id)}">Abrir</button>
        <button class="danger" data-custom-delete="${escapeHTML(workout.id)}">Excluir</button>
      </div>
    </article>
  `).join("");

  $$("[data-custom-start]", container).forEach(button => {
    button.addEventListener("click", () => {
      const workout = customWorkouts.find(
        item => item.id === button.dataset.customStart
      );
      if (workout) startWorkout(workout);
    });
  });

  $$("[data-custom-delete]", container).forEach(button => {
    button.addEventListener("click", () => {
      const workout = customWorkouts.find(
        item => item.id === button.dataset.customDelete
      );

      if (!workout) return;
      if (!confirm(`Excluir o treino "${workout.name}"?`)) return;

      customWorkouts = customWorkouts.filter(
        item => item.id !== workout.id
      );

      saveJSON(STORAGE.custom, customWorkouts);
      renderCustomWorkouts();
      renderWorkoutList();
      toast("Treino excluído.");
    });
  });
}

$("#builderForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#customName").value.trim();
  const category = $("#customCategory").value;
  const sets = Math.max(1, Math.min(10, Number($("#customSets").value) || 3));
  const rest = Math.max(0, Math.min(600, Number($("#customRest").value) || 0));
  const exercises = $$('input[name="exerciseChoice"]:checked')
    .map(input => input.value);

  if (!name) {
    toast("Digite um nome para o treino.");
    return;
  }

  if (!exercises.length) {
    toast("Selecione pelo menos um exercício.");
    return;
  }

  const workout = {
    id: `custom-${Date.now()}`,
    name,
    category,
    desc: "Treino personalizado por você.",
    icon: "✦",
    exercises,
    sets,
    rest
  };

  customWorkouts.push(workout);
  saveJSON(STORAGE.custom, customWorkouts);

  $("#builderForm").reset();
  $("#customSets").value = "3";
  $("#customRest").value = "60";

  renderExerciseChoices();
  renderCustomWorkouts();
  renderWorkoutList();
  toast("Treino salvo neste aparelho.");
});

/* ---------- SESSÃO DE TREINO ---------- */

function startWorkout(workout) {
  const exerciseIds = (workout.exercises || [])
    .filter(id => getExercise(id));

  if (!exerciseIds.length) {
    toast("Este treino não tem exercícios válidos.");
    return;
  }

  stopTimer();
  releaseWakeLock();

  session = {
    id: workout.id,
    name: workout.name,
    category: workout.category,
    exercises: exerciseIds,
    index: 0,
    completed: [],
    startedAt: Date.now(),
    activeSeconds: 0,
    restSeconds: 0,
    sets: Math.max(1, Number(workout.sets) || 3),
    rest: Math.max(0, Number(workout.rest ?? settings.defaultRest) || 0)
  };

  totalSessionSeconds = 0;
  totalTimerStartedAt = Date.now();
  timerMode = "exercise";
  timerRemaining = Math.max(1, Number(settings.defaultExercise) || 30);

  renderSession();
  showScreen("session");

  if (settings.keepAwake) requestWakeLock();
}

function currentExercise() {
  if (!session) return null;
  return getExercise(session.exercises[session.index]);
}

function renderSession() {
  if (!session) return;

  const exercise = currentExercise();
  if (!exercise) return;

  $("#sessionName").textContent = session.name;
  $("#sessionCategory").textContent =
    CATEGORY_NAMES[session.category] || "SESSÃO";

  $("#sessionPosition").textContent =
    `Exercício ${session.index + 1} de ${session.exercises.length}`;

  $("#sessionBar").style.width =
    `${(session.index / session.exercises.length) * 100}%`;

  $("#exerciseArt").textContent = exercise.icon;
  $("#exerciseName").textContent = exercise.name;
  $("#exerciseDesc").textContent = exercise.desc;
  $("#exerciseIndex").textContent =
    `EXERCÍCIO ${session.index + 1}`;

  $("#exerciseSets").textContent = `${session.sets} séries`;
  $("#exerciseReps").textContent = exercise.reps;

  $("#prevExercise").disabled = session.index === 0;
  $("#nextExercise").textContent =
    session.index === session.exercises.length - 1
      ? "Finalizar →"
      : "Próximo →";

  renderTimer();
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const toggle = $("#timerToggle");
  if (toggle) toggle.textContent = "▶ Iniciar";
}

function setTimerMode(mode) {
  stopTimer();
  timerMode = mode;

  $$(".timer-tabs button").forEach(button => {
    button.classList.toggle("selected", button.dataset.mode === mode);
  });

  if (mode === "exercise") {
    timerRemaining = Math.max(1, Number(settings.defaultExercise) || 30);
  } else if (mode === "rest") {
    timerRemaining = Math.max(0, Number(session?.rest ?? settings.defaultRest) || 0);
  }

  renderTimer();
}

function renderTimer() {
  const display = $("#timerDisplay");
  const caption = $("#timerCaption");

  if (!display || !caption) return;

  if (timerMode === "total") {
    const elapsed = session
      ? Math.floor((Date.now() - totalTimerStartedAt) / 1000)
      : 0;

    display.textContent = formatClock(elapsed);
    caption.textContent = "Tempo desde o início da sessão";
  } else {
    display.textContent = formatClock(timerRemaining);
    caption.textContent =
      timerMode === "rest" ? "Tempo de descanso" : "Tempo de exercício";
  }
}

function startTimer() {
  if (!session) {
    toast("Escolha um treino primeiro.");
    return;
  }

  if (timerInterval !== null) {
    stopTimer();
    return;
  }

  if (timerMode !== "total" && timerRemaining <= 0) {
    timerRemaining = timerMode === "rest"
      ? Math.max(0, Number(session.rest))
      : Math.max(1, Number(settings.defaultExercise));

    if (timerRemaining <= 0 && timerMode === "rest") {
      advanceExercise();
      return;
    }
  }

  $("#timerToggle").textContent = "Ⅱ Pausar";

  let lastTick = Date.now();

  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.max(0, (now - lastTick) / 1000);
    lastTick = now;

    if (!session) {
      stopTimer();
      return;
    }

    if (timerMode === "total") {
      renderTimer();
      return;
    }

    if (timerMode === "exercise") {
      session.activeSeconds += elapsed;
    } else {
      session.restSeconds += elapsed;
    }

    timerRemaining = Math.max(0, timerRemaining - elapsed);
    renderTimer();

    if (timerRemaining <= 0) {
      stopTimer();
      playBeep();
      vibrate();

      if (timerMode === "exercise") {
        toast("Tempo concluído! Faça uma pausa se precisar.");
      } else {
        toast("Descanso concluído.");
      }
    }
  }, 200);
}

$("#timerToggle")?.addEventListener("click", startTimer);

$("#timerReset")?.addEventListener("click", () => {
  stopTimer();

  if (timerMode === "exercise") {
    timerRemaining = Math.max(1, Number(settings.defaultExercise) || 30);
  } else if (timerMode === "rest") {
    timerRemaining = Math.max(0, Number(session?.rest ?? settings.defaultRest) || 0);
  }

  renderTimer();
});

$("#timerSkip")?.addEventListener("click", () => {
  if (!session) return;

  if (timerMode === "rest") {
    stopTimer();
    advanceExercise();
  } else if (timerMode === "exercise") {
    stopTimer();
    markCurrentComplete();
    advanceExercise();
  } else {
    toast("Selecione exercício ou descanso para pular.");
  }
});

$$(".timer-tabs button").forEach(button => {
  button.addEventListener("click", () => setTimerMode(button.dataset.mode));
});

$$("[data-seconds]").forEach(button => {
  button.addEventListener("click", () => {
    stopTimer();
    timerMode = "exercise";
    timerRemaining = Number(button.dataset.seconds) || 30;

    $$(".timer-tabs button").forEach(tab => {
      tab.classList.toggle("selected", tab.dataset.mode === "exercise");
    });

    renderTimer();
  });
});

function markCurrentComplete() {
  if (!session) return;

  const exerciseId = session.exercises[session.index];

  if (!session.completed.includes(exerciseId)) {
    session.completed.push(exerciseId);
  }
}

function advanceExercise() {
  if (!session) return;

  markCurrentComplete();

  if (session.index < session.exercises.length - 1) {
    session.index++;
    setTimerMode("exercise");
    renderSession();
    return;
  }

  finishWorkout();
}

$("#completeExercise")?.addEventListener("click", () => {
  if (!session) return;

  markCurrentComplete();

  if (session.index < session.exercises.length - 1) {
    session.index++;
    setTimerMode("exercise");
    renderSession();
  } else {
    finishWorkout();
  }
});

$("#nextExercise")?.addEventListener("click", advanceExercise);

$("#prevExercise")?.addEventListener("click", () => {
  if (!session || session.index <= 0) return;

  stopTimer();
  session.index--;
  setTimerMode("exercise");
  renderSession();
});

$("#leaveSession")?.addEventListener("click", () => {
  if (!session) {
    showScreen("workouts");
    return;
  }

  if (!confirm("Sair do treino? A sessão não será registrada como concluída.")) {
    return;
  }

  stopTimer();
  session = null;
  releaseWakeLock();
  showScreen("workouts");
});

function finishWorkout() {
  if (!session) return;

  stopTimer();

  const completedSession = {
    id: `session-${Date.now()}`,
    workoutId: session.id,
    name: session.name,
    category: session.category,
    date: dateKey(new Date()),
    completedAt: new Date().toISOString(),
    activeSeconds: Math.round(session.activeSeconds),
    restSeconds: Math.round(session.restSeconds),
    exerciseCount: session.exercises.length
  };

  history.unshift(completedSession);
  saveJSON(STORAGE.history, history);

  session = null;
  releaseWakeLock();

  updateStats();
  renderHistory();

  toast("Treino concluído e salvo no histórico!");
  showScreen("history");
}

/* ---------- HISTÓRICO E CALENDÁRIO ---------- */

function updateStats() {
  const totalSessions = history.length;
  const totalActiveSeconds = history.reduce(
    (sum, item) => sum + (Number(item.activeSeconds) || 0),
    0
  );

  const activeDays = new Set(history.map(item => item.date)).size;
  const minutes = Math.floor(totalActiveSeconds / 60);

  $("#statSessions").textContent = totalSessions;
  $("#statMinutes").textContent = `${minutes} min`;
  $("#statDays").textContent = activeDays;

  $("#historyCount").textContent = totalSessions;
  $("#historyMinutes").textContent = `${minutes} min`;
}

function renderCalendar() {
  const container = $("#calendarDays");
  if (!container) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let offset = firstDay.getDay() - 1;
  if (offset < 0) offset = 6;

  const monthLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  $("#monthLabel").textContent = monthLabel;

  const sessionDates = new Set(history.map(item => item.date));
  const todayKey = dateKey(new Date());
  let html = "";

  for (let i = 0; i < offset; i++) {
    html += '<span class="calendar-day empty"></span>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day));
    const classes = ["calendar-day"];

    if (key === todayKey) classes.push("today");
    if (key === selectedHistoryDate) classes.push("selected");
    if (sessionDates.has(key)) classes.push("has-session");

    html += `
      <button class="${classes.join(" ")}" data-date="${key}">
        ${day}
      </button>
    `;
  }

  container.innerHTML = html;

  $$("[data-date]", container).forEach(button => {
    button.addEventListener("click", () => {
      selectedHistoryDate = button.dataset.date;
      renderCalendar();
      renderHistoryList();
    });
  });
}

function renderHistoryList() {
  const container = $("#historyList");
  if (!container) return;

  const dateSessions = history.filter(
    item => item.date === selectedHistoryDate
  );

  $("#historyDateTitle").textContent =
    selectedHistoryDate === dateKey(new Date())
      ? "Sessões de hoje"
      : `Sessões de ${formatDate(selectedHistoryDate)}`;

  if (!dateSessions.length) {
    container.innerHTML = `
      <article class="panel">
        <b>Nenhuma sessão nesta data</b>
        <p class="muted">Quando você concluir um treino, ele aparecerá aqui.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = dateSessions.map(item => `
    <article class="history-item">
      <div>
        <b>${escapeHTML(item.name)}</b>
        <p>${escapeHTML(CATEGORY_NAMES[item.category] || "Treino")} · ${item.exerciseCount || 0} exercícios</p>
      </div>
      <div>
        <b>${Math.floor((Number(item.activeSeconds) || 0) / 60)} min</b>
        <p>tempo ativo</p>
      </div>
    </article>
  `).join("");
}

function renderHistory() {
  renderCalendar();
  renderHistoryList();
  updateStats();
}

$("#prevMonth")?.addEventListener("click", () => {
  calendarDate = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() - 1,
    1
  );
  renderCalendar();
});

$("#nextMonth")?.addEventListener("click", () => {
  calendarDate = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    1
  );
  renderCalendar();
});

/* ---------- MÚSICA LOCAL ---------- */

const audio = $("#audio");
let tracks = [];
let currentTrackIndex = -1;
let shuffleEnabled = false;
let repeatMode = "all";
let objectUrls = [];

function releaseTrackUrls() {
  objectUrls.forEach(url => URL.revokeObjectURL(url));
  objectUrls = [];
}

function trackTitle(file) {
  return file.name.replace(/\.[^.]+$/, "");
}

function renderPlaylist() {
  const container = $("#playlist");
  if (!container) return;

  if (!tracks.length) {
    container.innerHTML = `
      <article class="panel">
        <b>Sua playlist está vazia</b>
        <p class="muted">Adicione arquivos de áudio do seu aparelho.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = tracks.map((track, index) => `
    <article class="track ${index === currentTrackIndex ? "active" : ""}">
      <button data-play-track="${index}" aria-label="Tocar música">
        ${index === currentTrackIndex && audio && !audio.paused ? "Ⅱ" : "▶"}
      </button>
      <div class="track-info">
        <b>${escapeHTML(track.title)}</b>
        <small>${escapeHTML(track.file.type || "Arquivo de áudio")}</small>
      </div>
      <button data-remove-track="${index}" aria-label="Remover música">✕</button>
    </article>
  `).join("");

  $$("[data-play-track]", container).forEach(button => {
    button.addEventListener("click", () => playTrack(Number(button.dataset.playTrack)));
  });

  $$("[data-remove-track]", container).forEach(button => {
    button.addEventListener("click", () => removeTrack(Number(button.dataset.removeTrack)));
  });
}

function loadTrack(index, autoplay = false) {
  if (!tracks.length || index < 0 || index >= tracks.length) return;

  currentTrackIndex = index;
  const track = tracks[index];

  audio.src = track.url;
  $("#nowPlaying").textContent = track.title;
  $("#artist").textContent = "Arquivo local do seu aparelho";
  $("#cover").innerHTML = `<span>♫</span><small>ZYPHOR FIT</small>`;
  $("#seek").value = "0";
  $("#currentTime").textContent = "0:00";
  $("#duration").textContent = "0:00";

  renderPlaylist();

  if (autoplay) {
    audio.play().then(() => {
      $("#playPause").textContent = "Ⅱ";
      renderPlaylist();
    }).catch(() => {
      $("#playPause").textContent = "▶";
      toast("Toque em reproduzir para iniciar a música.");
    });
  } else {
    $("#playPause").textContent = "▶";
  }
}

function playTrack(index) {
  if (!tracks.length) {
    toast("Adicione uma música primeiro.");
    return;
  }

  if (index === currentTrackIndex) {
    if (audio.paused) {
      audio.play().catch(() => toast("Não foi possível reproduzir este arquivo."));
    } else {
      audio.pause();
    }
    return;
  }

  loadTrack(index, true);
}

function nextTrack() {
  if (!tracks.length) return;

  let nextIndex;

  if (shuffleEnabled && tracks.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } while (nextIndex === currentTrackIndex);
  } else {
    nextIndex = currentTrackIndex + 1;

    if (nextIndex >= tracks.length) {
      if (repeatMode === "one") {
        nextIndex = currentTrackIndex;
      } else if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        audio.pause();
        return;
      }
    }
  }

  loadTrack(nextIndex, true);
}

function previousTrack() {
  if (!tracks.length) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  let index = currentTrackIndex - 1;

  if (index < 0) {
    index = repeatMode === "all" ? tracks.length - 1 : 0;
  }

  loadTrack(index, true);
}

function removeTrack(index) {
  if (index < 0 || index >= tracks.length) return;

  const wasCurrent = index === currentTrackIndex;
  const removed = tracks[index];

  tracks.splice(index, 1);

  if (removed?.url) {
    URL.revokeObjectURL(removed.url);
    objectUrls = objectUrls.filter(url => url !== removed.url);
  }

  if (!tracks.length) {
    audio.pause();
    audio.removeAttribute("src");
    currentTrackIndex = -1;
    $("#nowPlaying").textContent = "Nenhuma música";
    $("#artist").textContent = "Adicione arquivos para criar sua playlist.";
    $("#playPause").textContent = "▶";
  } else if (wasCurrent) {
    currentTrackIndex = -1;
    loadTrack(Math.min(index, tracks.length - 1), false);
  } else if (index < currentTrackIndex) {
    currentTrackIndex--;
  }

  renderPlaylist();
}

$("#musicFiles")?.addEventListener("change", event => {
  const files = [...event.target.files].filter(file =>
    file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name)
  );

  if (!files.length) {
    toast("Selecione arquivos de áudio compatíveis.");
    event.target.value = "";
    return;
  }

  files.forEach(file => {
    const url = URL.createObjectURL(file);
    objectUrls.push(url);

    tracks.push({
      file,
      url,
      title: trackTitle(file)
    });
  });

  if (currentTrackIndex === -1 && tracks.length) {
    loadTrack(0, false);
  }

  renderPlaylist();
  toast(`${files.length} música(s) adicionada(s).`);

  event.target.value = "";
});

$("#playPause")?.addEventListener("click", () => {
  if (!tracks.length) {
    toast("Adicione músicas primeiro.");
    return;
  }

  if (audio.paused) {
    if (currentTrackIndex < 0) {
      loadTrack(0, true);
    } else {
      audio.play().catch(() => toast("Não foi possível reproduzir este arquivo."));
    }
  } else {
    audio.pause();
  }
});

$("#nextTrack")?.addEventListener("click", nextTrack);
$("#prevTrack")?.addEventListener("click", previousTrack);

audio?.addEventListener("play", () => {
  $("#playPause").textContent = "Ⅱ";
  renderPlaylist();
});

audio?.addEventListener("pause", () => {
  $("#playPause").textContent = "▶";
  renderPlaylist();
});

audio?.addEventListener("ended", () => {
  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack();
  }
});

audio?.addEventListener("loadedmetadata", () => {
  $("#duration").textContent = formatTime(audio.duration || 0);
});

audio?.addEventListener("timeupdate", () => {
  $("#currentTime").textContent = formatTime(audio.currentTime || 0);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    $("#seek").value = String((audio.currentTime / audio.duration) * 100);
  }
});

audio?.addEventListener("error", () => {
  if (audio.src) toast("Não foi possível ler este arquivo de áudio.");
});

$("#seek")?.addEventListener("input", event => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(event.target.value) / 100) * audio.duration;
  }
});

$("#volume")?.addEventListener("input", event => {
  audio.volume = Number(event.target.value);
});

$("#shuffle")?.addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;
  $("#shuffle").textContent = `⇄ Aleatório: ${shuffleEnabled ? "on" : "off"}`;
});

$("#repeat")?.addEventListener("click", () => {
  const modes = ["all", "one", "off"];
  const labels = {
    all: "playlist",
    one: "uma música",
    off: "off"
  };

  const index = modes.indexOf(repeatMode);
  repeatMode = modes[(index + 1) % modes.length];
  $("#repeat").textContent = `↻ Repetir: ${labels[repeatMode]}`;
});

/* ---------- CONFIGURAÇÕES ---------- */

function syncSettingsUI() {
  $("#soundSetting").checked = Boolean(settings.sound);
  $("#vibrationSetting").checked = Boolean(settings.vibration);
  $("#defaultExercise").value = String(settings.defaultExercise);
  $("#defaultRest").value = String(settings.defaultRest);
  $("#wakeSetting").checked = Boolean(settings.keepAwake);
}

$("#soundSetting")?.addEventListener("change", event => {
  settings.sound = event.target.checked;
  saveJSON(STORAGE.settings, settings);
});

$("#vibrationSetting")?.addEventListener("change", event => {
  settings.vibration = event.target.checked;
  saveJSON(STORAGE.settings, settings);
});

$("#defaultExercise")?.addEventListener("change", event => {
  settings.defaultExercise = Number(event.target.value) || 30;
  saveJSON(STORAGE.settings, settings);

  if (session && timerMode === "exercise" && timerInterval === null) {
    timerRemaining = settings.defaultExercise;
    renderTimer();
  }
});

$("#defaultRest")?.addEventListener("change", event => {
  settings.defaultRest = Number(event.target.value) || 60;
  saveJSON(STORAGE.settings, settings);
});

$("#wakeSetting")?.addEventListener("change", event => {
  settings.keepAwake = event.target.checked;
  saveJSON(STORAGE.settings, settings);

  if (settings.keepAwake && session) {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
});

$("#notifications")?.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    toast("Este navegador não oferece notificações.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      new Notification("Zyphor Fit", {
        body: "Notificações permitidas neste navegador."
      });
      toast("Permissão concedida.");
    } else {
      toast("Permissão de notificação não concedida.");
    }
  } catch (error) {
    toast("Não foi possível ativar as notificações.");
  }
});

$("#exportData")?.addEventListener("click", () => {
  const data = {
    app: "Zyphor Fit",
    exportedAt: new Date().toISOString(),
    settings,
    history,
    customWorkouts
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `zyphor-fit-backup-${dateKey(new Date())}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Backup preparado.");
});

$("#clearData")?.addEventListener("click", () => {
  const confirmed = confirm(
    "Apagar o histórico, os treinos personalizados e as configurações salvas neste aparelho?"
  );

  if (!confirmed) return;

  stopTimer();
  releaseWakeLock();

  localStorage.removeItem(STORAGE.settings);
  localStorage.removeItem(STORAGE.history);
  localStorage.removeItem(STORAGE.custom);

  settings = {
    sound: true,
    vibration: false,
    defaultExercise: 30,
    defaultRest: 60,
    keepAwake: false
  };

  history = [];
  customWorkouts = [];

  syncSettingsUI();
  renderExerciseChoices();
  renderCustomWorkouts();
  renderWorkoutFilters();
  renderWorkoutList();
  updateStats();
  renderHistory();

  toast("Dados locais apagados.");
});

/* ---------- MANTER TELA LIGADA ---------- */

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) {
    toast("Este navegador não suporta manter a tela ligada.");
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");

    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch (error) {
    console.warn("Wake Lock indisponível:", error);
  }
}

async function releaseWakeLock() {
  if (!wakeLock) return;

  try {
    await wakeLock.release();
  } catch (error) {
    console.warn("Não foi possível liberar Wake Lock:", error);
  }

  wakeLock = null;
}

document.addEventListener("visibilitychange", () => {
  if (
    document.visibilityState === "visible" &&
    settings.keepAwake &&
    session
  ) {
    requestWakeLock();
  }
});

/* ---------- INICIALIZAÇÃO ---------- */

function init() {
  renderHomeCategories();
  renderWorkoutFilters();
  renderWorkoutList();
  renderExerciseChoices();
  renderCustomWorkouts();
  syncSettingsUI();
  updateStats();
  renderHistory();

  audio.volume = Number($("#volume")?.value ?? 0.8);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.warn("Service Worker não registrado:", error);
      });
    });
  }
}

init();
