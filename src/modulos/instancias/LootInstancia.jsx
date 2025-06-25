import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

export default function LootInstancia({ instanciaId }) {
  const [loots, setLoots] = useState([]);
  const [novoLoot, setNovoLoot] = useState({ name: "" });
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
    if (!novoLoot.name.trim()) {
      toast.error("Nome do loot é obrigatório");
      return;
    }

    setCarregando(true);
    try {
      await axios.post("https://undertimer-biel.onrender.com/lootinstancia", {
        name: novoLoot.name,
        updatedby: apelido,
        instanciaId,
        preco: null,
        observacao: null,
      });
      toast.success("Loot adicionado");
      setNovoLoot({ name: "" });
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
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este loot?"
    );
    if (!confirmar) return;

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
    if (!lootEditado[loot.id]?.name?.trim()) {
      toast.error("Nome do loot não pode ficar vazio");
      return;
    }

    try {
      await axios.put(
        `https://undertimer-biel.onrender.com/lootinstancia/${loot.id}`,
        {
          name: lootEditado[loot.id].name,
          updatedby: apelido,
          preco: loot.preco,
          observacao: loot.observacao,
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

  function capitalizarPrimeiraLetra(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  return (
    <div>
      <button
        onClick={() => setMostrarAdicionarLoot((prev) => !prev)}
        className="mb-3 text-sm font-semibold text-blue-400 hover:underline"
        type="button"
      >
        {mostrarAdicionarLoot ? "Ocultar" : "Adicionar loot +"}
      </button>

      {mostrarAdicionarLoot && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adicionarLoot();
          }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            placeholder="Nome do loot"
            value={novoLoot.name}
            onChange={(e) => setNovoLoot({ name: e.target.value })}
            className="w-full p-2 text-black rounded"
            disabled={carregando}
          />
          <button
            type="submit"
            disabled={carregando || !novoLoot.name.trim()}
            className="px-4 py-2 text-white rounded bg-primary disabled:opacity-50"
          >
            {carregando ? "..." : "Adicionar"}
          </button>
        </form>
      )}

      <table className="w-full text-sm text-left text-gray-300">
        <thead>
          <tr className="border-b border-neutral-700">
            <th className="w-[10%]">Nº</th>
            <th className="w-[40%]">Nome</th>
            <th className="w-[20%]">Por</th>
            <th className="w-[25%]">Quer</th>
            <th className="w-[10%]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loots.length === 0 && (
            <tr>
              <td colSpan={5} className="py-2 italic text-center text-gray-500">
                Nenhum loot cadastrado.
              </td>
            </tr>
          )}
          {loots.map((loot, i) => {
            const interessados = loot.observacao
              ? loot.observacao.split(",").map((s) => s.trim())
              : [];

            const jaInteressado = interessados.includes(apelido);

            return (
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
                      className="w-full p-1 text-black rounded"
                    />
                  ) : (
                    loot.name
                  )}
                </td>
                <td className="py-1">
                  {loot.updatedby
                    ? capitalizarPrimeiraLetra(loot.updatedby)
                    : "-"}
                </td>
                <td className="py-1 text-sm">
                  {interessados.length > 0 ? (
                    interessados.map((nome, idx) => (
                      <span key={idx} className="inline-block mr-1">
                        {nome.charAt(0).toUpperCase() + nome.slice(1)}
                        {idx < interessados.length - 1 && ","}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-gray-500">Ninguém</span>
                  )}
                </td>
                <td className="flex gap-2 py-1">
                  <button
                    onClick={() => {
                      const interessadosAtuais = loot.observacao
                        ? loot.observacao.split(",").map((s) => s.trim())
                        : [];

                      const jaTemInteresse =
                        interessadosAtuais.includes(apelido);

                      let novaLista;
                      if (jaTemInteresse) {
                        novaLista = interessadosAtuais
                          .filter((nome) => nome !== apelido)
                          .join(", ");
                        toast.info("Interesse removido.");
                      } else {
                        novaLista = [...interessadosAtuais, apelido].join(", ");
                        toast.success("Interesse registrado!");
                      }

                      axios
                        .put(
                          `https://undertimer-biel.onrender.com/lootinstancia/${loot.id}`,
                          {
                            name: loot.name,
                            updatedby: loot.updatedby,
                            preco: loot.preco,
                            observacao: novaLista,
                          }
                        )
                        .then(() => {
                          buscarLoots();
                        })
                        .catch(() => {
                          toast.error("Erro ao atualizar interesse.");
                        });
                    }}
                    className={`hover:scale-110 ${
                      (loot.observacao || "")
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
