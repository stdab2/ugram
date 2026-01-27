import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';


async function startServer() {
  const app = express();
  //app.use(cors);
  const httpServer = http.createServer(app);

  const PORT = 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
}

startServer();