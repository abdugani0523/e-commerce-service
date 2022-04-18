import { makeExecutableSchema } from '@graphql-tools/schema'

import authModule from './auth/index.js'
import productModule from './product/index.js'
import categoryModule from './category/index.js'
import orderModule from './order/index.js'

export default makeExecutableSchema({
    typeDefs: [
        authModule.typeDefs,
        categoryModule.typeDefs,
        productModule.typeDefs,
        orderModule.typeDefs
    ],
    resolvers: [
        authModule.resolvers,
        categoryModule.resolvers,
        productModule.resolvers,
        orderModule.resolvers
    ]
})