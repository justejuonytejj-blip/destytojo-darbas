import { useEffect, useState } from "react";
import "./AddAuthUserForm.css";

const AUTH_ENDPOINT =
  "https://testapi.io/api/justejuonytejj-blip/resource/auth";

function AddAuthUserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [listError, setListError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [updateError, setUpdateError] = useState("");

  async function loadAuthUsers() {
    setIsLoadingUsers(true);
    setListError("");

    try {
      const response = await fetch(AUTH_ENDPOINT);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      const records = Array.isArray(result) ? result : result.data;
      if (!Array.isArray(records)) {
        throw new Error("Gautas netinkamas vartotojų sąrašas.");
      }

      setUsers(
        records.map((record) => ({
          id: record.id ?? record._id,
          username: record.username ?? "",
        })),
      );
    } catch (error) {
      setListError(`Vartotojų gauti nepavyko: ${error.message}`);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadAuthUsers();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      setSuccessMessage("Vartotojas sukurtas");
      setUsername("");
      setPassword("");
      await loadAuthUsers();
    } catch (error) {
      setErrorMessage(`Vartotojo sukurti nepavyko: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(user) {
    if (isSavingUser) return;

    setEditingId(user.id);
    setDraftUsername(user.username);
    setUpdateError("");
  }

  function cancelEditing() {
    if (isSavingUser) return;

    setEditingId(null);
    setDraftUsername("");
    setUpdateError("");
  }

  async function saveUsername(userId) {
    const nextUsername = draftUsername.trim();
    if (!nextUsername) {
      setUpdateError("Įveskite username.");
      return;
    }

    setIsSavingUser(true);
    setUpdateError("");

    try {
      const currentResponse = await fetch(`${AUTH_ENDPOINT}/${userId}`);
      let currentRecord = {};
      try {
        currentRecord = await currentResponse.json();
      } catch {
        currentRecord = {};
      }

      if (!currentResponse.ok) {
        throw new Error(currentRecord.message || `HTTP ${currentResponse.status}`);
      }

      if (typeof currentRecord.password !== "string") {
        throw new Error("Nepavyko išsaugoti esamų duomenų.");
      }

      const response = await fetch(`${AUTH_ENDPOINT}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: nextUsername,
          password: currentRecord.password,
        }),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      setEditingId(null);
      setDraftUsername("");
      await loadAuthUsers();
    } catch (error) {
      setUpdateError(`Vartotojo atnaujinti nepavyko: ${error.message}`);
    } finally {
      setIsSavingUser(false);
    }
  }

  return (
    <div className="auth-user-panel">
      <div className="add-auth-user">
        <header className="add-auth-user__header">
          <h2>Bandomasis vartotojas</h2>
          <p>Išgalvoti duomenys. Nenaudokite tikro slaptažodžio.</p>
        </header>

        <form className="add-auth-user__form" onSubmit={handleSubmit}>
          <label className="add-auth-user__field">
            <span>username</span>
            <input
              type="text"
              name="test-username"
              autoComplete="off"
              placeholder="bandomasis"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className="add-auth-user__field">
            <span>password</span>
            <input
              type="text"
              name="test-password"
              autoComplete="off"
              placeholder="testas"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="add-auth-user__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saugoma..." : "Pridėti vartotoją"}
          </button>

          {successMessage && (
            <p className="add-auth-user__success" role="status">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="add-auth-user__error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </div>

      <section className="auth-user-list" aria-label="Bandomųjų vartotojų sąrašas">
        <header className="auth-user-list__header">
          <h2>Bandomųjų vartotojų sąrašas</h2>
          <p>Rodomi tik id ir username</p>
        </header>

        {isLoadingUsers && users.length === 0 && (
          <p className="auth-user-list__state">Kraunamas sąrašas...</p>
        )}

        {listError && (
          <p className="add-auth-user__error" role="alert">
            {listError}
          </p>
        )}

        {!isLoadingUsers && !listError && users.length === 0 && (
          <p className="auth-user-list__state">Bandomųjų vartotojų kol kas nėra.</p>
        )}

        {users.length > 0 && (
          <ul className="auth-user-list__items">
            {users.map((user) => {
              const isEditing = editingId === user.id;

              return (
                <li
                  className={`auth-user-list__item${
                    isEditing ? " auth-user-list__item--editing" : ""
                  }`}
                  key={user.id}
                >
                  <div className="auth-user-list__meta">
                    <span>
                      <span className="auth-user-list__label">id</span>
                      {user.id}
                    </span>
                    {isEditing ? (
                      <label className="auth-user-list__edit-field">
                        <span className="auth-user-list__label">username</span>
                        <input
                          type="text"
                          value={draftUsername}
                          onChange={(event) => setDraftUsername(event.target.value)}
                          autoComplete="off"
                          required
                        />
                      </label>
                    ) : (
                      <span>
                        <span className="auth-user-list__label">username</span>
                        {user.username}
                      </span>
                    )}
                  </div>

                  <div className="auth-user-list__actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="auth-user-list__save"
                          onClick={() => saveUsername(user.id)}
                          disabled={isSavingUser}
                        >
                          {isSavingUser ? "Saugoma..." : "Išsaugoti"}
                        </button>
                        <button
                          type="button"
                          className="auth-user-list__cancel"
                          onClick={cancelEditing}
                          disabled={isSavingUser}
                        >
                          Atšaukti
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="auth-user-list__edit"
                        onClick={() => startEditing(user)}
                        disabled={isSavingUser}
                      >
                        Redaguoti
                      </button>
                    )}
                  </div>

                  {isEditing && updateError && (
                    <p className="add-auth-user__error" role="alert">
                      {updateError}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AddAuthUserForm;
