import React, { useState, useEffect } from "react";
import { FaPencilAlt, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

const API_URL = "https://undertimer-biel.onrender.com";

export default function AdminMonstros({ guildId }) {
  const [monstros, setMonstros] = useState([]);
  const [monstroForm, setMonstroForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMonstros();
  }, [guildId]);

  async function fetchMonstros() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/`);
      if (!res.ok) throw new Error("Erro ao buscar monstros");
      const data = await res.json();
      const filtered = data.filter((m) => m.guildId === guildId);
      setMonstros(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEditMonstro(monstro) {
    setMonstroForm(monstro);
  }

  function resetMonstroForm() {
    setMonstroForm(null);
  }

  async function handleMonstroSubmit(e) {
    e.preventDefault();

    const body = {
      ...monstroForm,
      guildId,
    };

    const isEdit = !!monstroForm.id;
    const url = isEdit ? `${API_URL}/edit` : `${API_URL}/creatures`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erro ao salvar monstro");

      fetchMonstros();
      resetMonstroForm();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteMonstro(id) {
    if (!window.confirm("Deseja excluir este monstro?")) return;
    try {
      const res = await fetch(`${API_URL}/creatures/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao deletar monstro");

      fetchMonstros();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleMonstroInputChange(field, value) {
    setMonstroForm((prev) => ({
      ...prev,
      [field]: field === "respawn" ? parseFloat(value) : value,
    }));
  }

  return (
    <div className="w-full p-4 mt-6 border-t rounded-md bg-neutral-900 border-neutral-700">
      <h3 className="mb-3 text-base font-semibold">Monstros</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="pr-4">Sprite</th>
                <th className="pr-4">Nome</th>
                <th className="pr-4">Tipo</th>
                <th className="pr-4">Tier</th>
                <th className="pr-4">Respawn</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {monstros.map((m) => (
                <tr key={m.id} className="border-t border-neutral-700">
                  <td className="flex justify-center py-1 pr-4">
                    <img
                      src={m.spriteUrl}
                      alt="sprite"
                      className="h-auto rounded max-w-10 max-h-10"
                    />
                  </td>
                  <td className="py-1 pr-4">
                    {monstroForm?.id === m.id ? (
                      <input
                        type="text"
                        value={monstroForm.name}
                        onChange={(e) =>
                          handleMonstroInputChange("name", e.target.value)
                        }
                        className="w-full p-1 text-black rounded bg-neutral-200"
                      />
                    ) : (
                      m.name
                    )}
                  </td>
                  <td className="py-1 pr-4">
                    {monstroForm?.id === m.id ? (
                      <input
                        type="text"
                        value={monstroForm.type}
                        onChange={(e) =>
                          handleMonstroInputChange("type", e.target.value)
                        }
                        className="w-full p-1 text-black rounded bg-neutral-200"
                      />
                    ) : (
                      m.type
                    )}
                  </td>
                  <td className="py-1 pr-4">
                    {monstroForm?.id === m.id ? (
                      <input
                        type="text"
                        value={monstroForm.tier}
                        onChange={(e) =>
                          handleMonstroInputChange("tier", e.target.value)
                        }
                        className="w-full p-1 text-black rounded bg-neutral-200"
                      />
                    ) : (
                      m.tier
                    )}
                  </td>
                  <td className="py-1 pr-4">
                    {monstroForm?.id === m.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={monstroForm.respawn}
                        onChange={(e) =>
                          handleMonstroInputChange("respawn", e.target.value)
                        }
                        className="w-full p-1 text-black rounded bg-neutral-200"
                      />
                    ) : (
                      m.respawn
                    )}
                  </td>
                  <td className="flex h-10 gap-2 py-1 w-fit">
                    {monstroForm?.id === m.id ? (
                      <>
                        <button
                          onClick={handleMonstroSubmit}
                          className="text-green-400 hover:text-green-200"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={resetMonstroForm}
                          className="text-white hover:text-red-200"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditMonstro(m)}
                          className="text-white hover:text-yellow-200"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => deleteMonstro(m.id)}
                          className="text-white hover:text-red-200"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {monstros.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-2 italic text-gray-400">
                    Nenhum monstro cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
