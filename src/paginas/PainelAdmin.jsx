import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = "https://undertimer-biel.onrender.com";

export default function PainelAdmin() {
  const loggedInUserId = localStorage.getItem("userId");

  const [guilds, setGuilds] = useState([]);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");

  const [guildMembros, setGuildMembros] = useState({});
  const [guildMembrosLoading, setGuildMembrosLoading] = useState({});
  const [guildMembrosError, setGuildMembrosError] = useState({});
  const [guildMembrosForms, setGuildMembrosForms] = useState({});

  const [guildCounts, setGuildCounts] = useState({});

  const endpoints = [
    { key: "membros", label: "Membros" },
    { key: "instancias", label: "Instâncias" },
    { key: "", label: "Monstros" },
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

  return (
    <div className="max-w-5xl p-5 mx-auto mt-20 font-sans text-white">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
        >
          Sair
        </button>
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
                  <div>
                    <h2 className="text-lg font-semibold">
                      {guild.name || `Guild ${guild.id}`}
                    </h2>
                    <div className="mt-1 space-y-1 text-sm opacity-80">
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
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-md mt-6 w-[100%] border-t border-neutral-700">
                <h3 className="w-full mb-3 text-base font-semibold">
                  Adicionar membro
                </h3>
                {!form.editingMembro && (
                  <form
                    onSubmit={(e) => handleMembroSubmit(e, guild.id)}
                    className="flex gap-2 mt-4 "
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
                      Criar
                    </button>
                  </form>
                )}
                <h3 className="mt-8 mb-3 text-base font-semibold">Membros</h3>
                {loading ? (
                  <p>Carregando...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="">
                    <table className="w-full text-sm border-collapse">
                      <thead className="w-full ">
                        <tr className="text-left text-gray-400">
                          <th className="pr-4">Usuário</th>
                          <th className="pr-4">Senha</th>
                          <th className="pr-4">Função</th>
                          <th className="">Ações</th>
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
