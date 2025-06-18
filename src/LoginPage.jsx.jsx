// LoginPage.jsx
import React, { useState, useEffect } from "react";
import App from "./App";

const API_URL = "https://undertimer-biel.onrender.com";

export default function LoginPage() {
  const [apelido, setApelido] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no login");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("apelido", data.membro.apelido);
      localStorage.setItem("guildId", data.membro.guildId);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <App />;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Área de Membros - UnderTimer</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Usuário"
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button
          type="submit"
          disabled={loading}
          style={styles.button}
          className="bg-primary"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
      <p className="mt-10 text-sm">
        Não tem um login e senha ainda?
        <br />
        <a
          href="https://forms.gle/Sq86uTGY5GdNFnNQ6"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          Clique aqui
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 320,
    margin: "100px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 10,
    textAlign: "center",
    fontFamily: "sans-serif",
    backgroundColor: "#f9f9f9",
  },
  title: {
    marginBottom: 20,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    fontSize: 16,
  },
  button: {
    padding: 10,
    fontSize: 16,
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
};
