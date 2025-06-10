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
        <h3 className="section-title" style={{ marginTop: "20px" }}>
          {label}
        </h3>

        <div className="cards-container">
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
                className="monster-card"
                style={{ backgroundColor: "#fff" }}
              >
                <div className="visual-section">
                  <div className="left-visual">
                    <img
                      src={monster.spriteUrl}
                      alt={monster.name}
                      width="40"
                      height="40"
                    />
                    <strong className="monster-name">{monster.name}</strong>
                    <p className="respawn-left">{monster.respawn}h</p>
                  </div>
                  <div className="spacer" />
                  <div className="right-visual">
                    <p>
                      <strong>Vai nascer às:</strong>
                      <br />
                      {respawnDate} -{" "}
                      <span style={{ color: isAlive ? "black" : "red" }}>
                        {respawnTime}h
                      </span>
                    </p>
                    <p>
                      <strong>Morreu às:</strong>
                      <br />
                      {deathDate} - {deathTime}h
                    </p>
                    <p
                      style={{
                        color: isAlive ? "black" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      <strong>Tempo:</strong>
                      <br />
                      {timerValue}
                    </p>
                  </div>
                </div>

                <div className="interaction-section">
                  <input
                    type="datetime-local"
                    value={inputValues[monster.id] || ""}
                    onChange={(e) =>
                      handleInputChange(monster.id, e.target.value)
                    }
                    className="datetime-input"
                  />
                  <button
                    className="update-button"
                    onClick={() => handleConfirm(monster)}
                    disabled={loadingIds[monster.id]}
                  >
                    {loadingIds[monster.id] ? "Carregando..." : "Atualizar"}
                  </button>
                </div>
              </div>
            );
          })}
          {sortedMonsters.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
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
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        backgroundColor: "#cfcfcf",
        minHeight: "100vh",
        maxWidth: "1215px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{ textAlign: "center", fontSize: "20px", marginBottom: "4px" }}
      >
        UnderTimer
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          marginTop: 0,
          marginBottom: "2px",
        }}
      >
        Sistema de Controle de Tempos para Ragnarok Online
      </p>
      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
          marginTop: 0,
        }}
      >
        Beta - v0.5
      </p>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
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

      <style>{`
body {
  background-color: #cfcfcf;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.section-title {
  text-align: center;
  margin-top: 20px;
}

@media screen and (min-width: 1024px) {
  .section-title {
    text-align: left;
  }
}

.monster-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  font-size: 13px;
  background-color: #fff;
}

.visual-section {
  display: flex;
  margin-bottom: 8px;
  gap: 4px;
}

.left-visual {
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.monster-name {
  margin-top: 4px;
}

.respawn-left {
  margin-top: 4px;
  margin-bottom: 0;
}

.spacer {
  width: 5%;
}

.right-visual {
  width: 65%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  margin: 0;
}

.right-visual p {
  margin: 2px 0;
}

.interaction-section {
  display: flex;
  gap: 6px;
}

.datetime-input {
  flex: 1;
  font-size: 12px;
  padding: 4px 6px;
}

.update-button {
  flex: 1;
  font-size: 12px;
  padding: 4px 8px;
  cursor: pointer;
}

.search-input {
  padding: 8px;
  width: 100%;
  max-width: 400px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

@media screen and (min-width: 1024px) {
  .cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 12px;
  }

  .monster-card {
    max-width: 200px;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .visual-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .left-visual,
  .right-visual {
    width: 100%;
  }

  .spacer {
    display: none;
  }

  .right-visual p {
    margin: 6px 0;
  }

  .interaction-section {
    flex-direction: row;
    width: 100%;
    justify-content: center;
    gap: 4px;
  }

  .datetime-input,
  .update-button {
    flex: 1;
    width: 50%;
    box-sizing: border-box;
  }
}
`}</style>
    </div>
  );
};

export default App;
