"use client"
import {createContext, useState} from "react";

export const UserContext = createContext({
  email: '',
  senha: '',
  setEmail: () => { },
  setSenha: () => { },
  login: () => { }
})

export const UserContextProvider = ({ children }) => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const login = () => {
    console.log('login no site')
  }

  return (
    <UserContext.Provider value={{ email, senha, setEmail, setSenha, login }}>
      {children}
    </UserContext.Provider>
  )
}

