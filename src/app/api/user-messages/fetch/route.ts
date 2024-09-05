import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/models/users.model";
import { ApiResponse } from "@/types/ApiResponse";

export async function GET(req:NextRequest) {
    
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user : User = session?.user as User

    if (!session || !user) {
        return NextResponse.json(
          ApiResponse({ success: false, message: 'Not authenticated' }),
          { status: 401 }
        );
      }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        
        const dbuser = await UserModel.aggregate([
            { $match : {_id : userId} },
            { $unwind: "$messages" },
            { $sort  : { 'messages.createdAt' : -1 } },
            { $group : { _id : '$_id ', messages: {$push: "$messages"}}}
        ]).exec()


        if(!dbuser || dbuser.length === 0){
            return NextResponse.json(
                ApiResponse({ message: 'User not found', success: false }),
                { status: 404 }
              );
        }

        return NextResponse.json(
            ApiResponse({ 
                success :true, 
                message:"Messages fetch successfully",
                data: {messages:dbuser[0].messages} 
            }),
            {status: 200,}
          );

    } catch (error) {

        console.error('An unexpected error occurred:', error);
        return NextResponse.json(
            ApiResponse({ message: 'Internal server error', success: false }),
            { status: 500 }
        );
    }

}