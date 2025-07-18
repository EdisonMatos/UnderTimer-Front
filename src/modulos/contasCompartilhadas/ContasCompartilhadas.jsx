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
  const userRole = localStorage.getItem("role");

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
    const camposObrigatorios = ["descricao", "usuario", "senha"];
    const camposVazios = camposObrigatorios.some(
      (campo) => !novaConta[campo].trim()
    );

    if (camposVazios) {
      toast.error("Preencha pelo menos descrição, usuário e senha.");
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

  // FILTRO para mostrar só as contas da guild do usuário logado
  const contasFiltradas = contas.filter((conta) => conta.guildId === guildId);
  const temPermissao = ["veterano", "staff", "guildmaster"].includes(userRole);

  return (
    <div className="flex flex-col gap-8 text-white mb-14">
      <h1 className=" text-[24px] mt-20 font-semibold text-center lg:text-left">
        Contas da Guild
      </h1>
      <div className="flex flex-col md:gap-5 lg:flex-row">
        {temPermissao && (
          <div className="p-2 rounded-lg shadow-md bg-cards shadow-black h-fit">
            <div className="p-4 rounded-md bg-neutral-900">
              <h1 className="text-[16px] font-semibold lg:block mb-4">
                Adicionar nova conta
              </h1>
              <div className="flex flex-col gap-2 w-full lg:max-w-[200px]">
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
                  className="p-1 mt-2 text-white transition-all rounded bg-primary hover:scale-105"
                >
                  Adicionar conta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listagem */}
        <div className="flex flex-wrap gap-4 ">
          <h1 className=" text-[16px] font-semibold text-center lg:text-left lg:hidden mt-10">
            Contas existentes
          </h1>
          {temPermissao ? (
            contasFiltradas.map((conta) => {
              const emEdicao = editandoId === conta.id;
              const isSenhaVisivel = senhaVisivel[conta.id];

              return (
                <div
                  key={conta.id}
                  className="bg-cards shadow-md shadow-black  p-2 rounded flex flex-col gap-2 lg:w-[200px] w-full h-fit"
                >
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
                    className="p-1 border rounded bg-neutral-900 border-neutral-700 disabled:opacity-70 "
                  />
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
                      className="w-full p-1 pr-8 border rounded bg-neutral-900 border-neutral-700 disabled:opacity-70"
                    />
                    <button
                      onClick={() => copiarTexto(conta.usuario)}
                      className="absolute text-sm text-white right-2 top-2"
                    >
                      <FaCopy />
                    </button>
                  </div>
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
                      className="w-full p-1 pr-16 border rounded bg-neutral-900 border-neutral-700 disabled:opacity-70"
                    />
                    <button
                      onClick={() =>
                        setSenhaVisivel((prev) => ({
                          ...prev,
                          [conta.id]: !prev[conta.id],
                        }))
                      }
                      className="absolute text-sm text-white right-8 top-2"
                    >
                      {isSenhaVisivel ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => copiarTexto(conta.senha)}
                      className="absolute text-sm text-white right-2 top-2"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  {emEdicao ? (
                    <input
                      name="situacaoespecial"
                      placeholder="Situação Especial"
                      disabled={!emEdicao}
                      value={conta.situacaoespecial}
                      onChange={(e) => {
                        const { value } = e.target;
                        setContas((prev) =>
                          prev.map((c) =>
                            c.id === conta.id
                              ? { ...c, situacaoespecial: value }
                              : c
                          )
                        );
                      }}
                      className="p-1 text-green-400 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70"
                    />
                  ) : conta.situacaoespecial ? (
                    <p className="text-green-400">{conta.situacaoespecial}</p>
                  ) : null}
                  {emEdicao ? (
                    <textarea
                      name="observacao"
                      placeholder="Observação"
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
                      className="p-1 h-12 border rounded bg-neutral-800 border-neutral-700 disabled:opacity-70 text-[12px]"
                    />
                  ) : conta.observacao ? (
                    <p className="text-[12px]">{conta.observacao}</p>
                  ) : null}
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
            })
          ) : (
            <p className="mt-4 text-red-400">
              Você não tem permissão para acessar as contas da guild.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
