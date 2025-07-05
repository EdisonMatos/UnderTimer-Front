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
    if (userRole === "novato" && "visitante") {
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
    <div className="p-2 mt-4 rounded-lg bg-neutral-900">
      <p className="font-semibold text-[12px] lg:text-[14px]">
        Adicionar membro:
      </p>
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
          className="p-2 text-white border rounded w-[25%] bg-neutral-800 border-gray-700 text-[12px] lg:text-[14px]"
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
          className="p-2 text-white border rounded w-[25%] bg-neutral-800 border-gray-700 text-[12px] lg:text-[14px]"
        />
        <button
          onClick={() => handleAdicionarClick(instanciaId)}
          disabled={
            carregandoMembros[instanciaId] ||
            (!novosMembros[instanciaId]?.name?.trim() &&
              !novosMembros[instanciaId]?.role?.trim())
          }
          className="px-4 py-2 text-white bg-primary hover:scale-105 transition-all rounded w-[36%] disabled:opacity-50 text-[12px] lg:text-[14px]"
        >
          {carregandoMembros[instanciaId] ? "..." : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
