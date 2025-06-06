import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [dateInput, setDateInput] = useState("");

  const handleConfirm = async () => {
    try {
      const response = await axios.put("https://undertimer-biel.onrender.com/edit", {
        id: "6841e307d20808e98d65122a",
        lastDeath: new Date(dateInput).toISOString(),
      });
      console.log("Resposta da API:", response.data);
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
    </div>
  );
};

export default App;
