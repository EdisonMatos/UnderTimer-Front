import React, { useState, useEffect } from "react";

const API_URL = "https://undertimer-biel.onrender.com";

export default function PainelAdmin() {
  // Estados guilds
  const [guilds, setGuilds] = useState([]);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");

  // Form guild (criar/editar)
  const [editingGuild, setEditingGuild] = useState(null);
  const [guildSpriteUrl, setGuildSpriteUrl] = useState("");
  const [guildAdminId, setGuildAdminId] = useState("");

  // Para controlar membros de cada guild: objeto { [guildId]: membros[] }
  const [guildMembros, setGuildMembros] = useState({});
  const [guildMembrosLoading, setGuildMembrosLoading] = useState({});
  const [guildMembrosError, setGuildMembrosError] = useState({});

  // Estados para formulário membros: para cada guildId, armazenamos estado de edição e inputs
  // Vai ser um objeto: { [guildId]: { editingMembro, apelido, password, role } }
  const [guildMembrosForms, setGuildMembrosForms] = useState({});

  // --- BUSCAR guilds ---
  async function fetchGuilds() {
    setGuildLoading(true);
    setGuildError("");
    try {
      const res = await fetch(`${API_URL}/guilds`);
      if (!res.ok) throw new Error("Erro ao buscar guilds");
      const data = await res.json();
      setGuilds(data);

      // Após receber guilds, buscar membros de todas elas
      data.forEach((g) => fetchMembros(g.id));
    } catch (err) {
      setGuildError(err.message);
    } finally {
      setGuildLoading(false);
    }
  }

  // --- BUSCAR membros por guildId ---
  async function fetchMembros(guildId) {
    // Atualiza loading individual da guild
    setGuildMembrosLoading((prev) => ({ ...prev, [guildId]: true }));
    setGuildMembrosError((prev) => ({ ...prev, [guildId]: "" }));

    try {
      const res = await fetch(`${API_URL}/membros`);
      if (!res.ok) throw new Error("Erro ao buscar membros");
      let data = await res.json();
      data = data.filter((m) => m.guild?.id === guildId);
      setGuildMembros((prev) => ({ ...prev, [guildId]: data }));
    } catch (err) {
      setGuildMembrosError((prev) => ({ ...prev, [guildId]: err.message }));
    } finally {
      setGuildMembrosLoading((prev) => ({ ...prev, [guildId]: false }));
    }
  }

  // Ao montar
  useEffect(() => {
    fetchGuilds();
  }, []);

  // --- CRUD Guilds ---
  async function handleGuildSubmit(e) {
    e.preventDefault();
    if (!guildSpriteUrl || !guildAdminId) {
      alert("Preencha o spriteUrl e adminId da guild");
      return;
    }

    const method = editingGuild ? "PUT" : "POST";
    const url = editingGuild
      ? `${API_URL}/guilds/${editingGuild.id}`
      : `${API_URL}/guilds`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spriteUrl: guildSpriteUrl,
          adminId: guildAdminId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar guild");

      // Refresh
      fetchGuilds();
      // Reset form
      setEditingGuild(null);
      setGuildSpriteUrl("");
      setGuildAdminId("");
    } catch (err) {
      alert(err.message);
    }
  }

  function startEditGuild(guild) {
    setEditingGuild(guild);
    setGuildSpriteUrl(guild.spriteUrl || "");
    setGuildAdminId(guild.admin?.id || "");
  }

  async function deleteGuild(id) {
    if (!window.confirm("Confirma exclusão da guild?")) return;
    try {
      const res = await fetch(`${API_URL}/guilds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar guild");
      fetchGuilds();
      // Remove membros e formulário da guild deletada
      setGuildMembros((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setGuildMembrosForms((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      alert(err.message);
    }
  }

  // --- CRUD Membros por guildId ---

  // Para controlar inputs do form membro de uma guild
  function startEditMembro(guildId, membro) {
    setGuildMembrosForms((prev) => ({
      ...prev,
      [guildId]: {
        editingMembro: membro,
        apelido: membro.apelido,
        password: membro.password,
        role: membro.role,
      },
    }));
  }

  function resetMembroForm(guildId) {
    setGuildMembrosForms((prev) => ({
      ...prev,
      [guildId]: {
        editingMembro: null,
        apelido: "",
        password: "",
        role: "",
      },
    }));
  }

  async function handleMembroSubmit(e, guildId) {
    e.preventDefault();
    const form = guildMembrosForms[guildId];
    if (!form || !form.apelido || !form.password || !form.role) {
      alert("Preencha todos os campos do membro");
      return;
    }

    const method = form.editingMembro ? "PUT" : "POST";
    const url = form.editingMembro
      ? `${API_URL}/membros/${form.editingMembro.id}`
      : `${API_URL}/membros`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apelido: form.apelido,
          password: form.password,
          role: form.role,
          guildId: guildId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar membro");

      fetchMembros(guildId);
      resetMembroForm(guildId);
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteMembro(guildId, membroId) {
    if (!window.confirm("Confirma exclusão do membro?")) return;
    try {
      const res = await fetch(`${API_URL}/membros/${membroId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar membro");
      fetchMembros(guildId);
    } catch (err) {
      alert(err.message);
    }
  }

  // Para inputs form membros que mudam (controlados por guild)
  function handleMembroInputChange(guildId, field, value) {
    setGuildMembrosForms((prev) => ({
      ...prev,
      [guildId]: {
        ...prev[guildId],
        [field]: value,
      },
    }));
  }

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className="max-w-5xl p-5 mx-auto font-sans bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          type="button"
        >
          Logout
        </button>
      </div>

      {/* Form criação/edição guild */}
      <section className="max-w-md p-4 mx-auto mb-12 border border-gray-300 rounded">
        <h2 className="mb-4 text-xl font-semibold text-center">
          {editingGuild ? "Editar Guild" : "Criar Guild"}
        </h2>
        <form
          onSubmit={handleGuildSubmit}
          className="flex flex-col gap-3"
          autoComplete="off"
        >
          <input
            type="text"
            placeholder="Sprite URL"
            value={guildSpriteUrl}
            onChange={(e) => setGuildSpriteUrl(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="text"
            placeholder="Admin ID"
            value={guildAdminId}
            onChange={(e) => setGuildAdminId(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {editingGuild ? "Atualizar Guild" : "Criar Guild"}
          </button>
          {editingGuild && (
            <button
              type="button"
              onClick={() => {
                setEditingGuild(null);
                setGuildSpriteUrl("");
                setGuildAdminId("");
              }}
              className="mt-1 text-gray-600 underline"
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      {/* Lista de Guilds em Cards */}
      <section className="">
        {guildLoading ? (
          <p>Carregando guilds...</p>
        ) : guildError ? (
          <p className="text-red-600">{guildError}</p>
        ) : guilds.length === 0 ? (
          <p className="text-center text-gray-600">Nenhuma guild encontrada.</p>
        ) : (
          guilds.map((guild) => {
            const membros = guildMembros[guild.id] || [];
            const loading = guildMembrosLoading[guild.id];
            const error = guildMembrosError[guild.id];
            const form = guildMembrosForms[guild.id] || {
              editingMembro: null,
              apelido: "",
              password: "",
              role: "",
            };

            return (
              <div
                key={guild.id}
                className="flex flex-col p-5 mb-8 border rounded shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="mb-1 text-lg font-semibold">
                      Guild ID: {guild.id}
                    </h3>
                    <p>
                      <strong>Sprite URL: </strong>
                      <a
                        href={guild.spriteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {guild.spriteUrl}
                      </a>
                    </p>
                    <p>
                      <strong>Admin ID: </strong> {guild.admin?.id || "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditGuild(guild)}
                      className="px-3 py-1 text-yellow-800 bg-yellow-300 rounded hover:bg-yellow-400"
                      type="button"
                    >
                      Editar Guild
                    </button>
                    <button
                      onClick={() => deleteGuild(guild.id)}
                      className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                      type="button"
                    >
                      Apagar Guild
                    </button>
                  </div>
                </div>

                <div className="pt-4 mb-4 border-t border-gray-300">
                  <h4 className="mb-3 font-semibold text-md">Membros</h4>

                  {loading ? (
                    <p>Carregando membros...</p>
                  ) : error ? (
                    <p className="text-red-600">{error}</p>
                  ) : membros.length === 0 ? (
                    <p className="text-gray-600">Nenhum membro encontrado.</p>
                  ) : (
                    <ul className="mb-4 bg-white border border-gray-300 rounded">
                      {membros.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between p-2 border-b border-gray-200"
                        >
                          <div>
                            <p>
                              <strong>Apelido:</strong> {m.apelido}
                            </p>
                            <p>
                              <strong>Role:</strong> {m.role}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditMembro(guild.id, m)}
                              className="px-2 py-1 text-yellow-800 bg-yellow-300 rounded hover:bg-yellow-400"
                              type="button"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteMembro(guild.id, m.id)}
                              className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                              type="button"
                            >
                              Apagar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Form membro (criar/editar) */}
                  <form
                    onSubmit={(e) => handleMembroSubmit(e, guild.id)}
                    className="flex flex-col max-w-md gap-3"
                    autoComplete="off"
                  >
                    <input
                      type="text"
                      placeholder="Apelido"
                      value={form.apelido || ""}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "apelido",
                          e.target.value
                        )
                      }
                      required
                      className="p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="password"
                      placeholder="Senha"
                      value={form.password || ""}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "password",
                          e.target.value
                        )
                      }
                      required
                      className="p-2 border border-gray-300 rounded"
                    />
                    <select
                      value={form.role || ""}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "role",
                          e.target.value
                        )
                      }
                      required
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="">Selecione Role</option>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="membro">membro</option>
                    </select>
                    <button
                      type="submit"
                      className="py-2 text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      {form.editingMembro ? "Atualizar Membro" : "Criar Membro"}
                    </button>
                    {form.editingMembro && (
                      <button
                        type="button"
                        onClick={() => resetMembroForm(guild.id)}
                        className="mt-1 text-gray-600 underline"
                      >
                        Cancelar edição
                      </button>
                    )}
                  </form>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
