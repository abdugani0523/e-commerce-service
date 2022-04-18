import express from 'express'
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { port } from '../config.js';
import http from 'http';
import { join } from 'path';
import schema from './graphql/index.js'
import model from './utils/model.js'

const app = express();
app.use(graphqlUploadExpress({ maxFiles: 1 }));

app.use('/assets', express.static(join(process.cwd(), 'src', 'assets')))
const httpServer = http.createServer(app);
const server = new ApolloServer({ 
    context: ({ req, res }) => {
      model.userAgent = req.headers['user-agent']
      model.token = req.headers['token']
      return model
    },
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageGraphQLPlayground()
    ]
});
            
(async () => {
    await server.start()
    server.applyMiddleware({ 
        app, 
        path: '/graphql'
    });
    await new Promise(resolve => httpServer.listen({ port }, resolve));
    console.log('Server ready at', port)
})()