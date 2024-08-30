import mongoose from "mongoose";

type ConnectionObj = {

    isConnected?: number 
}

const connection : ConnectionObj = {}

//todo: Promise<void> vs Promise<any>
async function dbConnect() : Promise<void>{
    
    if(connection.isConnected){
        console.log('Already connected to db');
        return
    }


    try {
        
        // todo: log `db` and explore options `{}` of mongoose.connect
        const db = await mongoose.connect(process.env.MONGO_URI || "",{})

        connection.isConnected = db.connections[0].readyState
        console.log("DB connected successfully");
        
    } catch (error) {
        
        console.log("Failed to connect DB",error);
        process.exit(1)
    }
}

export default dbConnect;