import { useState } from "react";
import "./AddAuthUserForm.css";

const AUTH_ENDPOINT =
  "https://testapi.io/api/justejuonytejj-blip/resource/auth";

function AddAuthUserForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    } catch (error) {
      setErrorMessage(`Vartotojo sukurti nepavyko: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
  );
}

export default AddAuthUserForm;
