import React, { useEffect, useState } from "react";
import axios from "axios";

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
        <h3 className="text-white text-center lg:text-left mt-5 text-lg font-semibold">
          {label}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-start gap-3">
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
                className="border border-neutral-900 text-white bg-neutral-600 shadow-sm shadow-neutral-900 p-2 rounded-md text-sm flex flex-col items-center text-center lg:w-[220px]"
              >
                <div className="flex flex-row gap-1 mb-2 lg:flex-col lg:items-center">
                  <div className="flex flex-col items-center w-1/3 lg:w-full">
                    <div className="w-[70px] h-[70px] flex justify-center items-center">
                      <img
                        src={monster.spriteUrl}
                        alt={monster.name}
                        className="max-h-[70px] w-auto"
                      />
                    </div>
                    <strong className="mt-1">{monster.name}</strong>
                    <p className="mt-1 mb-0 opacity-60">{monster.respawn}h</p>
                  </div>
                  <div className="w-1/12 hidden lg:block" />
                  <div className="flex flex-col justify-center gap-1 w-7/12 lg:w-full">
                    <p>
                      <strong>Vai nascer às:</strong>
                      <br />
                      {respawnDate} -{" "}
                      <span className={isAlive ? "text-white" : "text-red-300"}>
                        {respawnTime}h
                      </span>
                    </p>
                    <p>
                      <strong>Morreu às:</strong>
                      <br />
                      {deathDate} - {deathTime}h
                    </p>
                    <p
                      className={`font-bold ${
                        isAlive ? "text-white" : "text-red-300"
                      }`}
                    >
                      <strong>Tempo:</strong>
                      <br />
                      {timerValue}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row gap-2 w-full mt-2 justify-center">
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
                    className="text-sm px-2 py-1 flex-1 rounded bg-primary text-white disabled:opacity-30"
                  >
                    {loadingIds[monster.id] ? "Carregando..." : "Atualizar"}
                  </button>
                </div>
                <div className="flex flex-row gap-2 w-full mt-1 justify-center">
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
                    className="text-sm px-2 py-1 flex-1 rounded bg-primary text-white disabled:opacity-50"
                  >
                    {loadingIds[monster.id] ? "Carregando..." : "Morreu agora"}
                  </button>
                </div>
              </div>
            );
          })}
          {sortedMonsters.length === 0 && (
            <p className="text-center mt-5">
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
    <div className="max-w-[1215px] mx-auto px-5 py-5 font-sans text-white">
      <h2 className="text-center text-lg mb-1">UnderTimer</h2>
      <p className="text-center text-sm mt-0 mb-0">
        Sistema de Controle de Tempos para Ragnarok Online
      </p>
      <p className="text-center text-xs text-white opacity-50 mt-0">
        Beta - v0.8
      </p>

      <div className="text-left mx-5 my-5 lg:my-5 lg:mx-0">
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[400px] px-3 py-2 text-sm border border-gray-300 rounded text-black"
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
