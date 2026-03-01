import dotenv from "dotenv";
dotenv.config();


import connectDB from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

const start = async () => {

    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }
  
    
    try {
        await connectDB();
    } catch (error) {
        console.error(error, "database connection failed..");
    }
    app.listen(PORT, () => {
        console.log(`listening  at port ${process.env.PORT} `);    });
};

start();
