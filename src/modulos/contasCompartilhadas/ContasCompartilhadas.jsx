import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCopy,
} from "react-icons/fa";

const API_URL = "https://undertimer-biel.onrender.com/contascompartilhadas";

export default function ContasCompartilhadas() {
  const [contas, setContas] = useState([]);
  const [novaConta, setNovaConta] = useState({
    descricao: "",
    usuario: "",
    senha: "",
    situacaoespecial: "",
    observacao: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [senhaVisivel, setSenhaVisivel] = useState({});

  const guildId = localStorage.getItem("guildId");

  const buscarContas = async () => {
    try {
      const res = await axios.get(API_URL);
      setContas(res.data);
    } catch (err) {
      toast.error("Erro ao buscar contas");
    }
  };

  useEffect(() => {
    buscarContas();
  }, []);

  const criarConta = async () => {
    const camposVazios = Object.values(novaConta).some(
      (valor) => !valor.trim()
    );
    if (camposVazios) {
      toast.error("Preencha todos os campos antes de criar.");
      return;
    }

    try {
      const res = await axios.post(API_URL, { ...novaConta, guildId });
      toast.success("Conta criada");
      setNovaConta({
        descricao: "",
        usuario: "",
        senha: "",
        situacaoespecial: "",
        observacao: "",
      });
      buscarContas();
    } catch (err) {
      toast.error("Erro ao criar conta");
    }
  };

  const deletarConta = async (id) => {
    if (!confirm("Deseja realmente excluir?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Conta deletada");
      buscarContas();
    } catch {
      toast.error("Erro ao deletar conta");
    }
  };

  const salvarEdicao = async (id, dados) => {
    try {
      await axios.put(`${API_URL}/${id}`, dados);
      toast.success("Conta atualizada");
      setEditandoId(null);
      buscarContas();
    } catch {
      toast.error("Erro ao atualizar conta");
    }
  };

  const handleChange = (e, setFunc) => {
    const { name, value } = e.target;
    setFunc((prev) => ({ ...prev, [name]: value }));
  };

  const copiarTexto = (texto) => {
    navigator.clipboard.writeText(texto);
    toast.success("Copiado para a área de transferência");
  };

  return (
    <div className="flex flex-col gap-8 text-white mb-14">
      <h1 className=" text-[24px] font-semibold text-center lg:text-left">
        Contas da Guild
      </h1>
      <h1 className="hidden mt-2 text-[16px] font-semibold lg:block">
        Adicionar conta
      </h1>
      <div className="flex flex-col gap-2 w-full max-w-[200px]">
        <input
          name="descricao"
          placeholder="Descrição"
          value={novaConta.descricao}
          onChange={(e) => handleChange(e, setNovaConta)}
          className="p-1 border rounded bg-neutral-800 border-neutral-700"
        />
        <input
          name="usuario"
          placeholder="Usuário"
          value={novaConta.usuario}
          onChange={(e) => handleChange(e, setNovaConta)}
          className="p-1 border rounded bg-neutral-800 border-neutral-700"
        />
        <input
          name="senha"
          placeholder="Senha"
          value={novaConta.senha}
          onChange={(e) => handleChange(e, setNovaConta)}
          className="p-1 border rounded bg-neutral-800 border-neutral-700"
        />
        <input
          name="situacaoespecial"
          placeholder="Situação Especial"
          value={novaConta.situacaoespecial}
          onChange={(e) => handleChange(e, setNovaConta)}
          className="p-1 border rounded bg-neutral-800 border-neutral-700"
        />
        <input
          name="observacao"
          placeholder="Observação"
          value={novaConta.observacao}
          onChange={(e) => handleChange(e, setNovaConta)}
          className="p-1 border rounded bg-neutral-800 border-neutral-700"
        />
        <button
          onClick={criarConta}
          className="p-1 text-white bg-green-600 rounded hover:bg-green-700"
        >
          Criar
        </button>
      </div>
      {/* Listagem */}
      <h1 className=" text-[16px] font-semibold text-center lg:text-left">
        Contas existente
      </h1>
      <div className="flex flex-wrap gap-4">
        {contas.map((conta) => {
          const emEdicao = editandoId === conta.id;
          const isSenhaVisivel = senhaVisivel[conta.id];

          return (
            <div
              key={conta.id}
              className="bg-neutral-900 border border-neutral-700 p-2 rounded flex flex-col gap-2 w-[200px]"
            >
              {/* Descrição */}
              <input
                name="descricao"
                disabled={!emEdicao}
                value={conta.descricao}
                onChange={(e) => {
                  const { value } = e.target;
                  setContas((prev) =>
                    prev.map((c) =>
                      c.id === conta.id ? { ...c, descricao: value } : c
                    )
                  );
                }}
                className="p-1 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
              />

              {/* Campo usuário com botão de copiar */}
              <div className="relative">
                <input
                  name="usuario"
                  disabled={!emEdicao}
                  value={conta.usuario}
                  onChange={(e) => {
                    const { value } = e.target;
                    setContas((prev) =>
                      prev.map((c) =>
                        c.id === conta.id ? { ...c, usuario: value } : c
                      )
                    );
                  }}
                  className="w-full p-1 pr-8 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
                />
                <button
                  onClick={() => copiarTexto(conta.usuario)}
                  className="absolute text-sm text-white right-2 top-1"
                >
                  <FaCopy />
                </button>
              </div>

              {/* Campo senha com toggle de visibilidade e copiar */}
              <div className="relative">
                <input
                  name="senha"
                  type={isSenhaVisivel ? "text" : "password"}
                  disabled={!emEdicao}
                  value={conta.senha}
                  onChange={(e) => {
                    const { value } = e.target;
                    setContas((prev) =>
                      prev.map((c) =>
                        c.id === conta.id ? { ...c, senha: value } : c
                      )
                    );
                  }}
                  className="w-full p-1 pr-16 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
                />
                <button
                  onClick={() =>
                    setSenhaVisivel((prev) => ({
                      ...prev,
                      [conta.id]: !prev[conta.id],
                    }))
                  }
                  className="absolute text-sm text-white right-8 top-1"
                >
                  {isSenhaVisivel ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={() => copiarTexto(conta.senha)}
                  className="absolute text-sm text-white right-2 top-1"
                >
                  <FaCopy />
                </button>
              </div>

              {/* Situação Especial */}
              <input
                name="situacaoespecial"
                disabled={!emEdicao}
                value={conta.situacaoespecial}
                onChange={(e) => {
                  const { value } = e.target;
                  setContas((prev) =>
                    prev.map((c) =>
                      c.id === conta.id ? { ...c, situacaoespecial: value } : c
                    )
                  );
                }}
                className="p-1 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
              />

              {/* Observação */}
              <input
                name="observacao"
                disabled={!emEdicao}
                value={conta.observacao}
                onChange={(e) => {
                  const { value } = e.target;
                  setContas((prev) =>
                    prev.map((c) =>
                      c.id === conta.id ? { ...c, observacao: value } : c
                    )
                  );
                }}
                className="p-1 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
              />

              <div className="flex justify-end gap-2 mt-1">
                {emEdicao ? (
                  <>
                    <button
                      onClick={() => salvarEdicao(conta.id, conta)}
                      className="text-green-500 hover:scale-110"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="text-yellow-500 hover:scale-110"
                    >
                      <FaTimes />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditandoId(conta.id)}
                      className="text-blue-400 hover:scale-110"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deletarConta(conta.id)}
                      className="text-red-500 hover:scale-110"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
