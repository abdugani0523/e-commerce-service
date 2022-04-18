import resolvers from './resolver.js'
import { fileURLToPath } from 'url'
import { gql } from 'apollo-server-express'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const typeDefs = fs.readFileSync(path.join(__dirname, 'typeDef.gql'), 'utf8')

export default {
    resolvers,
    typeDefs: gql`${typeDefs}`
}