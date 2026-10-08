import { useState } from "react";
import "./AddTaskForm.css";

function AddTaskForm({ onAddTask }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Nepradėta");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://testapi.io/api/justejuonytejj-blip/resource/tasklist",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, status, deadline }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      onAddTask({ ...result, title, status, deadline });
      setMessage("Užduotis sėkmingai išsaugota.");
      setTitle("");
      setDeadline("");
      setStatus("Nepradėta");
      setIsOpen(false);
    } catch (error) {
      setMessage(`Užduoties išsaugoti nepavyko: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setTitle("");
    setDeadline("");
    setStatus("Nepradėta");
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <div className="add-task">
        <button
          type="button"
          className="add-task__open-button"
          onClick={() => setIsOpen(true)}
        >
          + Nauja užduotis
        </button>
      </div>
    );
  }

  return (
    <div className="add-task">
      <div className="add-task__card">
        <div className="add-task__header">
          <div>
            <h2>Nauja užduotis</h2>
            <p>Pridėkite naują užduotį į savo sąrašą</p>
          </div>

          <button
            type="button"
            className="add-task__close"
            onClick={handleCancel}
            aria-label="Uždaryti"
          >
            ×
          </button>
        </div>

        <form className="add-task__form" onSubmit={handleSubmit}>
          <label className="add-task__field">
            <span>Užduoties pavadinimas</span>

            <input
              type="text"
              placeholder="Pvz. Sukurti profilio puslapį"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="add-task__field">
            <span>Terminas</span>

            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              required
            />
          </label>

          <label className="add-task__field">
            <span>Statusas</span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Nepradėta">Nepradėta</option>
              <option value="Vykdoma">Vykdoma</option>
              <option value="Atlikta">Atlikta</option>
            </select>
          </label>

          <div className="add-task__actions">
            <button
              type="button"
              className="add-task__cancel"
              onClick={handleCancel}
            >
              Atšaukti
            </button>

            <button
              type="submit"
              className="add-task__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saugoma..." : "Pridėti užduotį"}
            </button>
          </div>
        </form>
      </div>
      {message && (
        <p className="add-task__message" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default AddTaskForm;
