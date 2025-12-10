'use client'
import ListItens from "@/app/_components/displays/ListItens"
import TextInputWithButton from "@/app/_components/utils/TextInputWithButton"
import SortControl from "@/app/_components/utils/SortControl"

/**
 * AdminList - Wrapper component for admin list pages
 * Provides consistent layout for search, sort, and list display
 */
export default function AdminList({
    title,
    placeholder = "Digite para pesquisar ou cadastrar",
    searchTerm,
    onSearchChange,
    onCreateClick,
    sortOrder,
    onSortChange,
    list,
    onDelete,
    onEdit,
    onRole,
    isAdmin = true,
    showSortControl = true,
    children
}) {
    return (
        <>
            <div className="my-3 mx-2 flex justify-between items-center gap-2">
                <TextInputWithButton
                    placeholder={placeholder}
                    type='text'
                    value={searchTerm}
                    onChange={onSearchChange}
                    onClick={onCreateClick}
                    hideButton={!isAdmin}
                >
                    {showSortControl && (
                        <SortControl value={sortOrder} onChange={onSortChange} />
                    )}
                </TextInputWithButton>
            </div>
            <div>
                <ListItens
                    info={title}
                    list={list}
                    deleteFunction={isAdmin ? onDelete : null}
                    editFunction={onEdit ? (isAdmin ? onEdit : null) : undefined}
                    onEdit={!onEdit && isAdmin ? undefined : undefined}
                    roleFunction={onRole ? (isAdmin ? onRole : null) : undefined}
                />
            </div>
            {children}
        </>
    )
}
