import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import LootInstancia from "./LootInstancia";

export default function InstanciasTabela({
  inst,
  contagemRegressiva,
  buscarInstancias,
  editandoInstancia,
  setEditandoInstancia,
  instanciaEditada,
  setInstanciaEditada,
  mostrarAdicionarMembro,
  setMostrarAdicionarMembro,
  mostrarLoot,
  setMostrarLoot,
  novosMembros,
  setNovosMembros,
  carregandoMembros,
  setCarregandoMembros,
  editandoMembro,
  setEditandoMembro,
}) {
  const editarInstanciaConfirmar = async () => {
    try {
      const rawLast =
        instanciaEditada[inst.id]?.last ||
        new Date(inst.last).toISOString().slice(0, 16);
      const lastISO = new Date(rawLast).toISOString();
      const payload = {
        name: instanciaEditada[inst.id]?.name || inst.name,
        spriteUrl: instanciaEditada[inst.id]?.spriteUrl || inst.spriteUrl,
        last: lastISO,
      };
      await axios.put(
        `https://undertimer-biel.onrender.com/instancias/${inst.id}`,
        payload
      );
      toast.success("Instância editada com sucesso");
      setEditandoInstancia((prev) => ({ ...prev, [inst.id]: false }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao editar instância:", err);
    }
  };

  const deletarInstancia = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta instância e todos os seus membros?"
      )
    )
      return;

    const toastId = toast.loading("Excluindo instância...");
    try {
      for (const membro of inst.membros || []) {
        await axios.delete(
          `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`
        );
      }

      await axios.delete(
        `https://undertimer-biel.onrender.com/instancias/${inst.id}`
      );

      toast.update(toastId, {
        render: "Instância e membros excluídos com sucesso",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });

      buscarInstancias();
    } catch (err) {
      toast.update(toastId, {
        render: "Erro ao excluir instância ou membros.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  const adicionarMembro = async () => {
    const { name, role } = novosMembros[inst.id] || {};
    try {
      setCarregandoMembros((prev) => ({ ...prev, [inst.id]: true }));
      await axios.post(
        "https://undertimer-biel.onrender.com/membrosinstancia",
        {
          name,
          role,
          instanciaId: inst.id,
        }
      );
      toast.success("Membro adicionado com sucesso");
      setNovosMembros((prev) => ({
        ...prev,
        [inst.id]: { name: "", role: "" },
      }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao adicionar membro:", err);
    } finally {
      setCarregandoMembros((prev) => ({ ...prev, [inst.id]: false }));
    }
  };

  const deletarMembro = async (id) => {
    try {
      await axios.delete(
        `https://undertimer-biel.onrender.com/membrosinstancia/${id}`
      );
      toast.success("Membro excluído com sucesso");
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao deletar membro:", err);
    }
  };

  const editarMembroConfirmar = async (membro) => {
    try {
      await axios.put(
        `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`,
        membro
      );
      toast.success("Membro editado com sucesso");
      setEditandoMembro((prev) => ({ ...prev, [membro.id]: false }));
      buscarInstancias();
    } catch (err) {
      console.error("Erro ao editar membro:", err);
    }
  };

  const nome = novosMembros[inst.id]?.name || "";
  const funcao = novosMembros[inst.id]?.role || "";
  const carregando = carregandoMembros[inst.id];
  const desabilitado = carregando || (!nome.trim() && !funcao.trim());

  return (
    <div className="p-4 mb-10 text-white border border-neutral-900 bg-cards shadow-md shadow-black h-fit rounded-md w-full lg:w-[32%] lg:max-w-[330px]">
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="w-[15%]">
          <img src={inst.spriteUrl} alt={inst.name} className="w-12 h-12" />
        </div>

        <div className="w-[60%]">
          {editandoInstancia[inst.id] ? (
            <>
              <input
                type="text"
                value={instanciaEditada[inst.id]?.name || inst.name}
                onChange={(e) =>
                  setInstanciaEditada((prev) => ({
                    ...prev,
                    [inst.id]: { ...prev[inst.id], name: e.target.value },
                  }))
                }
                className="w-full h-8 p-1 mb-1 text-black rounded"
              />
              <input
                type="text"
                value={instanciaEditada[inst.id]?.spriteUrl || inst.spriteUrl}
                onChange={(e) =>
                  setInstanciaEditada((prev) => ({
                    ...prev,
                    [inst.id]: { ...prev[inst.id], spriteUrl: e.target.value },
                  }))
                }
                className="w-full h-8 p-1 mb-1 text-black rounded"
              />
              <input
                type="datetime-local"
                value={
                  instanciaEditada[inst.id]?.last ||
                  new Date(inst.last).toISOString().slice(0, 16)
                }
                onChange={(e) =>
                  setInstanciaEditada((prev) => ({
                    ...prev,
                    [inst.id]: { ...prev[inst.id], last: e.target.value },
                  }))
                }
                className="w-full h-8 p-1 text-black rounded"
              />
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{inst.name}</h3>
              <p className="text-sm opacity-70">
                Data: {new Date(inst.last).toLocaleString()}
              </p>
            </>
          )}

          <p className="text-sm opacity-70">
            Tempo:{" "}
            <span
              className={
                contagemRegressiva[inst.id] !== "-" ? "text-green-400" : ""
              }
            >
              {contagemRegressiva[inst.id] || "-"}
            </span>
          </p>
        </div>

        <div className="flex flex-col w-[15%]">
          <div className="flex items-center justify-center h-12">
            <div className="flex gap-3">
              {editandoInstancia[inst.id] ? (
                <>
                  <button
                    onClick={editarInstanciaConfirmar}
                    className="text-green-400 hover:text-green-200"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() =>
                      setEditandoInstancia((prev) => ({
                        ...prev,
                        [inst.id]: false,
                      }))
                    }
                    className="text-white hover:text-red-200"
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setEditandoInstancia((prev) => ({
                        ...prev,
                        [inst.id]: true,
                      }))
                    }
                    className="text-white hover:text-yellow-200"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={deletarInstancia}
                    className="text-white hover:text-red-200"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de membros */}
      <h4 className="mt-4 mb-2 font-semibold">Membros</h4>
      <table className="w-full mb-4 text-sm">
        <thead>
          <tr className="text-left text-gray-400">
            <th className="w-[10%]">Nº</th>
            <th className="w-[50%]">Nome</th>
            <th className="w-[50%]">Função</th>
            <th className="w-[20%]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {(inst.membros || []).map((membro, i) => (
            <tr key={membro.id} className="border-t border-neutral-700">
              <td>{i + 1}</td>
              <td>
                {editandoMembro[membro.id] ? (
                  <input
                    value={membro.name}
                    onChange={(e) => (inst.membros[i].name = e.target.value)}
                    className="p-1 h-5 text-black rounded w-[60%]"
                  />
                ) : (
                  membro.name
                )}
              </td>
              <td>
                {editandoMembro[membro.id] ? (
                  <input
                    value={membro.role}
                    onChange={(e) => (inst.membros[i].role = e.target.value)}
                    className="p-1 h-5 text-black rounded w-[60%]"
                  />
                ) : (
                  membro.role
                )}
              </td>
              <td className="flex gap-2 mt-1">
                {editandoMembro[membro.id] ? (
                  <>
                    <button
                      onClick={() => editarMembroConfirmar(membro)}
                      className="text-green-400"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() =>
                        setEditandoMembro((prev) => ({
                          ...prev,
                          [membro.id]: false,
                        }))
                      }
                      className="text-white hover:text-red-200"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setEditandoMembro((prev) => ({
                          ...prev,
                          [membro.id]: true,
                        }))
                      }
                      className="text-white hover:text-yellow-200"
                    >
                      <FaPencilAlt />
                    </button>
                    <button
                      onClick={() => deletarMembro(membro.id)}
                      className="text-white hover:text-red-200"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {inst.membros.length === 0 && (
            <tr>
              <td colSpan={4} className="italic text-gray-400">
                Nenhum membro ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Ações adicionais */}
      <div className="flex justify-between">
        <button
          onClick={() =>
            setMostrarAdicionarMembro((prev) => ({
              ...prev,
              [inst.id]: !prev[inst.id],
            }))
          }
          className="text-sm font-semibold text-blue-400 hover:underline"
        >
          {mostrarAdicionarMembro[inst.id] ? "Ocultar" : "Adicionar Membro +"}
        </button>
        <button
          onClick={() =>
            setMostrarLoot((prev) => ({
              ...prev,
              [inst.id]: !prev[inst.id],
            }))
          }
          className="text-sm font-semibold text-blue-400 hover:underline"
        >
          {mostrarLoot?.[inst.id] ? "Ocultar" : "Loot da instância +"}
        </button>
      </div>

      {mostrarLoot?.[inst.id] && (
        <div className="p-2 mt-4 text-sm text-gray-300 border rounded border-neutral-700 bg-neutral-800">
          <LootInstancia instanciaId={inst.id} />
        </div>
      )}

      {mostrarAdicionarMembro[inst.id] && (
        <>
          <p className="mt-4 font-semibold">Adicionar membro:</p>
          <div className="flex justify-between gap-2 mt-3">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) =>
                setNovosMembros((prev) => ({
                  ...prev,
                  [inst.id]: {
                    name: e.target.value,
                    role: funcao,
                  },
                }))
              }
              className="p-2 text-black border rounded w-[25%] bg-neutral-300 border-gray-300"
            />
            <input
              type="text"
              placeholder="Função"
              value={funcao}
              onChange={(e) =>
                setNovosMembros((prev) => ({
                  ...prev,
                  [inst.id]: {
                    name: nome,
                    role: e.target.value,
                  },
                }))
              }
              className="p-2 text-black border rounded w-[25%] bg-neutral-300 border-gray-300"
            />
            <button
              onClick={adicionarMembro}
              disabled={desabilitado}
              className="px-4 py-2 text-white bg-primary hover:scale-105 transition-all rounded w-[36%] disabled:opacity-50"
            >
              {carregando ? "..." : "Adicionar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
