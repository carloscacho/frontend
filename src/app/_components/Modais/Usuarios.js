import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import { useModal } from "@/context/ModalContext";
import Cadastro from "../screens/Cadastro";

export default function Palestrantes() {
    const [nome, setNome] = useState("")
    const [dataInicio, setDataInicio] = useState(new Date())
    const [dataFim, setDataFim] = useState(new Date())
    const [ano, setAno] = useState(new Date().getFullYear())
    const { refMd } = useModal()

    return (
        <div className="w-full">
          <Cadastro />
        </div>
    )
}