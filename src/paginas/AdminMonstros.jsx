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
      const filteredMonstros = data.filter((m) => m.guildId === guildId);
      setMonstros(filteredMonstros);
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
    const method = monstroForm.id ? "PUT" : "POST";
    const url = monstroForm.id ? `${API_URL}/${monstroForm.id}` : `${API_URL}/`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(monstroForm),
      });
      if (!res.ok) throw new Error("Erro ao salvar monstro");

      fetchMonstros();
      resetMonstroForm();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteMonstro(monstroId) {
    if (!window.confirm("Deseja excluir este monstro?")) return;
    try {
      const res = await fetch(`${API_URL}/${monstroId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir monstro");

      fetchMonstros();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleMonstroInputChange(field, value) {
    setMonstroForm((prev) => ({ ...prev, [field]: value }));
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
                  <td className="py-1 pr-4">
                    <img
                      src={m.spriteUrl}
                      alt="sprite"
                      className="w-10 h-10 rounded"
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
                  <td className="flex gap-2 py-1">
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
