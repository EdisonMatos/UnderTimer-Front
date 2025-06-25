import React, { useState, useEffect } from "react";

const API_URL = "https://undertimer-biel.onrender.com";

export default function PainelAdmin() {
  const loggedInUserId = localStorage.getItem("userId");

  const [guilds, setGuilds] = useState([]);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");

  const [editingGuild, setEditingGuild] = useState(null);
  const [guildSpriteUrl, setGuildSpriteUrl] = useState("");

  const [guildMembros, setGuildMembros] = useState({});
  const [guildMembrosLoading, setGuildMembrosLoading] = useState({});
  const [guildMembrosError, setGuildMembrosError] = useState({});

  const [guildMembrosForms, setGuildMembrosForms] = useState({});

  async function fetchGuilds() {
    setGuildLoading(true);
    setGuildError("");
    try {
      const res = await fetch(`${API_URL}/guilds`);
      if (!res.ok) throw new Error("Erro ao buscar guilds");
      const data = await res.json();

      const userGuilds = data.filter((g) => g.admin?.id === loggedInUserId);
      setGuilds(userGuilds);

      userGuilds.forEach((g) => fetchMembros(g.id));
    } catch (err) {
      setGuildError(err.message);
    } finally {
      setGuildLoading(false);
    }
  }

  async function fetchMembros(guildId) {
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

  useEffect(() => {
    fetchGuilds();
  }, []);

  async function handleGuildSubmit(e) {
    e.preventDefault();
    if (!guildSpriteUrl) {
      alert("Preencha o spriteUrl da guild");
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
          adminId: loggedInUserId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar guild");

      fetchGuilds();
      setEditingGuild(null);
      setGuildSpriteUrl("");
    } catch (err) {
      alert(err.message);
    }
  }

  function startEditGuild(guild) {
    setEditingGuild(guild);
    setGuildSpriteUrl(guild.spriteUrl || "");
  }

  async function deleteGuild(id) {
    if (!window.confirm("Confirma exclusão da guild?")) return;
    try {
      const res = await fetch(`${API_URL}/guilds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar guild");
      fetchGuilds();
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
    <div className="max-w-5xl p-5 mx-auto mt-32 font-sans text-white">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white transition-all bg-red-600 rounded hover:bg-red-700"
          type="button"
        >
          Logout
        </button>
      </div>

      <section className="max-w-md p-6 mx-auto mb-12 border rounded-md shadow-md border-neutral-700 bg-cards shadow-black">
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
            className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
            required
          />
          <button
            type="submit"
            className="py-2 text-white transition-all rounded bg-primary hover:scale-105"
          >
            {editingGuild ? "Atualizar Guild" : "Criar Guild"}
          </button>
          {editingGuild && (
            <button
              type="button"
              onClick={() => {
                setEditingGuild(null);
                setGuildSpriteUrl("");
              }}
              className="mt-1 text-sm underline text-neutral-300"
            >
              Cancelar edição
            </button>
          )}
        </form>
      </section>

      <section>
        {guildLoading ? (
          <p>Carregando guilds...</p>
        ) : guildError ? (
          <p className="text-red-500">{guildError}</p>
        ) : guilds.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma guild encontrada.</p>
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
                className="p-6 mb-10 border rounded-md shadow-md bg-cards border-neutral-700 shadow-black"
              >
                <div className="flex items-start justify-between mb-4">
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
                        className="text-blue-400 underline"
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
                      className="px-3 py-1 text-yellow-900 transition-all bg-yellow-300 rounded hover:scale-105"
                      type="button"
                    >
                      Editar Guild
                    </button>
                    <button
                      onClick={() => deleteGuild(guild.id)}
                      className="px-3 py-1 text-white transition-all bg-red-600 rounded hover:scale-105"
                      type="button"
                    >
                      Apagar Guild
                    </button>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-700">
                  <h4 className="mb-3 text-base font-semibold">Membros</h4>

                  {loading ? (
                    <p>Carregando membros...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : membros.length === 0 ? (
                    <p className="text-gray-400">Nenhum membro encontrado.</p>
                  ) : (
                    <ul className="mb-4 border rounded border-neutral-700 bg-neutral-800">
                      {membros.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between p-2 border-b border-neutral-700"
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
                              className="px-2 py-1 text-yellow-900 transition-all bg-yellow-300 rounded hover:scale-105"
                              type="button"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteMembro(guild.id, m.id)}
                              className="px-2 py-1 text-white transition-all bg-red-600 rounded hover:scale-105"
                              type="button"
                            >
                              Apagar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

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
                      className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
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
                      className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
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
                      className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
                    >
                      <option value="">Selecione Role</option>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="membro">membro</option>
                    </select>
                    <button
                      type="submit"
                      className="py-2 text-white transition-all rounded bg-primary hover:scale-105"
                    >
                      {form.editingMembro ? "Atualizar Membro" : "Criar Membro"}
                    </button>
                    {form.editingMembro && (
                      <button
                        type="button"
                        onClick={() => resetMembroForm(guild.id)}
                        className="mt-1 text-sm underline text-neutral-300"
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
