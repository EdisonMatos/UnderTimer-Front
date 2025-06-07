import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [monsters, setMonsters] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [timers, setTimers] = useState({});
  const [loadingIds, setLoadingIds] = useState({});

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
        updatedTimers[monster.id] = "Nasceu";
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
    return respawnDate.toLocaleString();
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        backgroundColor: "#cfcfcf",
        minHeight: "100vh",
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
        Beta - v0.2
      </p>

      <div className="table-container">
        <table className="monster-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Monstro</th>
              <th>Respawn (h)</th>
              <th>Vai nascer às</th>
              <th>Morreu às</th>
              <th>Contagem Regressiva</th>
              <th>Atualizar horário</th>
            </tr>
          </thead>
          <tbody>
            {monsters.map((monster) => {
              const timerValue = timers[monster.id] || "—";
              const isAlive = timerValue === "Nasceu";

              let fullRespawn = monster.lastDeath
                ? calculateRespawnTime(monster.lastDeath, monster.respawn)
                : "—";

              let respawnDatePart = "—";
              let respawnTimePart = "";

              if (fullRespawn !== "—") {
                const [datePart, timePart] = fullRespawn.split(", ");
                respawnDatePart = datePart;
                respawnTimePart = timePart || "";
              }

              return (
                <tr key={monster.id}>
                  <td>
                    <img
                      src={monster.spriteUrl}
                      alt={monster.name}
                      width="40"
                      height="40"
                    />
                  </td>
                  <td>{monster.name}</td>
                  <td>{monster.respawn}</td>
                  <td>
                    {respawnDatePart}{" "}
                    <span style={{ color: isAlive ? "black" : "red" }}>
                      {respawnTimePart}
                    </span>
                  </td>
                  <td>
                    {monster.lastDeath
                      ? new Date(monster.lastDeath).toLocaleString()
                      : "—"}
                  </td>
                  <td
                    style={{
                      color: isAlive ? "black" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {timerValue}
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={inputValues[monster.id] || ""}
                      onChange={(e) =>
                        handleInputChange(monster.id, e.target.value)
                      }
                    />
                    <button
                      style={{ marginLeft: "5px" }}
                      onClick={() => handleConfirm(monster)}
                      disabled={loadingIds[monster.id]}
                    >
                      {loadingIds[monster.id] ? "Carregando..." : "Atualizar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="cards-container">
          {monsters.map((monster) => {
            const timerValue = timers[monster.id] || "—";
            const isAlive = timerValue === "Nasceu";

            let fullRespawn = monster.lastDeath
              ? calculateRespawnTime(monster.lastDeath, monster.respawn)
              : "—";

            let respawnDatePart = "—";
            let respawnTimePart = "";

            if (fullRespawn !== "—") {
              const [datePart, timePart] = fullRespawn.split(", ");
              respawnDatePart = datePart;
              respawnTimePart = timePart || "";
            }

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
                      <strong>Vai nascer às:</strong> {respawnDatePart}{" "}
                      <span style={{ color: isAlive ? "black" : "red" }}>
                        {respawnTimePart}
                      </span>
                    </p>
                    <p>
                      <strong>Morreu às:</strong>{" "}
                      {monster.lastDeath
                        ? new Date(monster.lastDeath).toLocaleString()
                        : "—"}
                    </p>
                    <p
                      style={{
                        color: isAlive ? "black" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      <strong>Tempo:</strong> {timerValue}
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
        </div>
      </div>

      <style>{`
        .table-container {
          width: 100%;
        }

        .monster-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          background-color: #fff;
        }

        .monster-table th,
        .monster-table td {
          border: 1px solid #ccc;
          padding: 6px;
        }

        .cards-container {
          display: none;
        }

        .monster-card {
          border: 1px solid #ccc;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 6px;
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .monster-table {
            display: none;
          }

          .cards-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }

          .monster-card {
            font-size: 12px;
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
        }

        @media (max-width: 500px) {
          .cards-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
