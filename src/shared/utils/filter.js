export function filterItems(arr, search){
  return arr.filter((item) => item.nome.toLowerCase().includes(search.toLowerCase()))
}

export function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

export function formatCPF(cpf) {
  return `${cpf.substring(0,3)}.${cpf.substring(3,6)}.${cpf.substring(6,9)}-${cpf.substring(9)}`
}