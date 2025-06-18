// CardMvps.jsx
import React from "react";

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
  return (
    <div
      id={monster.id}
      className="border border-neutral-900 text-white bg-neutral-700 shadow-md shadow-black p-2 rounded-md text-sm flex flex-col items-center text-center lg:w-[220px]"
    >
      <div className="flex flex-row justify-between w-full gap-1 mb-2 lg:flex-col lg:items-center ">
        <div className="flex flex-col items-center w-1/3 lg:w-full ">
          <div className="w-[45px] h-[45px] lg:w-[70px] lg:h-[70px] flex justify-center items-center">
            <img
              src={monster.spriteUrl}
              alt={monster.name}
              className="max-h-[45px] lg:max-h-[70px] w-auto"
            />
          </div>
          <strong className="mt-1">{monster.name}</strong>
          <p className="mt-1 mb-0 opacity-60">{monster.respawn}h</p>
        </div>
        <div className="hidden w-1/12 lg:block" />
        <div className="flex flex-col items-start justify-center w-7/12 gap-1 lg:items-center lg:w-full ">
          <p>
            <strong>Vai nascer às: </strong>
            <br className="hidden lg:flex" />
            {respawnDate} -{" "}
            <span className={isAlive ? "text-white" : "text-green-400"}>
              {respawnTime}h
            </span>
          </p>
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
          <p>
            <strong>Tempo: </strong>
            <br className="hidden lg:flex" />
            <span
              className={`font-bold ${
                isAlive ? "text-white" : "text-green-400"
              }`}
            >
              {timerValue}
            </span>
          </p>
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
          onClick={() => onConfirm(monster)}
          disabled={loading || !inputValue}
          className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-30 hover:scale-110"
        >
          {loading ? "..." : "Atualizar"}
        </button>
        <button
          onClick={() => onQuickUpdate(monster)}
          disabled={loading || !!inputValue}
          className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-50 hover:scale-110"
        >
          {loading ? "..." : "Agora"}
        </button>
      </div>
    </div>
  );
}
