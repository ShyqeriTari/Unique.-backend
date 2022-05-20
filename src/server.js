import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import playersRouter from "./services/users/index.js"
import cors from "cors";
import {
    badRequestHandler,
    unauthorizedHandler,
    forbiddenHandler,
    notFoundHandler,
    genericErrorHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT;
//***********************************Middlewares*******************************************************/

server.use(cors());
server.use(express.json());

//***********************************Endpoints*********************************************************/

server.use("/player", playersRouter)

//***********************************Error handlers****************************************************/
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
    console.log("👌 Connected to Mongo!");

    server.listen(port, () => {
        console.table(listEndpoints(server));
        console.log(`🚀 Server listening on port ${port}`);
    });
});
