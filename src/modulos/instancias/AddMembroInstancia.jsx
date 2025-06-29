import React from "react";
import { toast } from "react-toastify";

export default function AddMembroInstancia({
  instanciaId,
  novosMembros,
  setNovosMembros,
  adicionarMembro,
  carregandoMembros,
  instGerenciadaPor,
  instUpdatedBy,
}) {
  const userRole = localStorage.getItem("role");
  const apelidoUsuario = localStorage.getItem("apelido");

  const handleAdicionarClick = (id) => {
    if (userRole === "novato") {
      toast.error("Você não têm permissão para adicionar membros.");
      return;
    }

    if (
      instGerenciadaPor === "organizador" &&
      apelidoUsuario !== instUpdatedBy
    ) {
      toast.error(
        "Essa instância está configurada para ser gerenciada apenas pelo organizador dela."
      );
      return;
    }

    adicionarMembro(id);
  };

  return (
    <>
      <p className="mt-4 font-semibold">Adicionar membro:</p>
      <div className="flex justify-between gap-2 mt-3">
        <input
          type="text"
          placeholder="Nome"
          value={novosMembros[instanciaId]?.name || ""}
          onChange={(e) =>
            setNovosMembros((prev) => ({
              ...prev,
              [instanciaId]: {
                name: e.target.value,
                role: prev[instanciaId]?.role || "",
              },
            }))
          }
          className="p-2 text-black border rounded w-[25%] bg-neutral-300 border-gray-300"
        />
        <input
          type="text"
          placeholder="Função"
          value={novosMembros[instanciaId]?.role || ""}
          onChange={(e) =>
            setNovosMembros((prev) => ({
              ...prev,
              [instanciaId]: {
                name: prev[instanciaId]?.name || "",
                role: e.target.value,
              },
            }))
          }
          className="p-2 text-black border rounded w-[25%] bg-neutral-300 border-gray-300"
        />
        <button
          onClick={() => handleAdicionarClick(instanciaId)}
          disabled={
            carregandoMembros[instanciaId] ||
            (!novosMembros[instanciaId]?.name?.trim() &&
              !novosMembros[instanciaId]?.role?.trim())
          }
          className="px-4 py-2 text-white bg-primary hover:scale-105 transition-all rounded w-[36%] disabled:opacity-50"
        >
          {carregandoMembros[instanciaId] ? "..." : "Adicionar"}
        </button>
      </div>
    </>
  );
}
