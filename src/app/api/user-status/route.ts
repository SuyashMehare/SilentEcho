import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { ApiResponse } from "@/types/ApiResponse";

import UserModel from "@/models/users.model";
import dbConnect from "@/lib/dbConnect";

// check user accepting messages
export async function GET(req : NextRequest) {
    

    await dbConnect()

    const session = await getServerSession(authOptions)
    const user : User= session?.user as User

    if( !session || !user){
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"User session invalid, sign up again",
                data:{}
            }),
            {status:400}
        )
    }

    try {
        const dbuser = await UserModel.findById(user._id)
    
        if(!dbuser){
            return NextResponse.json(
                ApiResponse({
                    success:false,
                    message:"User do not found",
                    data:{}
                }),
                {status:404}
            )
        }
    
        const isAcceptingMessages = dbuser?.isAcceptingMessages
    
        return NextResponse.json(
            ApiResponse({
                success:true,
                message:"User status fetched successfully",
                data:{isAcceptingMessages}
            },),
            {status:200}
        )
    } catch (error) {
        console.error('Error retrieving message acceptance status:',error);

        return NextResponse.json(
            ApiResponse({success:false,message:"Error retrieving message acceptance status"}),
            {status:500}
        )
        
    }

}

// toggle `isAcceptingMessages`
export async function POST(req:NextRequest) {
    
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user = session?.user;


    if(!session || !user){
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"Not authenticated, sign up again",
                data:{}
            }),
            {status:401}
        )
    }


  /** todo
   *  1. update user in signle db call
   *  2. update `isAcceptingMessages` to true (if it is false) & vice versa
   *     in query itself (within .findByIdAndUpdate)
   */
   try {
     const dbUser = await UserModel.findById(user?._id)
 
     if(!dbUser){
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"User not found",
                data:{}
            }),
            {status:400}
        )
     }
 
     const status = (dbUser?.isAcceptingMessages) ? false : true
     dbUser && (dbUser.isAcceptingMessages = status) 
 
     await dbUser?.save()

   } catch (error) {
     console.error("Error while toggling message accepting status",error);

     return NextResponse.json(
        ApiResponse({
            success:false,
            message:"Error while toggling message accepting status",
            data:{}
        }),
        {status:500}
    )
     
   }

}