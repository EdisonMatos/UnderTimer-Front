import React from "react";

export default function CriarInstancia({
  novaInstancia,
  setNovaInstancia,
  usarImagemPersonalizada,
  setUsarImagemPersonalizada,
  adicionarInstancia,
  carregandoNovaInstancia,
}) {
  return (
    <>
      <h2 className="mb-2 text-lg font-semibold text-white">
        Criar nova instância ou evento
      </h2>
      <div className="flex flex-col gap-2 mb-6 sm:flex-row">
        <input
          type="text"
          placeholder="Nome da instância"
          value={novaInstancia.name}
          onChange={(e) =>
            setNovaInstancia((prev) => ({ ...prev, name: e.target.value }))
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />

        <select
          value={usarImagemPersonalizada ? "personalizada" : "padrao"}
          onChange={(e) => {
            const valor = e.target.value;
            if (valor === "padrao") {
              setUsarImagemPersonalizada(false);
              setNovaInstancia((prev) => ({
                ...prev,
                spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png",
              }));
            } else {
              setUsarImagemPersonalizada(true);
              setNovaInstancia((prev) => ({
                ...prev,
                spriteUrl: "",
              }));
            }
          }}
          className="p-2 text-black border lg:w-[230px] border-gray-300 rounded bg-neutral-300"
        >
          <option value="padrao">Imagem padrão</option>
          <option value="personalizada">Imagem personalizada</option>
        </select>

        {usarImagemPersonalizada && (
          <input
            type="text"
            placeholder="URL da imagem (https://...)"
            value={novaInstancia.spriteUrl}
            onChange={(e) =>
              setNovaInstancia((prev) => ({
                ...prev,
                spriteUrl: e.target.value,
              }))
            }
            className="p-2 text-black border border-gray-300 rounded bg-neutral-300 lg:w-[230px]"
          />
        )}

        <input
          type="datetime-local"
          value={novaInstancia.last}
          onChange={(e) =>
            setNovaInstancia((prev) => ({ ...prev, last: e.target.value }))
          }
          className="p-2 text-black border border-gray-300 rounded bg-neutral-300"
        />
        <button
          onClick={adicionarInstancia}
          disabled={
            carregandoNovaInstancia ||
            !novaInstancia.name.trim() ||
            !novaInstancia.spriteUrl.trim() ||
            !novaInstancia.last.trim()
          }
          className="px-4 py-2 text-white transition-all rounded bg-primary hover:scale-105 disabled:opacity-50"
        >
          {carregandoNovaInstancia ? "..." : "Adicionar"}
        </button>
      </div>
      {usarImagemPersonalizada && (
        <p className="mb-2 text-left text-[12px] opacity-70">
          Sobre o Imagem Personalizada: Adicione a url (https://...) da imagem
          desejada. Para conseguir a url de uma imagem, clique com botão direito
          em qualquer imagem que esteja na internet e clique em "Copiar endereço
          da imagem".
        </p>
      )}
    </>
  );
}
