import { useState, useEffect, useCallback } from 'react';
import { getAllRecords, createRecord, updateRecord, deleteRecord } from '@/shared/utils/crud';
import { filterItems } from '@/shared/utils/filter';
import { sortItems } from '@/shared/utils/sort';
import { useAlerta } from '@/shared/contexts/AlertContext';

/**
 * Generic hook for admin CRUD pages
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - API endpoint (e.g., '/evento')
 * @param {string} config.entityName - Display name for alerts (e.g., 'Evento')
 * @param {string} config.idField - The ID field name (e.g., 'id_evento')
 * @param {Function} config.normalizer - Function to normalize list items for display
 * @param {string|null} config.filterEndpoint - Optional filtered endpoint based on event
 * @param {Object|null} config.eventFilter - Event filter object from context
 */
export function useAdminCrud({
    endpoint,
    entityName,
    idField,
    normalizer,
    filterEndpoint = null,
    eventFilter = null
}) {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('id-desc');
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    const { mostrarAlerta } = useAlerta();

    // Fetch all items
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const url = filterEndpoint && eventFilter?.id_evento
                ? `${filterEndpoint}/${eventFilter.id_evento}`
                : endpoint;
            const data = await getAllRecords(url);
            setItems(data || []);
            setFilteredItems(data || []);
        } catch (error) {
            console.error(`Error fetching ${entityName}:`, error);
            mostrarAlerta('error', `Erro ao carregar ${entityName.toLowerCase()}s.`);
        } finally {
            setLoading(false);
        }
    }, [endpoint, filterEndpoint, eventFilter, entityName, mostrarAlerta]);

    // Initial fetch and refetch on event filter change
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Apply filter and sort when search term or sort order changes
    useEffect(() => {
        let results = filterItems(items, searchTerm);
        results = sortItems(results, sortOrder);
        setFilteredItems(results);
    }, [items, searchTerm, sortOrder]);

    // Save (create or update)
    const handleSave = async (data) => {
        try {
            const id = editingItem?.[idField];
            if (id) {
                await updateRecord(endpoint, id, data);
                mostrarAlerta('success', `${entityName} atualizado com sucesso!`);
            } else {
                await createRecord(endpoint, data);
                mostrarAlerta('success', `${entityName} criado com sucesso!`);
            }
            await fetchAll();
            setEditingItem(null);
            return true; // Signal success for modal close
        } catch (error) {
            console.error(`Error saving ${entityName}:`, error);
            mostrarAlerta('error', `Erro ao salvar ${entityName.toLowerCase()}.`);
            return false;
        }
    };

    // Direct update (for inline editing without modal)
    const handleUpdate = async (id, data) => {
        try {
            await updateRecord(endpoint, id, data);
            mostrarAlerta('success', `${entityName} atualizado com sucesso!`);
            await fetchAll();
            return true;
        } catch (error) {
            console.error(`Error updating ${entityName}:`, error);
            mostrarAlerta('error', `Erro ao atualizar ${entityName.toLowerCase()}.`);
            return false;
        }
    };

    // Initiate delete (opens confirmation)
    const handleDelete = (id) => {
        setItemToDelete(id);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!itemToDelete) return false;
        try {
            await deleteRecord(endpoint, itemToDelete);
            mostrarAlerta('success', `${entityName} deletado com sucesso!`);
            await fetchAll();
            setItemToDelete(null);
            return true;
        } catch (error) {
            console.error(`Error deleting ${entityName}:`, error);
            const msg = error.response?.data?.message || `Erro ao deletar ${entityName.toLowerCase()}.`;
            mostrarAlerta('error', msg);
            setItemToDelete(null);
            return false;
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setItemToDelete(null);
    };

    // Open edit modal
    const openEdit = (item) => {
        // Find full item from original list
        const fullItem = items.find(i => i[idField] === item.id);
        setEditingItem(fullItem);
    };

    // Open create modal with optional initial data
    const openCreate = (initialData = null) => {
        setEditingItem(initialData);
    };

    // Close edit modal
    const closeEdit = () => {
        setEditingItem(null);
    };

    // Get normalized list for display
    const normalizedList = normalizer ? normalizer(filteredItems) : filteredItems;

    return {
        // Data
        items,
        filteredItems,
        normalizedList,
        loading,

        // Search and Sort
        searchTerm,
        setSearchTerm,
        sortOrder,
        setSortOrder,

        // CRUD Operations
        fetchAll,
        handleSave,
        handleUpdate,
        handleDelete,
        confirmDelete,
        cancelDelete,

        // Modal State
        editingItem,
        setEditingItem,
        openEdit,
        openCreate,
        closeEdit,
        itemToDelete,

        // Helpers
        isEditing: editingItem?.[idField] != null
    };
}
