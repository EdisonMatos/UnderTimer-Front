import React from "react";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

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
  return (
    <div className="flex flex-row items-center justify-between mb-3 ">
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
              value={instanciaEditada[inst.id]?.spriteUrl || inst.spriteUrl}
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
                instanciaEditada[inst.id]?.last ||
                new Date(inst.last).toISOString().slice(0, 16)
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
        <p className="text-sm opacity-70">
          Criada por:{" "}
          <span className="text-green-400">
            {inst.updatedby
              ? inst.updatedby.charAt(0).toUpperCase() + inst.updatedby.slice(1)
              : "-"}
          </span>
        </p>
      </div>
      <div className="flex flex-col  w-[15%]">
        <h2 className="mb-2 opacity-50">Ações</h2>
        <div className="flex items-center justify-center h-12 ">
          <div className="flex gap-3">
            {editandoInstancia[inst.id] ? (
              <>
                <button
                  onClick={() => editarInstanciaConfirmar(inst)}
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
                  onClick={() => deletarInstancia(inst.id)}
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
