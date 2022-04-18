import resolvers from './resolver.js'
import { fileURLToPath } from 'url'
import { gql } from 'apollo-server-express'
import { join, dirname } from 'path'
import { readFileSync } from 'fs'
const __dirname = dirname(fileURLToPath(import.meta.url))

const typeDefs = readFileSync(join(__dirname, 'typeDef.gql'), 'utf8')

export default {
    resolvers,
    typeDefs: gql`${typeDefs}`
}