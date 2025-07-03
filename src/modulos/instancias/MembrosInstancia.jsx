import React from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

export default function MembrosInstancia({
  membros,
  instId,
  instGerenciadaPor,
  instUpdatedBy,
  editandoMembro,
  setEditandoMembro,
  setInstancias,
  deletarMembro,
  editarMembroConfirmar,
}) {
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("apelido");

  const handleEditarClick = (membroId) => {
    if (userRole === "novato") {
      toast.error("Você não tem permissão para editar os membros.");
      return;
    }

    if (instGerenciadaPor === "organizador" && username !== instUpdatedBy) {
      toast.error(
        "Essa instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }

    setEditandoMembro((prev) => ({
      ...prev,
      [membroId]: true,
    }));
  };

  const handleDeletarClick = (membroId) => {
    if (userRole === "novato") {
      toast.error("Você não tem permissão para editar os membros.");
      return;
    }

    if (instGerenciadaPor === "organizador" && username !== instUpdatedBy) {
      toast.error(
        "Essa instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }

    deletarMembro(membroId);
  };

  const confirmarMembro = async (membro) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja confirmar presença?"
    );
    if (!confirmar) return;

    const toastId = toast.loading("Confirmando presença...");

    try {
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, "0");
      const mes = String(agora.getMonth() + 1).padStart(2, "0");
      const hora = String(agora.getHours()).padStart(2, "0");
      const minuto = String(agora.getMinutes()).padStart(2, "0");
      const apelidoRaw = localStorage.getItem("apelido") || "Usuário";
      const apelido = apelidoRaw.charAt(0).toUpperCase() + apelidoRaw.slice(1);

      const confirmadopor = `✅ ${apelido} - ${dia}/${mes}, ${hora}:${minuto}h`;

      await axios.put(
        `https://undertimer-biel.onrender.com/membrosinstancia/${membro.id}`,
        { ...membro, confirmadopor }
      );

      setInstancias((prev) =>
        prev.map((inst) =>
          inst.id === instId
            ? {
                ...inst,
                membros: inst.membros.map((m) =>
                  m.id === membro.id ? { ...m, confirmadopor } : m
                ),
              }
            : inst
        )
      );

      toast.update(toastId, {
        render: "Presença confirmada com sucesso",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    } catch (err) {
      console.error("Erro ao confirmar membro:", err);
      toast.update(toastId, {
        render: "Erro ao confirmar presença.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
    }
  };

  return (
    <div className="p-2 mt-4 mb-4 rounded-md bg-neutral-900">
      <h4 className="mb-2 font-semibold ">Membros</h4>
      <div className="w-full overflow-x-auto">
        <table className="w-[500px] md:w-[900px] text-[9px] min-[375px]:text-[10px] md:text-sm md:mb-4">
          <thead>
            <tr className="w-full text-left text-gray-400">
              <th className="w-[5%] lg:w-[5%]"> Nº </th>
              <th className="w-[12%] lg:w-[10%]"> Nome </th>
              <th className="w-[15%] lg:w-[13%]"> Função </th>
              <th className="w-[18%] lg:w-[20%]"> Confirmado </th>
              <th className="w-[45%] lg:w-[50%]"> Observação </th>
              <th className="w-[5%] lg:w-[10%]"> Ações </th>
            </tr>
          </thead>
          <tbody>
            {[...membros]
              .sort((a, b) => a.role.localeCompare(b.role))
              .map((membro, i) => (
                <tr key={membro.id} className="border-t border-neutral-800">
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
                    {membro.confirmadopor &&
                    membro.confirmadopor.trim() !== "" ? (
                      <span className="opacity-70 text-[9px] md:text-[12px]">
                        {membro.confirmadopor}
                      </span>
                    ) : (
                      <button
                        className="text-neutral-400 hover:text-blue-300 text-[10px] md:text-sm"
                        onClick={() => confirmarMembro(membro)}
                      >
                        🔘 Confirmar?
                      </button>
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
                          onClick={() => handleEditarClick(membro.id)}
                          className="text-white hover:text-yellow-200"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          onClick={() => handleDeletarClick(membro.id)}
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
                <td colSpan={6} className="italic text-gray-400">
                  Nenhum membro ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
