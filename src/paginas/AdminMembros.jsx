import React, { useEffect, useState } from "react";
import {
  FaPencilAlt,
  FaTrash,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const API_URL = "https://undertimer-biel.onrender.com";

export default function AdminMembros({ guildId }) {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState({});
  const [form, setForm] = useState({
    editingMembro: null,
    apelido: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchMembros();
  }, []);

  async function fetchMembros() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/membros`);
      if (!res.ok) throw new Error("Erro ao buscar membros");
      let data = await res.json();
      data = data.filter((m) => m.guild?.id === guildId);
      const roleOrder = {
        guildmaster: 0,
        staff: 1,
        veterano: 2,
        membro: 3,
        novato: 4,
      };
      data.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
      setMembros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({
      editingMembro: null,
      apelido: "",
      password: "",
      role: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { apelido, password, role, editingMembro } = form;
    if (!apelido || !password || !role) {
      alert("Preencha todos os campos");
      return;
    }

    const method = editingMembro ? "PUT" : "POST";
    const url = editingMembro
      ? `${API_URL}/membros/${editingMembro.id}`
      : `${API_URL}/membros`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido, password, role, guildId }),
      });
      if (!res.ok) throw new Error("Erro ao salvar membro");
      fetchMembros();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Confirma exclusão?")) return;
    try {
      const res = await fetch(`${API_URL}/membros/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar membro");
      fetchMembros();
    } catch (err) {
      alert(err.message);
    }
  }

  function toggleSenha(id) {
    setSenhaVisivel((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="w-full p-4 mt-6 border-t rounded-md bg-neutral-900 border-neutral-700">
      <h3 className="w-full mb-3 text-base font-semibold">Adicionar membro</h3>
      {!form.editingMembro && (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Usuário"
            value={form.apelido}
            onChange={(e) => handleInputChange("apelido", e.target.value)}
            className="p-2 text-black rounded w-[25%] bg-neutral-300"
            required
          />
          <input
            type="text"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="p-2 text-black rounded w-[25%] bg-neutral-300"
            required
          />
          <select
            value={form.role}
            onChange={(e) => handleInputChange("role", e.target.value)}
            className="p-2 text-black rounded w-[25%] bg-neutral-300"
            required
          >
            <option value="novato">novato</option>
            <option value="membro">membro</option>
            <option value="veterano">veterano</option>
            <option value="staff">staff</option>
            <option value="guildmaster">guildmaster</option>
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
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="pr-4">Usuário</th>
              <th className="pr-4">Senha</th>
              <th className="pr-4">Função</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id} className="border-t border-neutral-700">
                <td className="py-1 pr-4">
                  {form.editingMembro?.id === m.id ? (
                    <input
                      value={form.apelido}
                      onChange={(e) =>
                        handleInputChange("apelido", e.target.value)
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
                      value={form.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full p-1 text-black rounded bg-neutral-200"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{senhaVisivel[m.id] ? m.password : "••••••"}</span>
                      <button
                        onClick={() => toggleSenha(m.id)}
                        className="text-blue-400 hover:text-blue-200"
                      >
                        {senhaVisivel[m.id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-1 pr-4">
                  {form.editingMembro?.id === m.id ? (
                    <select
                      value={form.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full p-1 text-black rounded bg-neutral-200"
                    >
                      <option value="novato">novato</option>
                      <option value="membro">membro</option>
                      <option value="veterano">veterano</option>
                      <option value="staff">staff</option>
                      <option value="guildmaster">guildmaster</option>
                    </select>
                  ) : (
                    m.role
                  )}
                </td>
                <td className="flex gap-2 py-1">
                  {form.editingMembro?.id === m.id ? (
                    <>
                      <button
                        onClick={handleSubmit}
                        className="text-green-400 hover:text-green-200"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={resetForm}
                        className="text-white hover:text-red-200"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setForm({
                            editingMembro: m,
                            apelido: m.apelido,
                            password: m.password,
                            role: m.role,
                          })
                        }
                        className="text-white hover:text-yellow-200"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
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
                <td colSpan={4} className="py-2 italic text-gray-400">
                  Nenhum membro ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
