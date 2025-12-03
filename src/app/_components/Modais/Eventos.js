import React, { useState } from "react";
import Input from "../utils/Input";
import Button from "../utils/Button";
import InputColor from "../utils/InputColor";
import { useModal } from "@/context/ModalContext";
import { formatDateToISO } from "@/utils/dateUtils";

export default function Eventos({ onClickSalvar, onClickCancelar, initialData }) {
    const [nome, setNome] = useState("")
    const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
    const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0])
    const [ano, setAno] = useState(new Date().getFullYear())

    // New states
    const [slug, setSlug] = useState("")
    const [banner, setBanner] = useState("")
    const [corPrimaria, setCorPrimaria] = useState("")
    const [corSecundaria, setCorSecundaria] = useState("")

    const { refMd } = useModal()

    React.useEffect(() => {
        if (initialData) {
            setNome(initialData.nome)
            setAno(initialData.ano)
            setDataInicio(initialData.inicio ? initialData.inicio.split('T')[0] : "")
            setDataFim(initialData.final ? initialData.final.split('T')[0] : "")

            // Set new fields
            setSlug(initialData.slug || "")
            setBanner(initialData.banner || "")
            setCorPrimaria(initialData.cor_primaria || "")
            setCorSecundaria(initialData.cor_secundaria || "")
        } else {
            setNome("")
            setAno(new Date().getFullYear())
            setDataInicio(new Date().toISOString().split('T')[0])
            setDataFim(new Date().toISOString().split('T')[0])

            // Reset new fields
            setSlug("")
            setBanner("")
            setCorPrimaria("")
            setCorSecundaria("")
        }
    }, [initialData])


    return (
        <div className="w-full">
            <Input
                label="Nome:"
                value={nome}
                onChange={(value) => {
                    setNome(value);
                    if (!initialData) {
                        // Generate slug from name and year, ignoring connectives and numbers in the name
                        const ignoreWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'o', 'a', 'os', 'as', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com'];
                        const words = value.toLowerCase().split(/\s+/);
                        const acronym = words
                            .filter(word => !ignoreWords.includes(word) && isNaN(word)) // Filter out connectives and numbers
                            .map(word => word.charAt(0))
                            .join('');
                        setSlug(`${acronym}${ano}`);
                    }
                }}
                placeholder="Preencha o nome do evento"
                type="text"
                badge='obrigatorio'
                badgeColor='error'
            />

                <Input
                    label="Slug:"
                    value={slug}
                    onChange={setSlug}
                    placeholder="Ex: semana-ct"
                    type="text"
                />
                <div className="form-control w-full my-3">
                    <label className="label">
                        <span className="label-text">Banner:</span>
                    </label>
                    <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setBanner(e.target.files[0])}
                        accept="image/*"
                    />
                </div>
                <div className="flex gap-4">
                    <InputColor
                        label="Cor Primária"
                        value={corPrimaria}
                        onChange={setCorPrimaria}
                        placeholder="#000000"
                    />
                    <InputColor
                        label="Cor Secundária"
                        value={corSecundaria}
                        onChange={setCorSecundaria}
                        placeholder="#FFFFFF"
                    />
                </div>

                <Input
                    label="Ano:"
                    value={ano}
                    onChange={setAno}
                    placeholder="Preencha o Ano do evento"
                    type="number"
                    badge='obrigatorio'
                    badgeColor='error'
                />
                <Input
                    label="Data Inicio:"
                    value={dataInicio}
                    onChange={setDataInicio}
                    placeholder="Preencha a data de inicio do evento"
                    type="date"
                    badge='obrigatorio'
                    badgeColor='error'

                />

                <Input
                    label="Data Final:"
                    value={dataFim}
                    onChange={setDataFim}
                    placeholder="Preencha a data de inicio do evento"
                    type="date"
                    badge='obrigatorio'
                    badgeColor='error'

                />

                <div className="btns w-full flex justify-end mt-2">
                    <Button onClick={() => {
                        const formData = new FormData();
                        formData.append('nome', nome);
                        formData.append('data_inicio', formatDateToISO(dataInicio));
                        formData.append('data_fim', formatDateToISO(dataFim));
                        formData.append('ano', parseInt(ano));
                        formData.append('slug', slug);
                        const baseUrl = "http://localhost:3000";
                        formData.append('base_url', baseUrl);
                        formData.append('cor_primaria', corPrimaria);
                        formData.append('cor_secundaria', corSecundaria);

                        if (banner instanceof File) {
                            formData.append('banner', banner);
                        } else if (banner) {
                            formData.append('banner', banner); // Keep existing URL if not changed
                        }

                        console.log('[Eventos Modal] FormData being sent');
                        onClickSalvar(formData);
                    }} label={initialData ? "Atualizar" : "Salvar"} color="success" mode="active" />
                    <Button onClick={onClickCancelar} label="cancelar" color="error" mode="active" />
                </div>
            </div>
            )
}
