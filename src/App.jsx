import React, { useEffect, useState } from "react";
import axios from "axios";
import rapaz from "./rapaz.mp3"; // <- Import do áudio aqui

const App = () => {
  const [monsters, setMonsters] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [timers, setTimers] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMonsters();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [monsters]);

  const fetchMonsters = async () => {
    try {
      const response = await axios.get("https://undertimer-biel.onrender.com/");
      setMonsters(response.data);
    } catch (error) {
      console.error("Erro ao buscar monstros:", error);
    }
  };

  const updateCountdowns = () => {
    const updatedTimers = {};
    monsters.forEach((monster) => {
      if (!monster.lastDeath) return;

      const lastDeath = new Date(monster.lastDeath);
      const respawnTime = new Date(
        lastDeath.getTime() + monster.respawn * 60 * 60 * 1000
      );
      const diff = respawnTime - new Date();

      if (diff <= 0) {
        updatedTimers[monster.id] = "-";
      } else {
        const secondsLeft = Math.floor(diff / 1000);
        if (secondsLeft === 1) {
          const audio = new Audio(rapaz); // <- usa o importado
          audio
            .play()
            .catch((e) => console.error("Erro ao reproduzir som:", e));
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        updatedTimers[monster.id] = `${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    });

    setTimers(updatedTimers);
  };

  const handleInputChange = (id, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleConfirm = async (monster) => {
    const newDate = new Date(inputValues[monster.id]);

    if (newDate > new Date()) {
      alert(
        "A data/hora que você inseriu está errada.\nInsira apenas datas no passado.\n\nExplicação: Como o sistema atualiza baseado na morte do monstro que já aconteceu, é impossível a morte ter acontecido no futuro."
      );
      return;
    }

    setLoadingIds((prev) => ({ ...prev, [monster.id]: true }));

    try {
      await axios.put("https://undertimer-biel.onrender.com/edit", {
        id: monster.id,
        lastDeath: newDate.toISOString(),
      });

      setMonsters((prev) =>
        prev.map((m) =>
          m.id === monster.id ? { ...m, lastDeath: newDate.toISOString() } : m
        )
      );

      alert("Atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar o horário:", error);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [monster.id]: false }));
    }
  };

  const calculateRespawnTime = (lastDeath, hours) => {
    const deathDate = new Date(lastDeath);
    const respawnDate = new Date(deathDate.getTime() + hours * 60 * 60 * 1000);
    return respawnDate;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return [`${day}/${month}`, `${hours}:${minutes}`];
  };

  const renderCardsOnly = (filteredMonsters, label) => {
    const parseTime = (t) => {
      if (!t || t === "-") return Infinity;
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const sortedMonsters = [...filteredMonsters].sort((a, b) => {
      const timeA = parseTime(timers[a.id]);
      const timeB = parseTime(timers[b.id]);
      return timeA - timeB;
    });

    return (
      <>
        <h3 className="mt-5 mb-5 text-lg font-semibold text-center text-white lg:text-left">
          {label}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-start">
          {sortedMonsters.map((monster) => {
            const timerValue = timers[monster.id] || "—";
            const isAlive = timerValue === "-";

            let fullRespawnDate = monster.lastDeath
              ? calculateRespawnTime(monster.lastDeath, monster.respawn)
              : null;

            const [respawnDate, respawnTime] = fullRespawnDate
              ? formatDate(fullRespawnDate)
              : ["—", ""];

            const [deathDate, deathTime] = monster.lastDeath
              ? formatDate(monster.lastDeath)
              : ["—", ""];

            return (
              <div
                key={monster.id}
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
                      <span
                        className={isAlive ? "text-white" : "text-green-400"}
                      >
                        {respawnTime}h
                      </span>
                    </p>
                    <p>
                      <strong>Morreu às: </strong>
                      <br className="hidden lg:flex" />
                      {deathDate} - {deathTime}h
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
                    value={inputValues[monster.id] || ""}
                    onChange={(e) =>
                      handleInputChange(monster.id, e.target.value)
                    }
                    onKeyDown={(e) => e.preventDefault()}
                    className={`appearance-none w-[20px] h-[30px] overflow-hidden text-transparent caret-transparent bg-white text
    border border-gray-300 rounded cursor-pointer
    ${inputValues[monster.id] ? "text-black caret-auto" : ""}
  `}
                  />
                  <button
                    onClick={() => handleConfirm(monster)}
                    disabled={
                      loadingIds[monster.id] || !inputValues[monster.id]
                    }
                    className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-30 hover:scale-110"
                  >
                    {loadingIds[monster.id] ? "..." : "Atualizar"}
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date().toISOString();
                      setLoadingIds((prev) => ({
                        ...prev,
                        [monster.id]: true,
                      }));

                      axios
                        .put("https://undertimer-biel.onrender.com/edit", {
                          id: monster.id,
                          lastDeath: now,
                        })
                        .then(() => {
                          setMonsters((prev) =>
                            prev.map((m) =>
                              m.id === monster.id ? { ...m, lastDeath: now } : m
                            )
                          );
                          alert("Atualizado com sucesso");
                        })
                        .catch((error) => {
                          console.error("Erro ao atualizar o horário:", error);
                        })
                        .finally(() => {
                          setLoadingIds((prev) => ({
                            ...prev,
                            [monster.id]: false,
                          }));
                        });
                    }}
                    disabled={
                      loadingIds[monster.id] || !!inputValues[monster.id]
                    }
                    className="flex-1 px-2 py-1 text-sm text-white transition-all rounded bg-primary disabled:opacity-50 hover:scale-110"
                  >
                    {loadingIds[monster.id] ? "..." : "Agora"}
                  </button>
                </div>
              </div>
            );
          })}
          {sortedMonsters.length === 0 && (
            <p className="mt-5 text-center">
              A pesquisa não localizou nada com os dados informados. Verifique.
            </p>
          )}
        </div>
      </>
    );
  };

  const monstersS = monsters.filter((m) => m.tier === "S");
  const monstersA = monsters.filter((m) => m.tier === "A");
  const minibosses = monsters.filter((m) => m.type === "Miniboss");

  const filteredSearchResults =
    search.trim() === ""
      ? []
      : monsters.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="max-w-[1215px] mx-auto px-5 py-5 font-sans text-white flex flex-col">
      <h2 className="mb-1 text-lg text-center lg:text-left">UnderTimer</h2>
      <p className="mt-0 mb-0 text-sm text-center lg:text-left">
        Sistema de Controle de Tempos para Ragnarok Online
      </p>
      <p className="mt-0 text-xs text-center text-white opacity-50 lg:text-left">
        Beta - v0.8 (em desenvolvimento)
      </p>
      <h1 className="hidden mt-10 text-xl font-semibold lg:block">Buscar</h1>
      <div className="my-5 mt-5 mb-0 text-center lg:text-left lg:my-5 lg:mx-0">
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[400px] px-3 py-2 text-sm border bg-neutral-300 border-gray-300 rounded text-black"
        />
      </div>

      {search.trim() !== "" ? (
        renderCardsOnly(filteredSearchResults, "Resultado da busca")
      ) : (
        <>
          {renderCardsOnly(monstersS, "MVPs Tier S")}
          {renderCardsOnly(monstersA, "MVPs Tier A")}
          {renderCardsOnly(minibosses, "Miniboss")}
        </>
      )}
    </div>
  );
};

export default App;
