import React, { useState } from "react";
import Input from "@/shared/components/utils/Input";
import Button from "@/shared/components/utils/Button";
import InputColor from "@/shared/components/utils/InputColor";
import SingleSelect from "@/shared/components/utils/SingleSelect";
import { useModal } from "@/shared/contexts/ModalContext";
import { formatDateToISO } from "@/shared/utils/dateUtils";
import { usuarioService } from "@/modules/usuarios/services/usuario.service";
import { getAllRecords } from "@/shared/utils/crud";

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
    const [usuarioResponsavel, setUsuarioResponsavel] = useState(null)
    const [usuariosOptions, setUsuariosOptions] = useState([])
    const [eventoPai, setEventoPai] = useState(null)
    const [eventosOptions, setEventosOptions] = useState([])

    const { refMd } = useModal()
    const fileInputRef = React.useRef(null)

    React.useEffect(() => {
        usuarioService.getAll().then(setUsuariosOptions).catch(console.error);
        getAllRecords('/evento').then(setEventosOptions).catch(console.error);
    }, []);

    React.useEffect(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
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
            setUsuarioResponsavel(initialData.usuario_responsavel || (initialData.fk_usuario_responsavel ? { id_usuario: initialData.fk_usuario_responsavel } : null))
            setEventoPai(initialData.evento_pai || (initialData.fk_evento_pai ? { id_evento: initialData.fk_evento_pai } : null))
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
            setUsuarioResponsavel(null)
            setEventoPai(null)
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
            <div className="form-control w-full my-3 flex gap-4">
                <div className="flex flex-col gap-4">
                    <label className="label">
                        <span className="label-text">Banner:</span>
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setBanner(e.target.files[0] || "")}
                        accept="image/*"
                    />
                </div>

                {banner && typeof banner === 'string' && (
                    
                        <div className="mt-2 text-sm text-gray-500 flex flex-col gap-2">
                            <span>Banner atual:</span>
                            <img
                                src={`http://localhost:4455${banner.startsWith('/') ? '' : '/'}${banner}`}
                                alt="Banner Atual"
                                className="h-12 w-auto object-cover rounded border border-gray-300"
                            />
                        </div>
                   
                )}
                {banner && banner instanceof File && typeof window !== 'undefined' && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                        <span>Novo banner selecionado:</span>
                        <img
                            src={URL.createObjectURL(banner)}
                            alt="Novo Banner"
                            className="h-12 w-auto object-cover rounded border border-gray-300"
                        />
                    </div>
                )}
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
            <div className="flex gap-4">
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
            </div>
            <SingleSelect
                label="Responsável pelo Evento:"
                options={usuariosOptions}
                value={usuarioResponsavel}
                onChange={setUsuarioResponsavel}
                valueKey="id_usuario"
                labelKey="nome"
            />

            <SingleSelect
                label="Evento Pai (Opcional):"
                options={eventosOptions.filter(e =>
                    (!initialData || e.id_evento !== initialData.id_evento) &&
                    !e.fk_evento_pai
                )}
                value={eventoPai}
                onChange={setEventoPai}
                valueKey="id_evento"
                labelKey="nome"
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
                    if (usuarioResponsavel) {
                        formData.append('fk_usuario_responsavel', usuarioResponsavel.id_usuario);
                    } else {
                        formData.append('fk_usuario_responsavel', 'null');
                    }
                    if (eventoPai) {
                        formData.append('fk_evento_pai', eventoPai.id_evento);
                    } else {
                        formData.append('fk_evento_pai', 'null');
                    }

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
