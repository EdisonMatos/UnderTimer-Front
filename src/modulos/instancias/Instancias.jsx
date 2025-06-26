import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InstanciaHeader from "./InstanciaHeader";
import InstanciasTabela from "./InstanciasTabela";

export default function Instancias() {
  const [instancias, setInstancias] = useState([]);
  const [novaInstancia, setNovaInstancia] = useState({
    name: "",
    spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png",
    last: "",
  });
  const [usarImagemPersonalizada, setUsarImagemPersonalizada] = useState(false);
  const [carregandoNovaInstancia, setCarregandoNovaInstancia] = useState(false);
  const [carregandoMembros, setCarregandoMembros] = useState({});
  const [novosMembros, setNovosMembros] = useState({});
  const [editandoMembro, setEditandoMembro] = useState({});
  const [editandoInstancia, setEditandoInstancia] = useState({});
  const [instanciaEditada, setInstanciaEditada] = useState({});
  const [contagemRegressiva, setContagemRegressiva] = useState({});
  const [mostrarAdicionarMembro, setMostrarAdicionarMembro] = useState({});
  const [mostrarLoot, setMostrarLoot] = useState({});

  const guildId = localStorage.getItem("guildId");

  useEffect(() => {
    buscarInstancias();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = Date.now();
      const novosTempos = {};
      instancias.forEach((inst) => {
        const target = new Date(inst.last).getTime();
        const distancia = target - agora;
        if (distancia <= 0) {
          novosTempos[inst.id] = "-";
        } else {
          const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
          const horas = Math.floor(
            (distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutos = Math.floor(
            (distancia % (1000 * 60 * 60)) / (1000 * 60)
          );
          const segundos = Math.floor((distancia % (1000 * 60)) / 1000);
          const f = (n) => (n < 10 ? "0" + n : n);
          novosTempos[inst.id] = `${dias}d ${f(horas)}:${f(minutos)}:${f(
            segundos
          )}`;
        }
      });
      setContagemRegressiva(novosTempos);
    }, 1000);

    return () => clearInterval(interval);
  }, [instancias]);

  const buscarInstancias = async () => {
    try {
      const res = await axios.get(
        "https://undertimer-biel.onrender.com/instancias"
      );
      setInstancias(res.data);
    } catch (err) {
      console.error("Erro ao buscar instâncias:", err);
    }
  };

  const adicionarInstancia = async () => {
    try {
      setCarregandoNovaInstancia(true);
      const guildId = localStorage.getItem("guildId");
      const updatedby = localStorage.getItem("apelido");

      if (!guildId) {
        toast.error("Guild ID não encontrado. Faça login novamente.");
        return;
      }

      const payload = {
        name: novaInstancia.name,
        spriteUrl: novaInstancia.spriteUrl,
        last: new Date(novaInstancia.last).toISOString(),
        guildId,
        updatedby,
      };

      await axios.post(
        "https://undertimer-biel.onrender.com/instancias",
        payload
      );
      toast.success("Instância adicionada com sucesso");
      setNovaInstancia({
        name: "",
        spriteUrl: "https://game.ragnaplace.com/ro/job/1133/0.png",
        last: "",
      });
      setUsarImagemPersonalizada(false);
      buscarInstancias();
    } catch (err) {
      toast.error("Erro ao adicionar instância.");
      console.error(err);
    } finally {
      setCarregandoNovaInstancia(false);
    }
  };

  const instanciasFiltradas = instancias.filter(
    (inst) => inst.guildId === guildId
  );

  return (
    <div className="mt-32">
      <InstanciaHeader
        novaInstancia={novaInstancia}
        setNovaInstancia={setNovaInstancia}
        usarImagemPersonalizada={usarImagemPersonalizada}
        setUsarImagemPersonalizada={setUsarImagemPersonalizada}
        adicionarInstancia={adicionarInstancia}
        carregandoNovaInstancia={carregandoNovaInstancia}
      />

      <h2 className="mb-2 text-lg font-semibold text-white mt-14">
        Instâncias ativas
      </h2>

      <div className="flex flex-wrap gap-4">
        {[...instanciasFiltradas]
          .sort((a, b) => {
            const now = Date.now();
            const timeA = new Date(a.last).getTime();
            const timeB = new Date(b.last).getTime();
            const isAFut = timeA > now;
            const isBFut = timeB > now;

            if (isAFut && !isBFut) return -1;
            if (!isAFut && isBFut) return 1;
            return timeA - timeB;
          })
          .map((inst) => (
            <InstanciasTabela
              key={inst.id}
              inst={inst}
              contagemRegressiva={contagemRegressiva}
              buscarInstancias={buscarInstancias}
              editandoInstancia={editandoInstancia}
              setEditandoInstancia={setEditandoInstancia}
              instanciaEditada={instanciaEditada}
              setInstanciaEditada={setInstanciaEditada}
              mostrarAdicionarMembro={mostrarAdicionarMembro}
              setMostrarAdicionarMembro={setMostrarAdicionarMembro}
              mostrarLoot={mostrarLoot}
              setMostrarLoot={setMostrarLoot}
              novosMembros={novosMembros}
              setNovosMembros={setNovosMembros}
              carregandoMembros={carregandoMembros}
              setCarregandoMembros={setCarregandoMembros}
              editandoMembro={editandoMembro}
              setEditandoMembro={setEditandoMembro}
            />
          ))}
      </div>
    </div>
  );
}
