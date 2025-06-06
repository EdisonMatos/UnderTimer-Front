import React, { useState } from "react";
import axios from "axios";

const App = () => {
  // Estado para armazenar o nome digitado
  const [name, setName] = useState("");

  // Função chamada ao clicar no botão
  const handleConfirm = async () => {
    try {
      const payload = {
        id: "6841e307d20808e98d65122a", // ID fixo, conforme o enunciado
        name: name, // Nome inserido no input
      };

      // Requisição PUT usando Axios
      const response = await axios.put(
        "https://undertimer-biel.onrender.com/edit",
        payload
      );
      alert("Atualizado com sucesso!");
      console.log("Requisição bem-sucedida:", response.data);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Digite um Nome"
        value={name}
        onChange={(e) => setName(e.target.value)} // Atualiza o estado com o valor do input
      />
      <button onClick={handleConfirm}>Confirmar</button>
    </div>
  );
};

export default App;
