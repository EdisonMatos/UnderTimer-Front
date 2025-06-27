import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

export default function LootInstancia({ instanciaId }) {
  const [loots, setLoots] = useState([]);
  const [novoLoot, setNovoLoot] = useState({ name: "", updatedby: "" });
  const [carregando, setCarregando] = useState(false);
  const [editandoLoot, setEditandoLoot] = useState({});
  const [lootEditado, setLootEditado] = useState({});
  const [mostrarAdicionarLoot, setMostrarAdicionarLoot] = useState(false);

  const apelido = localStorage.getItem("apelido") || "Anônimo";

  useEffect(() => {
    if (!instanciaId) return;
    buscarLoots();
  }, [instanciaId]);

  async function buscarLoots() {
    try {
      const res = await axios.get(
        "https://undertimer-biel.onrender.com/lootinstancia"
      );
      const lootsFiltrados = res.data.filter(
        (l) => l.instanciaId === instanciaId
      );
      setLoots(lootsFiltrados);
    } catch (err) {
      console.error("Erro ao buscar loot:", err);
    }
  }

  async function adicionarLoot() {
    const { name, updatedby } = novoLoot;
    if (!name.trim() || !updatedby.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    try {
      await axios.post("https://undertimer-biel.onrender.com/lootinstancia", {
        name,
        updatedby,
        instanciaId,
        preco: null,
        observacao: null,
        interesse: null,
      });
      toast.success("Loot adicionado");
      setNovoLoot({ name: "", updatedby: "" });
      setMostrarAdicionarLoot(false);
      buscarLoots();
    } catch (err) {
      console.error("Erro ao adicionar loot:", err);
      toast.error("Erro ao adicionar loot");
    } finally {
      setCarregando(false);
    }
  }

  async function deletarLoot(id) {
    if (!window.confirm("Tem certeza que deseja excluir este loot?")) return;
    try {
      await axios.delete(
        `https://undertimer-biel.onrender.com/lootinstancia/${id}`
      );
      toast.success("Loot excluído");
      buscarLoots();
    } catch (err) {
      console.error("Erro ao excluir loot:", err);
      toast.error("Erro ao excluir loot");
    }
  }

  async function editarLootConfirmar(loot) {
    const editado = lootEditado[loot.id] || {};

    try {
      await axios.put(
        `https://undertimer-biel.onrender.com/lootinstancia/${loot.id}`,
        {
          name: editado.name ?? loot.name,
          updatedby: editado.updatedby ?? loot.updatedby,
          preco: loot.preco,
          observacao: editado.observacao ?? loot.observacao,
          interesse: loot.interesse,
        }
      );
      toast.success("Loot editado");
      setEditandoLoot((prev) => ({ ...prev, [loot.id]: false }));
      buscarLoots();
    } catch (err) {
      console.error("Erro ao editar loot:", err);
      toast.error("Erro ao editar loot");
    }
  }

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  return (
    <div>
      <button
        onClick={() => setMostrarAdicionarLoot((prev) => !prev)}
        className="mb-3 text-sm font-semibold text-blue-400 hover:underline"
        type="button"
      >
        {mostrarAdicionarLoot ? "Ocultar" : "Adicionar Loot +"}
      </button>

      {mostrarAdicionarLoot && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adicionarLoot();
          }}
          className="flex flex-col gap-2 mb-4 sm:flex-row"
        >
          <input
            type="text"
            placeholder="Nome do loot"
            value={novoLoot.name}
            onChange={(e) =>
              setNovoLoot((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-2 text-black rounded"
            disabled={carregando}
          />
          <input
            type="text"
            placeholder="Quem dropou?"
            value={novoLoot.updatedby}
            onChange={(e) =>
              setNovoLoot((prev) => ({ ...prev, updatedby: e.target.value }))
            }
            className="w-full p-2 text-black rounded"
            disabled={carregando}
          />
          <button
            type="submit"
            disabled={
              carregando || !novoLoot.name.trim() || !novoLoot.updatedby.trim()
            }
            className="px-4 py-2 text-white rounded bg-primary disabled:opacity-50"
          >
            {carregando ? "..." : "Adicionar"}
          </button>
        </form>
      )}

      <table className="w-full text-left text-gray-300 text-[10px] lg:text-[12px]">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="w-[6%] lg:w-[5%]">Nº</th>
            <th className="w-[25%] lg:w-[25%]">Nome</th>
            <th className="w-[15%] lg:w-[15%]">Dropou</th>
            <th className="w-[20%] lg:w-[15%]">Quer</th>
            <th className="w-[25%] lg:w-[40%]">Observações</th>
            <th className="w-[10%]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loots.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-2 italic text-center text-gray-500">
                Nenhum loot cadastrado.
              </td>
            </tr>
          ) : (
            loots.map((loot, i) => (
              <tr key={loot.id} className="border-b border-neutral-700">
                <td className="py-1">{i + 1}</td>
                <td className="py-1">
                  {editandoLoot[loot.id] ? (
                    <input
                      type="text"
                      value={lootEditado[loot.id]?.name ?? loot.name}
                      onChange={(e) =>
                        setLootEditado((prev) => ({
                          ...prev,
                          [loot.id]: {
                            ...(prev[loot.id] || {}),
                            name: e.target.value,
                          },
                        }))
                      }
                      className="w-[80%] p-1 text-black rounded h-5"
                    />
                  ) : (
                    loot.name
                  )}
                </td>
                <td className="py-1">
                  {editandoLoot[loot.id] ? (
                    <input
                      type="text"
                      value={lootEditado[loot.id]?.updatedby ?? loot.updatedby}
                      onChange={(e) =>
                        setLootEditado((prev) => ({
                          ...prev,
                          [loot.id]: {
                            ...(prev[loot.id] || {}),
                            updatedby: e.target.value,
                          },
                        }))
                      }
                      className="w-[80%] p-1 text-black rounded h-5"
                    />
                  ) : (
                    capitalizar(loot.updatedby)
                  )}
                </td>
                <td className="py-1 text-[10px]">
                  {loot.interesse ? (
                    loot.interesse.split(",").map((nome, idx, arr) => (
                      <span key={idx} className="inline-block mr-1">
                        {capitalizar(nome.trim())}
                        {idx < arr.length - 1 && ","}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-gray-500">Ninguém</span>
                  )}
                </td>
                <td className="py-1">
                  {editandoLoot[loot.id] ? (
                    <input
                      type="text"
                      value={
                        lootEditado[loot.id]?.observacao ??
                        loot.observacao ??
                        ""
                      }
                      onChange={(e) =>
                        setLootEditado((prev) => ({
                          ...prev,
                          [loot.id]: {
                            ...(prev[loot.id] || {}),
                            observacao: e.target.value,
                          },
                        }))
                      }
                      className="w-[80%] p-1 text-black rounded h-5"
                    />
                  ) : (
                    loot.observacao || (
                      <span className="italic text-gray-500">-</span>
                    )
                  )}
                </td>
                <td className="flex gap-2 py-1">
                  <button
                    onClick={() => {
                      const atuais = loot.interesse
                        ? loot.interesse.split(",").map((s) => s.trim())
                        : [];
                      const jaTem = atuais.includes(apelido);
                      const novaLista = jaTem
                        ? atuais.filter((n) => n !== apelido).join(", ")
                        : [...atuais, apelido].join(", ");

                      axios
                        .put(
                          `https://undertimer-biel.onrender.com/lootinstancia/${loot.id}`,
                          {
                            name: loot.name,
                            updatedby: loot.updatedby,
                            preco: loot.preco,
                            observacao: loot.observacao,
                            interesse: novaLista,
                          }
                        )
                        .then(() => {
                          toast.success(
                            jaTem
                              ? "Interesse removido."
                              : "Interesse registrado!"
                          );
                          buscarLoots();
                        })
                        .catch(() =>
                          toast.error("Erro ao atualizar interesse.")
                        );
                    }}
                    className={`hover:scale-110 ${
                      (loot.interesse || "")
                        .split(",")
                        .map((s) => s.trim())
                        .includes(apelido)
                        ? "text-pink-400"
                        : "text-white"
                    }`}
                    title="Demonstrar interesse"
                  >
                    ❤️
                  </button>

                  {editandoLoot[loot.id] ? (
                    <>
                      <button
                        onClick={() => editarLootConfirmar(loot)}
                        className="text-green-400 hover:text-green-200"
                        type="button"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() =>
                          setEditandoLoot((prev) => ({
                            ...prev,
                            [loot.id]: false,
                          }))
                        }
                        className="text-white hover:text-red-200"
                        type="button"
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditandoLoot((prev) => ({
                            ...prev,
                            [loot.id]: true,
                          }))
                        }
                        className="text-white hover:text-yellow-200"
                        type="button"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => deletarLoot(loot.id)}
                        className="text-white hover:text-red-200"
                        type="button"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
