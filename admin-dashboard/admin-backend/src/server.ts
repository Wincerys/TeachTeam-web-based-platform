// src/server.ts
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './schema/resolvers.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export interface Context {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

// Context function for authentication
const context = async ({ req }: { req: any }): Promise<Context> => {
  let user = undefined;
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret-key') as any;
      user = decoded;
    } catch (error) {
      console.log('Invalid token');
    }
  }
  
  return { user };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: parseInt(process.env.PORT || '4000') },
  context,
});

console.log(`🚀 GraphQL Server ready at: ${url}`);
console.log(`📊 GraphQL Playground available at: ${url}`);
console.log(`🗄️  Connected to database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);