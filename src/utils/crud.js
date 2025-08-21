const BASE_URL = 'http://localhost:4000/crud'

export async function getAllRecords(path){
    try{
      const data = await fetch(BASE_URL + path)
      return await data.json()
    } catch(error) {
      console.log("Erro Ao carregar os dados " + error.toString())
      return;
    }
  }

export async function getRecordById(path,id){
    try{
      const data = await fetch(`${BASE_URL}${path}/${id}`)
      return await data.json()
    } catch(error) {
      console.log("Erro Ao carregar os dados " + error.toString())
      return;
    }
  }