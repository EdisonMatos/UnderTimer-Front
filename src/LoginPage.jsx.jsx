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
    <div className="max-w-xs p-5 mx-auto mt-24 font-sans text-center bg-gray-100 border border-gray-300 rounded-lg">
      <h2 className="mb-5 text-lg font-semibold">
        Área de Membros - UnderTimer
      </h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="Usuário"
          value={apelido}
          onChange={(e) => setApelido(e.target.value)}
          required
          className="p-2.5 text-base border border-gray-300 rounded"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2.5 text-base border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2.5 text-base text-white rounded cursor-pointer bg-primary disabled:opacity-70"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <p className="mt-2 text-red-600">{error}</p>}
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
