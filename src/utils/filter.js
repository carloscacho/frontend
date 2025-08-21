export function filterItems(arr, search){
  return arr.filter((item) => item.nome.toLowerCase().includes(search.toLowerCase()))
}