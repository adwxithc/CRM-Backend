import express from "express";
import cors from "cors";

// import cookieParser from "cookie-parser";

import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./routes/authRouter.js";

dotenv.config();

const app = express();

// app.use(cookieParser());

const corsOptions = {
    origin: process.env.FRONT_END_URL, 
    credentials: true, 
    optionsSuccessStatus: 200
};



app.use(express.json());
app.use(express.urlencoded({extended:true}));



app.set("trust proxy", true);


app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("Welcome to CRM Backend API");
});

app.use("/api/auth",authRouter(express.Router()));



app.use(errorHandler);

export { app }; 
