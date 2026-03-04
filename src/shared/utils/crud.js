import API from "@/lib/api/axios-instance";

export async function getAllRecords(path) {
  try {
    const res = await API.get(path)
    return res.data
  } catch (error) {
    console.log("Erro Ao carregar os dados " + error.response?.statusText)
    return;
  }
}

export async function getRecordById(path, id) {
  try {
    const res = await API(`${path}/${id}`)
    return res.data
  } catch (error) {
    console.log("Erro Ao carregar os dados " + error.response?.statusText)
    return;
  }
}

export async function getRecordBySlug(path, slug) {
  try {
    const res = await API(`${path}/slug/${slug}`)
    return res.data
  } catch (error) {
    console.log("Erro Ao carregar os dados " + error.response?.statusText)
    return;
  }
}

export async function createRecord(path, data) {
  try {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await API.post(path, data, config)
    console.log(res.data)
    return res.data
  } catch (error) {
    console.log("Erro ao criar registro " + error.response?.statusText)
    throw error;
  }
}

export async function deleteRecord(path, id) {
  try {
    const res = await API.delete(`${path}/${id}`)
    return res.data
  } catch (error) {
    console.log("Erro ao deletar registro " + error.response?.statusText)
    throw error;
  }
}

export async function updateRecord(path, id, data) {
  try {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await API.put(`${path}/${id}`, data, config)
    return res.data
  } catch (error) {
    console.log("Erro ao atualizar registro " + error.response?.statusText)
    throw error;
  }
}