'use client'
import Modal from "@/app/_components/displays/Modal"
import ConfirmDialog from "@/app/_components/displays/ConfirmDialog"

/**
 * AdminModal - Wrapper for admin CRUD modals
 * Provides consistent layout for form modals with save/cancel
 */
export function AdminFormModal({
    refModal,
    title,
    onCancel,
    children
}) {
    return (
        <Modal refModal={refModal}>
            <h3 className="font-bold text-2xl ml-2">
                {title}
            </h3>
            {children}
        </Modal>
    )
}

/**
 * AdminConfirmDialog - Wrapper for delete confirmation
 */
export function AdminConfirmDialog({
    refModal,
    title,
    message,
    onConfirm,
    onCancel
}) {
    return (
        <ConfirmDialog
            refModal={refModal}
            title={title}
            message={message}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    )
}
