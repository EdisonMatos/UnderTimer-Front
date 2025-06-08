import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [monsters, setMonsters] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [timers, setTimers] = useState({});
  const [loadingButtons, setLoadingButtons] = useState({}); // <- ADICIONADO

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
        updatedTimers[monster.id] = "Já nasceu";
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
    setLoadingButtons((prev) => ({ ...prev, [monster.id]: true }));

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
      setLoadingButtons((prev) => ({ ...prev, [monster.id]: false }));
    }
  };

  const calculateRespawnTime = (lastDeath, hours) => {
    const deathDate = new Date(lastDeath);
    const respawnDate = new Date(deathDate.getTime() + hours * 60 * 60 * 1000);
    return respawnDate.toLocaleString();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center", fontSize: "18px" }}>
        Lista de Respawns
      </h2>

      <div className="table-container">
        <table className="monster-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Monstro</th>
              <th>Respawn (h)</th>
              <th>Morreu às</th>
              <th>Vai nascer às</th>
              <th>Contagem Regressiva</th>
              <th>Atualizar horário</th>
            </tr>
          </thead>
          <tbody>
            {monsters.map((monster) => (
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
                  {monster.lastDeath
                    ? new Date(monster.lastDeath).toLocaleString()
                    : "—"}
                </td>
                <td>
                  {monster.lastDeath
                    ? calculateRespawnTime(monster.lastDeath, monster.respawn)
                    : "—"}
                </td>
                <td style={{ color: "red", fontWeight: "bold" }}>
                  {timers[monster.id] || "—"}
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
                    disabled={loadingButtons[monster.id]}
                  >
                    {loadingButtons[monster.id] ? "Aguarde…" : "Atualizar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cards-container">
          {monsters.map((monster) => (
            <div key={monster.id} className="monster-card">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <img
                  src={monster.spriteUrl}
                  alt={monster.name}
                  width="40"
                  height="40"
                />
                <strong style={{ fontSize: "14px" }}>{monster.name}</strong>
              </div>
              <p>
                <strong>Respawn:</strong> {monster.respawn}h
              </p>
              <p>
                <strong>Morreu às:</strong>{" "}
                {monster.lastDeath
                  ? new Date(monster.lastDeath).toLocaleString()
                  : "—"}
              </p>
              <p>
                <strong>Vai nascer às:</strong>{" "}
                {monster.lastDeath
                  ? calculateRespawnTime(monster.lastDeath, monster.respawn)
                  : "—"}
              </p>
              <p style={{ color: "red", fontWeight: "bold" }}>
                <strong>Contagem Regressiva:</strong>{" "}
                {timers[monster.id] || "—"}
              </p>
              <div>
                <input
                  type="datetime-local"
                  value={inputValues[monster.id] || ""}
                  onChange={(e) =>
                    handleInputChange(monster.id, e.target.value)
                  }
                  style={{ fontSize: "12px", width: "100%" }}
                />
                <button
                  style={{
                    marginTop: "5px",
                    fontSize: "12px",
                    padding: "4px 8px",
                    width: "100%",
                  }}
                  onClick={() => handleConfirm(monster)}
                  disabled={loadingButtons[monster.id]}
                >
                  {loadingButtons[monster.id] ? "Aguarde…" : "Atualizar"}
                </button>
              </div>
            </div>
          ))}
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
