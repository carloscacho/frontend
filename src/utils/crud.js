import API from "./api";


export async function getAllRecords(path) {
  try {
    const res = await API.get(path)
    return res.data
  } catch (error) {
    console.log("Erro Ao carregar os dados " + error.response.statusText)
    return;
  }
}

export async function getRecordById(path, id) {
  try {
    const res = await API(`${path}/${id}`)
    return res.data
  } catch (error) {
    console.log("Erro Ao carregar os dados " + error.response.statusText)
    return;
  }
}

export async function createRecord(path, data) {
  try {
    const res = await API.post(path, data)
    return res.data
  } catch (error) {
    console.log("Erro ao criar registro " + error.response?.statusText)
    throw error;
  }
}