// BuscaMvps.jsx
import React from "react";
import AdicionarMvp from "./AdicionarMvp";

export default function BuscaMvps({ search, setSearch }) {
  return (
    <div>
      <h1 className=" text-[24px] mb-6 font-semibold text-center lg:text-left">
        Times de MVPs e Minibosses
      </h1>
      <div className="w-full p-4 rounded-lg shadow-md mb-14 bg-cards lg:w-fit shadow-black">
        <div className="p-4 rounded-lg bg-neutral-900">
          <h1 className="mt-2 text-xl font-semibold lg:block">Buscar</h1>
          <div className="my-5 mt-5 mb-0 text-center lg:text-left lg:mt-5 lg:mx-0">
            <input
              type="text"
              placeholder="Digite o nome do monstro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:w-[300px] px-3 py-2 text-sm text-black border border-gray-300 rounded bg-neutral-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
