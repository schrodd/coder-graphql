import express from "express"
import dotenv from 'dotenv'
import {buildSchema} from 'graphql'
import {graphqlHTTP} from 'express-graphql'

const app = express()
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
const PORT = process.env.PORT || 8080
app.listen(PORT,()=>console.log(`Server listening on port ${PORT}`))

// Config graphql
// Tipos de objetos que definen la estructura de la API
// type Query/Mutation: reemplazan los endpoints
const graphqlSchema = buildSchema(`
  type User{
    id:Int,
    nombre:String,
    telefono:String
  }
  
  input UserInput{
    nombre:String,
    telefono:String
  }

  type Query{
    getUsers: [User],
    getUserById(id:Int): User
  }

  type Mutation{
    addUser(user:UserInput): User
  }
`)

// Creamos los metodos
let users = []
const root = {
  getUsers: () => {
    return users
  },

  getUserById: ({id}) => {
    const userFound = users.find(u => u.id === id)
    return userFound ? userFound : null
  },

  addUser: ({user}) => {
    let newId = !users.length ? 1 : users[users.length-1].id + 1
    const newUser = {
      id: newId,
      nombre: user.nombre,
      telefono: user.telefono
    }
    users.push(newUser)
    return newUser
  }
}

// Enlazar esquema y metodos

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema, // Esquemas
  rootValue: root, // Metodos
  graphiql: true // Habilitar Graphql para consultas
}))