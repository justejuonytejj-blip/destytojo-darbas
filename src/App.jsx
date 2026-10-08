import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import ProgressBar from "./ProgressBar";
import Navbar from "./Navbar";
import AddTaskForm from "./AddTaskForm";
import Profile from "./Profile";
import "./App.css";

const TASKS_ENDPOINT =
  "https://testapi.io/api/justejuonytejj-blip/resource/tasklist";

function App() {
  const user = {
    name: "Jonas Jonaitis",
    email: "jonas@flowly.lt",
  };

  const [activePage, setActivePage] = useState("home");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskUpdateErrors, setTaskUpdateErrors] = useState({});

  async function loadTasks() {
    setIsLoadingTasks(true);
    setTasksError("");

    try {
      const response = await fetch(TASKS_ENDPOINT);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      const taskRecords = Array.isArray(result) ? result : result.data;
      if (!Array.isArray(taskRecords)) {
        throw new Error("Gautas netinkamas užduočių sąrašas.");
      }

      setTasks(
        taskRecords.map((task) => ({
          ...task,
          id: task.id ?? task._id ?? `${task.title}-${task.deadline}`,
          title: task.title ?? "",
          status: task.status ?? "Nepradėta",
          deadline: task.deadline ?? "",
        })),
      );
    } catch (error) {
      setTasksError(`Užduočių gauti nepavyko: ${error.message}`);
    } finally {
      setIsLoadingTasks(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    if (email === "admin" && password === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
      return;
    }

    setLoginError("Neteisingas vartotojo vardas arba slaptažodis.");
  }

  async function handleAddTask() {
    await loadTasks();
  }

  async function updateTask(taskId, updates) {
    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    const updatedTask = { ...currentTask, ...updates };
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
    setTaskUpdateErrors((currentErrors) => ({
      ...currentErrors,
      [taskId]: "",
    }));

    try {
      const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTask.title,
          status: updatedTask.status,
          deadline: updatedTask.deadline,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      setTaskUpdateErrors((currentErrors) => ({
        ...currentErrors,
        [taskId]: `Užduoties atnaujinti nepavyko: ${error.message}`,
      }));
      await loadTasks();
    }
  }

  function handleTaskStatusChange(taskId, status) {
    updateTask(taskId, { status });
  }

  function handleTaskDeadlineChange(taskId, deadline) {
    updateTask(taskId, { deadline });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedTaskCount = tasks.filter(
    (task) => task.status === "Atlikta",
  ).length;
  const overdueTaskCount = tasks.filter((task) => {
    if (task.status === "Atlikta" || !task.deadline) return false;

    const deadline = new Date(`${task.deadline}T00:00:00`);
    return deadline < today;
  }).length;

  return (
    <>
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "home" && (
        <>
          {isLoggedIn && (
            <header className="welcome-message">
              <h1>Sveiki sugrįžę!</h1>
              <p>Prisijungėte kaip admin.</p>
            </header>
          )}

          <main className="login-page">
            {!isLoggedIn && (
              <div className="login-card">
                <>
                  <header className="login-card__header">
                    <h1>Prisijungti</h1>
                    <p>Įveskite savo duomenis, kad tęstumėte</p>
                  </header>

                  <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-field">
                      <span>Vartotojo vardas</span>
                      <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        placeholder="admin"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </label>

                    <label className="login-field">
                      <span>Slaptažodis</span>
                      <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </label>

                    <button type="submit" className="login-submit">
                      Prisijungti
                    </button>

                    {loginError && (
                      <p className="login-error" role="alert">
                        {loginError}
                      </p>
                    )}
                  </form>
                </>
              </div>
            )}

            {isLoggedIn && (
              <>
                <section className="dashboard-summary" aria-label="Užduočių suvestinė">
                  <p>
                    <strong>{tasks.length} užduotys</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{completedTaskCount} atliktos</strong>
                    <span aria-hidden="true">·</span>
                    <strong>{overdueTaskCount} vėluoja</strong>
                  </p>
                </section>

                <TaskList
                  tasks={tasks}
                  loading={isLoadingTasks}
                  onStatusChange={handleTaskStatusChange}
                  onDeadlineChange={handleTaskDeadlineChange}
                  updateErrors={taskUpdateErrors}
                />

                {tasksError && (
                  <p className="login-error" role="alert">
                    {tasksError}
                  </p>
                )}

                <AddTaskForm onAddTask={handleAddTask} />

                <ProgressBar initialProgress={50} />
              </>
            )}
          </main>
        </>
      )}

      {activePage === "profile" && <Profile user={user} tasks={tasks} />}
    </>
  );
}

export default App;
