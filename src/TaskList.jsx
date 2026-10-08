import { useState } from "react";
import "./TaskList.css";

const TASKS_ENDPOINT =
  "https://testapi.io/api/justejuonytejj-blip/resource/tasklist";

function TaskList({
  tasks = [],
  loading = false,
  onStatusChange,
  onDeadlineChange,
  updateErrors = {},
  onDelete,
  deleteErrors = {},
}) {
  const [viewedTask, setViewedTask] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [viewError, setViewError] = useState("");
  const [viewErrorId, setViewErrorId] = useState(null);

  async function viewTask(taskId) {
    setViewingId(taskId);
    setViewError("");
    setViewErrorId(null);
    setViewedTask(null);

    try {
      const response = await fetch(`${TASKS_ENDPOINT}/${taskId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      const record =
        result && result.data && !Array.isArray(result.data) ? result.data : result;
      if (!record || typeof record !== "object" || Array.isArray(record)) {
        throw new Error("Gautas netinkamas užduoties įrašas.");
      }

      setViewedTask({
        id: record.id ?? record._id,
        title: record.title ?? "",
        status: record.status ?? "",
        deadline: record.deadline ?? "",
      });
    } catch (error) {
      setViewError(`Užduoties gauti nepavyko: ${error.message}`);
      setViewErrorId(taskId);
    } finally {
      setViewingId(null);
    }
  }

  if (loading) {
    return (
      <section className="task-card">
        <p className="task-state">Kraunamos užduotys...</p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="task-card">
        <p className="task-state">Užduočių kol kas nėra.</p>
      </section>
    );
  }

  return (
    <section className="task-card">
      <header className="task-card__header">
        <h2>Užduotys</h2>
        <p>Artimiausi darbai ir jų būsena</p>
      </header>

      <div className="task-list">
        {tasks.map((task) => (
          <article className="task-item" key={task.id}>
            <div className="task-item__top">
              <h3>{task.title}</h3>

              <div className="task-item__controls">
              <label className="task-status-field">
                <span className="visually-hidden">Užduoties statusas</span>
                <select
                  className={`task-status task-status--${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  value={task.status}
                  onChange={(event) =>
                    onStatusChange?.(task.id, event.target.value)
                  }
                  aria-label={`Keisti užduoties „${task.title}“ statusą`}
                >
                  <option value="Nepradėta">Nepradėta</option>
                  <option value="Vykdoma">Vykdoma</option>
                  <option value="Atlikta">Atlikta</option>
                </select>
              </label>
                <button
                  type="button"
                  className="task-delete-button"
                  onClick={() => {
                    if (window.confirm("Ar tikrai norite ištrinti šią užduotį?")) {
                      onDelete?.(task.id);
                    }
                  }}
                  aria-label={`Ištrinti užduotį „${task.title}“`}
                  title="Ištrinti užduotį"
                >
                  🗑️
                </button>
              </div>
            </div>

            <label className="task-deadline">
              <span>Terminas:</span>
              <input
                type="date"
                value={task.deadline}
                onChange={(event) =>
                  onDeadlineChange?.(task.id, event.target.value)
                }
                aria-label={`Keisti užduoties „${task.title}“ terminą`}
              />
            </label>

            <button
              type="button"
              className="task-view-button"
              onClick={() => viewTask(task.id)}
              disabled={viewingId === task.id}
            >
              {viewingId === task.id ? "Kraunama..." : "Peržiūrėti"}
            </button>

            {viewedTask?.id === task.id && (
              <dl className="task-view">
                <div>
                  <dt>id</dt>
                  <dd>{viewedTask.id}</dd>
                </div>
                <div>
                  <dt>title</dt>
                  <dd>{viewedTask.title}</dd>
                </div>
                <div>
                  <dt>status</dt>
                  <dd>{viewedTask.status}</dd>
                </div>
                <div>
                  <dt>deadline</dt>
                  <dd>{viewedTask.deadline}</dd>
                </div>
              </dl>
            )}

            {viewErrorId === task.id && viewError && (
              <p className="login-error" role="alert">
                {viewError}
              </p>
            )}

            {updateErrors[task.id] && (
              <p className="login-error" role="alert">
                {updateErrors[task.id]}
              </p>
            )}
            {deleteErrors[task.id] && (
              <p className="login-error" role="alert">
                {deleteErrors[task.id]}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default TaskList;
