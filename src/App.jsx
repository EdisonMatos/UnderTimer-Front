import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [monsters, setMonsters] = useState([]);
  const [inputValues, setInputValues] = useState({});

  // Busca os dados da API ao carregar
  useEffect(() => {
    fetchMonsters();
  }, []);

  const fetchMonsters = async () => {
    try {
      const response = await axios.get("https://undertimer-biel.onrender.com/");
      setMonsters(response.data);
    } catch (error) {
      console.error("Erro ao buscar monstros:", error);
    }
  };

  const handleInputChange = (id, value) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleConfirm = async (monster) => {
    const newDate = new Date(inputValues[monster.id]);

    try {
      // Atualiza no backend
      await axios.put("https://undertimer-biel.onrender.com/edit", {
        id: monster.id,
        lastDeath: newDate.toISOString(),
      });

      // Atualiza no estado local para refletir na tabela
      setMonsters((prev) =>
        prev.map((m) =>
          m.id === monster.id ? { ...m, lastDeath: newDate.toISOString() } : m
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar o horário:", error);
    }
  };

  const calculateRespawnTime = (lastDeath, hours) => {
    const deathDate = new Date(lastDeath);
    const respawnDate = new Date(deathDate.getTime() + hours * 60 * 60 * 1000);
    return respawnDate.toLocaleString();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Lista de Respawns</h2>
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Monstro</th>
            <th>Respawn (h)</th>
            <th>Morreu às</th>
            <th>Vai nascer às</th>
            <th>Atualizar horário</th>
          </tr>
        </thead>
        <tbody>
          {monsters.map((monster) => (
            <tr key={monster.id}>
              <td>
                <img src={monster.spriteUrl} alt={monster.name} width="50" />
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
                >
                  Confirmar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
