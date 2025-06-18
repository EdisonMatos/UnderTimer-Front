import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MemberBar from "./interface/MemberBar";
import Instancias from "./modulos/instancias/Instancias";
import Mvps from "./modulos/mvps/Mvps";
import Header from "./interface/Header";

const App = () => {
  return (
    <div className="max-w-[1215px] mx-auto px-5 py-5 font-sans text-white flex flex-col">
      <ToastContainer />
      <Header />
      <MemberBar />
      <Mvps />
      <Instancias />
    </div>
  );
};

export default App;
