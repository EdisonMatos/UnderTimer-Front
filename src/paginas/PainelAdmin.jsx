import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = "https://undertimer-biel.onrender.com";

export default function PainelAdmin() {
  const loggedInUserId = localStorage.getItem("userId");

  const [guilds, setGuilds] = useState([]);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");
  const [guildForm, setGuildForm] = useState({ spriteUrl: "", name: "" });
  const [guildEditForm, setGuildEditForm] = useState({});
  const [guildEditingId, setGuildEditingId] = useState(null);

  const [guildMembros, setGuildMembros] = useState({});
  const [guildMembrosLoading, setGuildMembrosLoading] = useState({});
  const [guildMembrosError, setGuildMembrosError] = useState({});
  const [guildMembrosForms, setGuildMembrosForms] = useState({});

  const [guildCounts, setGuildCounts] = useState({});

  const endpoints = [
    { key: "membros", label: "Membros" },
    { key: "", label: "Monstros" },
    { key: "instancias", label: "Instâncias" },
    { key: "contascompartilhadas", label: "Contas Compartilhadas" },
  ];

  useEffect(() => {
    fetchGuilds();
  }, []);

  async function fetchGuilds() {
    setGuildLoading(true);
    setGuildError("");
    try {
      const res = await fetch(`${API_URL}/guilds`);
      if (!res.ok) throw new Error("Erro ao buscar guilds");
      const data = await res.json();
      const userGuilds = data.filter((g) => g.admin?.id === loggedInUserId);
      setGuilds(userGuilds);

      for (const g of userGuilds) {
        fetchMembros(g.id);
        fetchGuildCounts(g.id);
      }
    } catch (err) {
      setGuildError(err.message);
    } finally {
      setGuildLoading(false);
    }
  }

  async function fetchGuildCounts(guildId) {
    const counts = {};
    for (const ep of endpoints) {
      try {
        const res = await fetch(`${API_URL}/${ep.key}`);
        const data = await res.json();
        const filtered = data.filter((item) => {
          return item.guildId === guildId || item.guild?.id === guildId;
        });
        counts[ep.key] = filtered.length;
      } catch {
        counts[ep.key] = 0;
      }
    }
    setGuildCounts((prev) => ({ ...prev, [guildId]: counts }));
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
      setGuildMembrosError((prev) => ({
        ...prev,
        [guildId]: err.message,
      }));
    } finally {
      setGuildMembrosLoading((prev) => ({ ...prev, [guildId]: false }));
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
      alert("Preencha todos os campos");
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
          guildId,
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
    if (!window.confirm("Confirma exclusão?")) return;
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

  async function handleGuildCreate(e) {
    e.preventDefault();
    if (!guildForm.spriteUrl || !guildForm.name) return alert("Preencha tudo");
    try {
      const res = await fetch(`${API_URL}/guilds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spriteUrl: guildForm.spriteUrl,
          name: guildForm.name,
          adminId: loggedInUserId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar guild");
      setGuildForm({ spriteUrl: "", name: "" });
      fetchGuilds();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleGuildUpdate(guildId) {
    const { name, spriteUrl } = guildEditForm[guildId] || {};
    if (!name || !spriteUrl) return alert("Preencha todos os campos");
    try {
      const res = await fetch(`${API_URL}/guilds/${guildId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spriteUrl, name }),
      });
      if (!res.ok) throw new Error("Erro ao editar guild");
      setGuildEditingId(null);
      fetchGuilds();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleGuildDelete(id) {
    if (!window.confirm("Deseja deletar esta guild?")) return;
    try {
      await fetch(`${API_URL}/guilds/${id}`, { method: "DELETE" });
      fetchGuilds();
    } catch (err) {
      alert("Erro ao deletar guild");
    }
  }

  function handleEditInputChange(guildId, field, value) {
    setGuildEditForm((prev) => ({
      ...prev,
      [guildId]: {
        ...prev[guildId],
        [field]: value,
      },
    }));
  }

  return (
    <div className="max-w-5xl p-5 mx-auto mt-20 font-sans text-white">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Painel Admin - UnderTimer</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Sair
        </button>
      </div>

      <div className="p-4 mb-12 border rounded-md bg-neutral-800 border-neutral-700">
        <div className="p-6 rounded-md bg-neutral-900 border-neutral-700">
          <h2 className="mb-4 text-lg font-semibold">Nova Guild</h2>
          <form onSubmit={handleGuildCreate} className="flex gap-3">
            <input
              type="text"
              placeholder="Nome da guild"
              value={guildForm.name}
              onChange={(e) =>
                setGuildForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-1/3 p-2 text-black rounded bg-neutral-300"
            />
            <input
              type="text"
              placeholder="URL do emblema"
              value={guildForm.spriteUrl}
              onChange={(e) =>
                setGuildForm((prev) => ({ ...prev, spriteUrl: e.target.value }))
              }
              className="w-1/3 p-2 text-black rounded bg-neutral-300"
            />
            <button
              type="submit"
              className="px-6 py-2 text-white rounded bg-primary"
            >
              Criar
            </button>
          </form>
        </div>
      </div>

      {guildLoading ? (
        <p>Carregando guilds...</p>
      ) : guildError ? (
        <p className="text-red-500">{guildError}</p>
      ) : guilds.length === 0 ? (
        <p className="text-center text-gray-400">Nenhuma guild encontrada.</p>
      ) : (
        guilds.map((guild) => {
          const counts = guildCounts[guild.id] || {};
          const membros = guildMembros[guild.id] || [];
          const loading = guildMembrosLoading[guild.id];
          const error = guildMembrosError[guild.id];
          const form = guildMembrosForms[guild.id] || {
            editingMembro: null,
            apelido: "",
            password: "",
            role: "",
          };

          const isEditingGuild = guildEditingId === guild.id;
          const editValues = guildEditForm[guild.id] || {
            name: guild.name,
            spriteUrl: guild.spriteUrl,
          };

          return (
            <div
              key={guild.id}
              className="p-6 mb-10 border rounded-md shadow bg-neutral-800 border-neutral-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={guild.spriteUrl}
                    alt="Emblema"
                    className="w-16 h-16 border rounded-full"
                  />
                  {isEditingGuild ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) =>
                          handleEditInputChange(
                            guild.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="p-1 text-black rounded bg-neutral-200"
                      />
                      <input
                        type="text"
                        value={editValues.spriteUrl}
                        onChange={(e) =>
                          handleEditInputChange(
                            guild.id,
                            "spriteUrl",
                            e.target.value
                          )
                        }
                        className="p-1 text-black rounded bg-neutral-200"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-lg font-semibold">
                        {guild.name || `Guild ${guild.id}`}
                      </h2>
                      <div className="flex gap-4 text-md opacity-80">
                        {endpoints.map((ep) => (
                          <p key={ep.key}>
                            {ep.label}:{" "}
                            <span className="text-green-400">
                              {counts[ep.key] ?? 0}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  {isEditingGuild ? (
                    <>
                      <button
                        onClick={() => handleGuildUpdate(guild.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => setGuildEditingId(null)}
                        className="text-white hover:text-red-200"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setGuildEditingId(guild.id);
                          setGuildEditForm((prev) => ({
                            ...prev,
                            [guild.id]: {
                              name: guild.name,
                              spriteUrl: guild.spriteUrl,
                            },
                          }));
                        }}
                        className="text-white hover:text-yellow-200"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleGuildDelete(guild.id)}
                        className="text-white hover:text-red-200"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Formulário de membros */}
              <div className="w-full p-4 mt-6 border-t rounded-md bg-neutral-900 border-neutral-700">
                <h3 className="w-full mb-3 text-base font-semibold">
                  Adicionar membro
                </h3>
                {!form.editingMembro && (
                  <form
                    onSubmit={(e) => handleMembroSubmit(e, guild.id)}
                    className="flex gap-2 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Usuário"
                      value={form.apelido}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "apelido",
                          e.target.value
                        )
                      }
                      className="p-2 text-black rounded w-[25%] bg-neutral-300"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Senha"
                      value={form.password}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "password",
                          e.target.value
                        )
                      }
                      className="p-2 text-black rounded w-[25%] bg-neutral-300"
                      required
                    />
                    <select
                      value={form.role}
                      onChange={(e) =>
                        handleMembroInputChange(
                          guild.id,
                          "role",
                          e.target.value
                        )
                      }
                      className="p-2 text-black rounded w-[25%] bg-neutral-300"
                      required
                    >
                      <option value="">Role</option>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                      <option value="membro">membro</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-primary w-[20%] rounded"
                    >
                      Adicionar
                    </button>
                  </form>
                )}
                <h3 className="mt-8 mb-3 text-base font-semibold">Membros</h3>
                {loading ? (
                  <p>Carregando...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div>
                    <table className="w-full text-sm border-collapse">
                      <thead className="w-full ">
                        <tr className="text-left text-gray-400">
                          <th className="pr-4">Usuário</th>
                          <th className="pr-4">Senha</th>
                          <th className="pr-4">Função</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membros.map((m) => (
                          <tr
                            key={m.id}
                            className="border-t border-neutral-700"
                          >
                            <td className="py-1 pr-4">
                              {form.editingMembro?.id === m.id ? (
                                <input
                                  type="text"
                                  value={form.apelido}
                                  onChange={(e) =>
                                    handleMembroInputChange(
                                      guild.id,
                                      "apelido",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 text-black rounded bg-neutral-200"
                                />
                              ) : (
                                m.apelido
                              )}
                            </td>
                            <td className="py-1 pr-4">
                              {form.editingMembro?.id === m.id ? (
                                <input
                                  type="text"
                                  value={form.password}
                                  onChange={(e) =>
                                    handleMembroInputChange(
                                      guild.id,
                                      "password",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 text-black rounded bg-neutral-200"
                                />
                              ) : (
                                "••••••"
                              )}
                            </td>
                            <td className="py-1 pr-4">
                              {form.editingMembro?.id === m.id ? (
                                <select
                                  value={form.role}
                                  onChange={(e) =>
                                    handleMembroInputChange(
                                      guild.id,
                                      "role",
                                      e.target.value
                                    )
                                  }
                                  className="w-full p-1 text-black rounded bg-neutral-200"
                                >
                                  <option value="admin">admin</option>
                                  <option value="staff">staff</option>
                                  <option value="membro">membro</option>
                                </select>
                              ) : (
                                m.role
                              )}
                            </td>
                            <td className="flex gap-2 py-1">
                              {form.editingMembro?.id === m.id ? (
                                <>
                                  <button
                                    onClick={(e) =>
                                      handleMembroSubmit(e, guild.id)
                                    }
                                    className="text-green-400 hover:text-green-200"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    onClick={() => resetMembroForm(guild.id)}
                                    className="text-white hover:text-red-200"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditMembro(guild.id, m)}
                                    className="text-white hover:text-yellow-200"
                                  >
                                    <FaPencilAlt />
                                  </button>
                                  <button
                                    onClick={() => deleteMembro(guild.id, m.id)}
                                    className="text-white hover:text-red-200"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                        {membros.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-2 italic text-gray-400"
                            >
                              Nenhum membro ainda
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
