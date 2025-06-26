import React from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

export default function MembrosInstancia({
  membros,
  instId,
  editandoMembro,
  setEditandoMembro,
  setInstancias,
  deletarMembro,
  editarMembroConfirmar,
}) {
  return (
    <div className="p-2 mt-4 mb-4 rounded-md bg-neutral-900">
      <h4 className="mb-2 font-semibold ">Membros</h4>
      <table className="w-full text-sm ">
        <thead>
          <tr className="w-full text-left text-gray-400">
            <th className="w-[10%]"> Nº </th>
            <th className="w-[25%]"> Nome </th>
            <th className="w-[20%]"> Função </th>
            <th className="w-[40%]"> Observação </th>
            <th className="w-[10%]"> Ações </th>
          </tr>
        </thead>
        <tbody>
          {[...membros]
            .sort((a, b) => a.role.localeCompare(b.role))
            .map((membro, i) => (
              <tr key={membro.id} className="border-t border-neutral-700">
                <td>{i + 1}</td>
                <td>
                  {editandoMembro[membro.id] ? (
                    <input
                      type="text"
                      value={membro.name}
                      onChange={(e) =>
                        setInstancias((prev) =>
                          prev.map((instMap) =>
                            instMap.id === instId
                              ? {
                                  ...instMap,
                                  membros: instMap.membros.map((m) =>
                                    m.id === membro.id
                                      ? { ...m, name: e.target.value }
                                      : m
                                  ),
                                }
                              : instMap
                          )
                        )
                      }
                      className="p-1 h-5 text-black rounded w-[90%]"
                    />
                  ) : (
                    membro.name
                  )}
                </td>
                <td>
                  {editandoMembro[membro.id] ? (
                    <input
                      type="text"
                      value={membro.role}
                      onChange={(e) =>
                        setInstancias((prev) =>
                          prev.map((instMap) =>
                            instMap.id === instId
                              ? {
                                  ...instMap,
                                  membros: instMap.membros.map((m) =>
                                    m.id === membro.id
                                      ? { ...m, role: e.target.value }
                                      : m
                                  ),
                                }
                              : instMap
                          )
                        )
                      }
                      className="p-1 h-5 text-black rounded w-[90%]"
                    />
                  ) : (
                    membro.role
                  )}
                </td>
                <td>
                  {editandoMembro[membro.id] ? (
                    <input
                      type="text"
                      value={membro.observacoes || ""}
                      onChange={(e) =>
                        setInstancias((prev) =>
                          prev.map((instMap) =>
                            instMap.id === instId
                              ? {
                                  ...instMap,
                                  membros: instMap.membros.map((m) =>
                                    m.id === membro.id
                                      ? { ...m, observacoes: e.target.value }
                                      : m
                                  ),
                                }
                              : instMap
                          )
                        )
                      }
                      className="p-1 h-5 text-black rounded w-[90%]"
                    />
                  ) : (
                    membro.observacoes || ""
                  )}
                </td>
                <td className="flex gap-4 mt-1">
                  {editandoMembro[membro.id] ? (
                    <>
                      <button
                        onClick={() => editarMembroConfirmar(membro)}
                        className="text-green-400 hover:text-green-200"
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
          {membros.length === 0 && (
            <tr>
              <td colSpan={5} className="italic text-gray-400">
                Nenhum membro ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
