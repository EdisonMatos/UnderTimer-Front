import React, { useState, useEffect } from "react";
import Painel from "./Painel";
import PainelAdmin from "./PainelAdmin";
import loginImg from "../assets/imgs/loginImg.jpg";

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

      "Resposta recebida:", data;

      if (!response.ok) {
        throw new Error(data.error || "Erro no login");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("apelido", data.membro.apelido);
      localStorage.setItem("role", data.membro.role);
      localStorage.setItem("guildId", data.membro.guildId);
      localStorage.setItem("spriteUrl", data.membro.guild.spriteUrl);
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
      localStorage.setItem("userType", "admin");
      localStorage.setItem("userId", data.admin.id); // ✅ ESSA LINHA FAZ FALTA

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
    <div className="flex h-screen text-white bg-red-500">
      <div className="bg-background w-full md:w-[50%] flex justify-center items-center">
        <div className="w-full ">
          <div className="w-full max-w-[400px] mx-auto font-sans rounded-lg">
            {/* Login membros */}
            <h2 className="mb-5 text-3xl font-medium">
              Faça login no UnderTimer
            </h2>
            <p className="text-[14px] mb-8 opacity-50">
              Entre com seu usuário e senha.
            </p>
            <form
              onSubmit={handleLogin}
              className="flex w-[80%] flex-col gap-2.5"
            >
              <input
                type="text"
                placeholder="Usuário"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                required
                className="p-2.5 text-base bg-neutral-900 border border-neutral-800 rounded"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-2.5 text-base bg-neutral-900 border border-neutral-800 rounded"
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
              <a
                href="https://forms.gle/Sq86uTGY5GdNFnNQ6"
                target="_blank"
                className="ml-2 text-blue-300 hover:underline"
                rel="noreferrer"
              >
                Clique aqui
              </a>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            {/* Link para login admin */}
            <div className="w-full max-w-[400px] flex items-start mt-2">
              <p className="text-sm">Líder de guild?</p>
              <p
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="ml-2 text-sm text-blue-300 cursor-pointer hover:underline"
              >
                Clique aqui
              </p>
            </div>
            {/* Login admins */}
            {showAdminLogin && (
              <div className="w-full max-w-[400px]">
                <h2 className="mt-6 mb-2 text-lg font-semibold opacity-80">
                  Área de Líder de Guild
                </h2>
                <p className="text-[14px] mb-8 opacity-50">
                  Entre com seu email e senha.
                </p>
                <form
                  onSubmit={handleAdminLogin}
                  className="flex flex-col gap-2.5 w-[80%] "
                >
                  <input
                    type="email"
                    placeholder="Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="p-2.5 text-base bg-neutral-900 border border-neutral-800 rounded"
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="p-2.5 text-base bg-neutral-900 border border-neutral-800 rounded"
                  />
                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="p-2.5 text-base text-white rounded cursor-pointer bg-primary disabled:opacity-70"
                  >
                    {adminLoading ? "Entrando..." : "Entrar"}
                  </button>
                  {adminError && (
                    <p className="mt-2 text-red-600">{adminError}</p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="w-[50%] bg-green-800 bg-right bg-cover hidden md:block"
        style={{
          backgroundImage: `url(${loginImg})`,
        }}
      ></div>
    </div>
  );
}
