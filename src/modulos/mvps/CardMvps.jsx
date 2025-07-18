import React from "react";
import { toast } from "react-toastify";

export default function CardMvps({
  monster,
  timerValue,
  isAlive,
  respawnDate,
  respawnTime,
  deathDate,
  deathTime,
  apelidoFormatado,
  inputValue,
  onInputChange,
  onConfirm,
  onQuickUpdate,
  loading,
}) {
  const mostrarContagem = timerValue !== "-";
  const role = localStorage.getItem("role");

  return (
    <div
      id={monster.id}
      className="border border-neutral-900 h-fit text-white bg-cards shadow-md shadow-black p-2 rounded-md text-[9px] min-[425px]:text-[12px] sm:text-[14px] flex flex-col items-center text-center lg:w-[220px]"
    >
      <div className="flex flex-row justify-between w-full gap-1 p-2 mb-2 rounded-md bg-neutral-900 lg:flex-col lg:items-center ">
        <div className="flex flex-col items-center w-1/3 lg:w-full ">
          <div className="w-[45px] h-[45px] lg:w-[70px] lg:h-[70px] flex justify-center items-center">
            <img
              src={monster.spriteUrl}
              alt={monster.name}
              className="max-h-[45px] lg:max-h-[70px] w-auto"
            />
          </div>
          <strong className="mt-1 text-center">
            {monster.name.replace(/\s*\(.*?\)/, "")}
          </strong>
          <span className="mt-1 text-[9px] min-[425px]:text-[12px] sm:text-[14px] opacity-60 block">
            {monster.name.match(/\(.*?\)/)
              ? `${monster.name.match(/\(.*?\)/)[0]} - ${monster.respawn}h`
              : `${monster.respawn}h`}
          </span>
        </div>
        <div className="hidden w-1/12 lg:block" />
        <div className="flex flex-col items-start justify-center w-7/12 gap-1 lg:items-center lg:w-full ">
          {mostrarContagem && (
            <p>
              <strong>Vai nascer às: </strong>
              <br className="hidden lg:flex" />
              {respawnDate} -{" "}
              <span className={isAlive ? "text-white" : "text-green-400"}>
                {respawnTime}h
              </span>
            </p>
          )}
          <p>
            <strong>Morreu às: </strong>
            <br className="hidden lg:flex" />
            {deathDate} - {deathTime}h
          </p>
          <p>
            <strong>Atualizado por: </strong>
            <br className="hidden lg:flex" />
            <span
              className={timerValue !== "-" ? "text-green-400" : "text-white"}
            >
              {apelidoFormatado}
            </span>
          </p>
          {mostrarContagem && (
            <p>
              <strong>{isAlive ? "Já nasceu: " : "Tempo: "}</strong>
              <br className="hidden lg:flex" />
              <span
                className={`font-bold ${
                  isAlive ? "text-red-500" : "text-green-400"
                }`}
              >
                {timerValue}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-row justify-center w-full gap-2 mt-2 ">
        <input
          type="datetime-local"
          value={inputValue || ""}
          onChange={(e) => onInputChange(monster.id, e.target.value)}
          onKeyDown={(e) => e.preventDefault()}
          className={`appearance-none w-[20px] h-[30px] overflow-hidden text-transparent caret-transparent bg-white text border border-gray-300 rounded cursor-pointer ${
            inputValue ? "text-black caret-auto" : ""
          }`}
        />
        <button
          onClick={() => {
            if (role === "novato" && "visitante") {
              toast.error("Novatos não podem atualizar o tempo dos mvps.");
              return;
            }
            onConfirm(monster);
          }}
          disabled={loading || !inputValue}
          className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-30 hover:scale-110"
        >
          {loading ? "..." : "Atualizar"}
        </button>
        <button
          onClick={() => {
            if (role === "novato" && "visitante") {
              toast.error("Novatos não podem atualizar o tempo dos mvps.");
              return;
            }
            onQuickUpdate(monster);
          }}
          disabled={loading || !!inputValue}
          className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-50 hover:scale-110"
        >
          {loading ? "..." : "Agora"}
        </button>
      </div>
    </div>
  );
}
