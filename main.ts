import "reflect-metadata";
import body from "body-parser";
import redisStore from "connect-redis";
import cookie from "cookie-parser";
import express from "express";
import expressHandlebars from "express-handlebars";
import session from "express-session";
import helmet from "helmet";
import http from "http";
import redis from "redis";
import socketio from "socket.io";
import cors from "cors";
import passport from "./authorization";
import db from "./db";
import router from "./routes";
import websocket from "./websocket";

const app = express();
db();

const server = http.createServer(app);
const client = redis.createClient(process.env.REDIS_URL || "");

const RedisStore = redisStore(session);

app.engine("handlebars", expressHandlebars());
app.set("views", "views");
app.set("view engine", "handlebars");
app.use(helmet());
app.use(cors());
app.use("/", express.static("dist"));
app.use(
  session({
    store: new RedisStore({ client }),
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(body.json());
app.use(body.urlencoded({ extended: true }));
app.use(cookie());
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);

const io = socketio(server);
websocket(io);

server.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`),
);