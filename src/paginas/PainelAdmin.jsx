import React, { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import AdminMembros from "./AdminMembros";

const API_URL = "https://undertimer-biel.onrender.com";

export default function PainelAdmin() {
  const loggedInUserId = localStorage.getItem("userId");

  const [guilds, setGuilds] = useState([]);
  const [guildLoading, setGuildLoading] = useState(false);
  const [guildError, setGuildError] = useState("");
  const [guildForm, setGuildForm] = useState({ spriteUrl: "", name: "" });
  const [guildEditForm, setGuildEditForm] = useState({});
  const [guildEditingId, setGuildEditingId] = useState(null);
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
          const isEditing = guildEditingId === guild.id;
          const editValues = guildEditForm[guild.id] || {
            name: guild.name,
            spriteUrl: guild.spriteUrl,
          };

          return (
            <div
              key={guild.id}
              className="p-6 mb-10 border rounded-md shadow bg-neutral-800 border-neutral-700"
            >
              <AdminHeader
                guild={guild}
                counts={counts}
                isEditingGuild={isEditing}
                editValues={editValues}
                endpoints={endpoints}
                onChange={(field, value) =>
                  handleEditInputChange(guild.id, field, value)
                }
                onUpdate={() => handleGuildUpdate(guild.id)}
                onCancelEdit={() => setGuildEditingId(null)}
                onStartEdit={() => {
                  setGuildEditingId(guild.id);
                  setGuildEditForm((prev) => ({
                    ...prev,
                    [guild.id]: {
                      name: guild.name,
                      spriteUrl: guild.spriteUrl,
                    },
                  }));
                }}
                onDelete={() => handleGuildDelete(guild.id)}
              />

              <AdminMembros guildId={guild.id} />
            </div>
          );
        })
      )}
    </div>
  );
}
