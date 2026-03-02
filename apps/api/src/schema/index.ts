import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userSchema = fs.readFileSync(path.join(__dirname, "user.graphql"), "utf-8");
const postSchema = fs.readFileSync(path.join(__dirname, "post.graphql"), "utf-8");
const hashtagSchema = fs.readFileSync(path.join(__dirname, "hashtag.graphql"), "utf-8");
const searchSchema = fs.readFileSync(path.join(__dirname, "search.graphql"), "utf-8");

export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  ${userSchema}
  ${postSchema}
  ${hashtagSchema}
  ${searchSchema}
`;
