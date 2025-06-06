import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [dateInput, setDateInput] = useState("");
  const [respawnTime] = useState(8); // horas fixas de respawn
  const [spawnTime, setSpawnTime] = useState(""); // data calculada

  const handleConfirm = async () => {
    try {
      const deathDate = new Date(dateInput);
      const calculatedSpawnTime = new Date(deathDate.getTime() + respawnTime * 60 * 60 * 1000);

      await axios.put("https://undertimer-biel.onrender.com/edit", {
        id: "6841e307d20808e98d65122a",
        lastDeath: deathDate.toISOString(),
      });

      setSpawnTime(calculatedSpawnTime.toLocaleString()); // exibe em formato local legível
      console.log("Spawn calculado para:", calculatedSpawnTime);
    } catch (error) {
      console.error("Erro ao fazer a requisição:", error);
    }
  };

  return (
    <div>
      <input
        type="datetime-local"
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
        placeholder="Digite uma data"
      />
      <button onClick={handleConfirm}>Confirmar</button>

      <div>
        Tempo de Respawn:
        <p>8</p>
      </div>

      <div>
        Vai nascer às:
        <p>{spawnTime ? spawnTime : "Hora que vai nascer:"}</p>
      </div>
    </div>
  );
};

export default App;
