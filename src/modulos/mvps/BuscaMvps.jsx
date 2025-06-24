// BuscaMvps.jsx
import React from "react";
import AdicionarMvp from "./AdicionarMvp";

export default function BuscaMvps({ search, setSearch }) {
  return (
    <div className="mb-14">
      <h1 className=" text-[24px] font-semibold text-center lg:text-left">
        Times de MVPs e Minibosses
      </h1>
      <h1 className="hidden mt-2 text-xl font-semibold lg:block">Buscar</h1>
      <div className="my-5 mt-5 mb-0 text-center lg:text-left lg:my-5 lg:mx-0">
        <input
          type="text"
          placeholder="Digite o nome do monstro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[400px] px-3 py-2 text-sm border bg-neutral-300 border-gray-300 rounded text-black"
        />
      </div>
    </div>
  );
}
