import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

export default function LootInstancia({
  instanciaId,
  instGerenciadaPor,
  instUpdatedBy,
}) {
  const [loots, setLoots] = useState([]);
  const [novoLoot, setNovoLoot] = useState({
    name: "",
    updatedby: "",
    preco: "",
  });
  const [carregando, setCarregando] = useState(false);
  const [editandoLoot, setEditandoLoot] = useState({});
  const [lootEditado, setLootEditado] = useState({});
  const [mostrarAdicionarLoot, setMostrarAdicionarLoot] = useState(false);
  const [somaTotal, setSomaTotal] = useState(0);

  const apelido = localStorage.getItem("apelido") || "Anônimo";
  const role = localStorage.getItem("role");

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
      atualizarSoma(lootsFiltrados);
    } catch (err) {
      console.error("Erro ao buscar loot:", err);
    }
  }

  function atualizarSoma(loots) {
    const soma = loots.reduce((total, loot) => {
      const valor = parseFloat(loot.preco);
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    setSomaTotal(soma);
  }

  async function adicionarLoot() {
    if (role === "novato" && "visitante") {
      toast.error("Novatos não podem adicionar loot.");
      return;
    }
    if (
      instGerenciadaPor === "organizador" &&
      apelido.toLowerCase() !== (instUpdatedBy || "").toLowerCase()
    ) {
      toast.error(
        "Esta instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }

    const { name, updatedby, preco } = novoLoot;
    const algumPreenchido = name.trim() || updatedby.trim() || preco.trim();

    if (!algumPreenchido) {
      toast.error("Preencha ao menos um dos campos.");
      return;
    }

    setCarregando(true);
    try {
      await axios.post("https://undertimer-biel.onrender.com/lootinstancia", {
        name: name.trim() || null,
        updatedby: updatedby.trim() || null,
        preco: preco.trim() ? parseFloat(preco) : null,
        instanciaId,
        observacao: null,
        interesse: null,
      });
      toast.success("Loot adicionado");
      setNovoLoot({ name: "", updatedby: "", preco: "" });
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
    if (role === "novato") {
      toast.error("Novatos não podem excluir loot.");
      return;
    }
    if (
      instGerenciadaPor === "organizador" &&
      apelido.toLowerCase() !== (instUpdatedBy || "").toLowerCase()
    ) {
      toast.error(
        "Esta instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }
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
    if (role === "novato") {
      toast.error("Novatos não podem editar loot.");
      return;
    }
    if (
      instGerenciadaPor === "organizador" &&
      apelido.toLowerCase() !== (instUpdatedBy || "").toLowerCase()
    ) {
      toast.error(
        "Esta instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }

    const editado = lootEditado[loot.id] || {};

    try {
      await axios.put(
        `https://undertimer-biel.onrender.com/lootinstancia/${loot.id}`,
        {
          name: editado.name ?? loot.name,
          updatedby: editado.updatedby ?? loot.updatedby,
          preco:
            editado.preco !== undefined
              ? parseFloat(editado.preco)
              : loot.preco,
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
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMostrarAdicionarLoot((prev) => !prev)}
          className="text-sm font-semibold text-blue-400 hover:underline"
          type="button"
        >
          {mostrarAdicionarLoot ? "Ocultar" : "Adicionar Loot +"}
        </button>
        {loots.length > 0 && (
          <tfoot>
            <tr className="border-t border-neutral-700">
              <td colSpan={7} className="py-2 pr-2 font-semibold text-right ">
                Total:{" "}
                <span className="text-blue-400">{somaTotal.toFixed(2)}</span>
              </td>
            </tr>
          </tfoot>
        )}
      </div>

      {mostrarAdicionarLoot && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adicionarLoot();
          }}
          className="flex flex-col gap-2 mb-4 sm:flex-row sm:flex-wrap"
        >
          <input
            type="text"
            placeholder="Nome do loot (obrigatório)"
            value={novoLoot.name}
            onChange={(e) =>
              setNovoLoot((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-2 text-black rounded sm:w-[30%]"
            disabled={carregando}
          />
          <input
            type="text"
            placeholder="Quem dropou? (Opcional)"
            value={novoLoot.updatedby}
            onChange={(e) =>
              setNovoLoot((prev) => ({ ...prev, updatedby: e.target.value }))
            }
            className="w-full p-2 text-black rounded sm:w-[30%]"
            disabled={carregando}
          />
          <input
            type="number"
            placeholder="Preço (opcional)"
            value={novoLoot.preco || ""}
            onChange={(e) =>
              setNovoLoot((prev) => ({ ...prev, preco: e.target.value }))
            }
            className="w-full p-2 text-black rounded sm:w-[20%]"
            disabled={carregando}
          />
          <button
            type="submit"
            disabled={carregando}
            className="px-4 py-2 text-white rounded bg-primary disabled:opacity-50 sm:w-[15%]"
          >
            {carregando ? "..." : "Adicionar"}
          </button>
        </form>
      )}

      <table className="w-[500px] lg:w-full text-left text-gray-300 text-[10px] lg:text-[12px]">
        <thead>
          <tr className="border-b border-neutral-800">
            <th className="w-[5%]">Nº</th>
            <th className="w-[20%]">Nome</th>
            <th className="w-[15%]">Dropou</th>
            <th className="w-[10%]">Valor</th>
            <th className="w-[15%]">Quer</th>
            <th className="w-[35%]">Observações</th>
            <th className="w-[10%]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loots.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-2 italic text-center text-gray-500">
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
                      className="w-[90%] p-1 text-black rounded h-5"
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
                      className="w-[90%] p-1 text-black rounded h-5"
                    />
                  ) : (
                    capitalizar(loot.updatedby)
                  )}
                </td>
                <td className="py-1">
                  {editandoLoot[loot.id] ? (
                    <input
                      type="number"
                      value={lootEditado[loot.id]?.preco ?? loot.preco ?? ""}
                      onChange={(e) =>
                        setLootEditado((prev) => ({
                          ...prev,
                          [loot.id]: {
                            ...(prev[loot.id] || {}),
                            preco: e.target.value,
                          },
                        }))
                      }
                      className="w-[90%] p-1 text-black rounded h-5"
                    />
                  ) : loot.preco != null ? (
                    `${parseFloat(loot.preco).toFixed(2)}`
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-1">
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
                      className="w-[90%] p-1 text-black rounded h-5"
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
                      if (role === "novato") {
                        toast.error("Novatos não podem demonstrar interesse.");
                        return;
                      }

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
                        onClick={() => {
                          if (role === "novato") {
                            toast.error("Novatos não podem editar loot.");
                            return;
                          }
                          if (
                            instGerenciadaPor === "organizador" &&
                            apelido.toLowerCase() !==
                              (instUpdatedBy || "").toLowerCase()
                          ) {
                            toast.error(
                              "Esta instância está configurada para ser gerenciada apenas pelo organizador dela."
                            );
                            return;
                          }
                          setEditandoLoot((prev) => ({
                            ...prev,
                            [loot.id]: true,
                          }));
                        }}
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
