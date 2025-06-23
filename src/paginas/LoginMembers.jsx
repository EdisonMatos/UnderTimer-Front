import React, { useState, useEffect } from "react";
import Painel from "./Painel";
import PainelAdmin from "./PainelAdmin";

const API_URL = "https://undertimer-biel.onrender.com";

export default function LoginMembers() {
  // Estados para membros
  const [apelido, setApelido] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados para admins
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminIsAuthenticated, setAdminIsAuthenticated] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (token && userType === "admin") {
      setAdminIsAuthenticated(true);
    } else if (token && userType === "member") {
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
      localStorage.setItem("userType", "member"); // <- NOVO
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login admin, usando a rota /login/admins
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");

    try {
      const response = await fetch(`${API_URL}/login/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no login do admin");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("adminEmail", data.admin.email);
      localStorage.setItem("userType", "admin"); // <- NOVO
      setAdminIsAuthenticated(true);
    } catch (err) {
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Renderiza painel do membro ou admin conforme autenticação
  if (isAuthenticated) return <Painel />;
  if (adminIsAuthenticated) return <PainelAdmin />;

  return (
    <div>
      <div className="max-w-xs p-5 mx-auto mt-24 font-sans text-center bg-gray-100 border border-gray-300 rounded-lg">
        {/* Login membros */}
        <h2 className="mb-5 text-lg font-semibold">Área de Membros</h2>
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
            rel="noreferrer"
          >
            Clique aqui
          </a>
        </p>
      </div>
      <div className="max-w-xs p-5 mx-auto mt-10 font-sans text-center bg-gray-100 border border-gray-300 rounded-lg">
        {/* Link para login admin */}
        <p
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="text-blue-600 cursor-pointer select-none hover:underline"
        >
          Login Líder de Guild
        </p>
        {/* Login admins */}
        {showAdminLogin && (
          <>
            <h2 className="mt-6 mb-5 text-lg font-semibold">
              Área de Líder de Guild
            </h2>
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-2.5">
              <input
                type="email"
                placeholder="Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="p-2.5 text-base border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Senha"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="p-2.5 text-base border border-gray-300 rounded"
              />
              <button
                type="submit"
                disabled={adminLoading}
                className="p-2.5 text-base text-white rounded cursor-pointer bg-primary disabled:opacity-70"
              >
                {adminLoading ? "Entrando..." : "Entrar"}
              </button>
              {adminError && <p className="mt-2 text-red-600">{adminError}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
