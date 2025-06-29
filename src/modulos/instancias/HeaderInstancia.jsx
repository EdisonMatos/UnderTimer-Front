import React from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function HeaderInstancia({
  inst,
  editandoInstancia,
  setEditandoInstancia,
  instanciaEditada,
  setInstanciaEditada,
  editarInstanciaConfirmar,
  deletarInstancia,
  contagemRegressiva,
}) {
  const userRole = localStorage.getItem("role");

  const handleEditarClick = () => {
    if (userRole === "novato") {
      toast.error("Novatos não têm permissão para editar instâncias.");
      return;
    }
    setEditandoInstancia((prev) => ({
      ...prev,
      [inst.id]: true,
    }));
  };

  const handleDeletarClick = () => {
    if (userRole === "novato") {
      toast.error("Você não têm permissão para excluir eventos ou instâncias.");
      return;
    }
    deletarInstancia(inst.id);
  };

  const handleConfirmarEdicao = () => {
    const nome = instanciaEditada[inst.id]?.name ?? inst.name;
    if (!nome.trim()) {
      toast.error("O nome da instância não pode ficar em branco.");
      return;
    }
    editarInstanciaConfirmar(inst);
  };

  return (
    <div className="flex flex-row items-center justify-between p-2 mb-3 rounded-md bg-neutral-900">
      <div className="w-[15%]  flex justify-center">
        <img
          src={inst.spriteUrl}
          alt={inst.name}
          className="max-w-16 max-h-[80px]"
        />
      </div>
      <div className="w-[60%]">
        {editandoInstancia[inst.id] ? (
          <>
            <input
              type="text"
              value={
                instanciaEditada[inst.id]?.name !== undefined
                  ? instanciaEditada[inst.id].name
                  : inst.name
              }
              onChange={(e) =>
                setInstanciaEditada((prev) => ({
                  ...prev,
                  [inst.id]: {
                    ...prev[inst.id],
                    name: e.target.value,
                  },
                }))
              }
              className="w-full h-8 p-1 mb-1 text-black rounded"
            />
            <input
              type="text"
              placeholder="Sprite URL"
              value={
                instanciaEditada[inst.id]?.spriteUrl !== undefined
                  ? instanciaEditada[inst.id].spriteUrl
                  : inst.spriteUrl
              }
              onChange={(e) =>
                setInstanciaEditada((prev) => ({
                  ...prev,
                  [inst.id]: {
                    ...prev[inst.id],
                    spriteUrl: e.target.value,
                  },
                }))
              }
              className="w-full h-8 p-1 mb-1 text-black rounded"
            />
            <input
              type="datetime-local"
              value={
                instanciaEditada[inst.id]?.last !== undefined
                  ? instanciaEditada[inst.id].last
                  : ""
              }
              onChange={(e) =>
                setInstanciaEditada((prev) => ({
                  ...prev,
                  [inst.id]: {
                    ...prev[inst.id],
                    last: e.target.value,
                  },
                }))
              }
              className="w-full h-8 p-1 text-black rounded"
            />
            <input
              type="text"
              placeholder="Observações"
              value={
                instanciaEditada[inst.id]?.observacoes !== undefined
                  ? instanciaEditada[inst.id].observacoes
                  : inst.observacoes || ""
              }
              onChange={(e) =>
                setInstanciaEditada((prev) => ({
                  ...prev,
                  [inst.id]: {
                    ...prev[inst.id],
                    observacoes: e.target.value,
                  },
                }))
              }
              className="w-full h-8 p-1 mt-1 text-black rounded"
            />
            <select
              value={
                instanciaEditada[inst.id]?.gerenciadapor !== undefined
                  ? instanciaEditada[inst.id].gerenciadapor
                  : inst.gerenciadapor
              }
              onChange={(e) =>
                setInstanciaEditada((prev) => ({
                  ...prev,
                  [inst.id]: {
                    ...prev[inst.id],
                    gerenciadapor: e.target.value,
                  },
                }))
              }
              className="w-full h-8 p-1 mt-1 text-black rounded"
            >
              <option value="organizador">Organizador</option>
              <option value="todos">Todos</option>
            </select>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">{inst.name}</h3>
            <p className="text-sm opacity-70">
              Data: {new Date(inst.last).toLocaleString()} - Tempo:{" "}
              <span
                className={
                  contagemRegressiva[inst.id] !== "-" ? "text-green-400" : ""
                }
              >
                {contagemRegressiva[inst.id] || "-"}
              </span>
            </p>
          </>
        )}
        <div className="flex flex-col lg:gap-2 lg:flex-row">
          <p className="text-sm opacity-70">
            Organizada por:{" "}
            <span className="text-green-400">
              {inst.updatedby
                ? inst.updatedby.charAt(0).toUpperCase() +
                  inst.updatedby.slice(1)
                : "-"}
            </span>
          </p>
          <p className="text-sm opacity-70">
            Gerenciada por:{" "}
            <span className="text-green-400">
              {inst.gerenciadapor === "organizador"
                ? "Organizador"
                : inst.gerenciadapor === "todos"
                ? "Todos"
                : "-"}
            </span>
          </p>
        </div>
        {!editandoInstancia[inst.id] && (
          <p className="text-sm opacity-70">
            Aviso:{" "}
            <span className="opacity-70">{inst.observacoes || "Nenhum"}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col justify-center items-center  w-[15%]">
        <h2 className="mb-2 opacity-50">Ações</h2>
        <div className="flex items-center justify-center h-12 ">
          <div className="flex gap-3">
            {editandoInstancia[inst.id] ? (
              <>
                <button
                  onClick={handleConfirmarEdicao}
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
                  onClick={handleEditarClick}
                  className="text-white hover:text-yellow-200"
                >
                  <FaPencilAlt />
                </button>
                <button
                  onClick={handleDeletarClick}
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
  );
}
