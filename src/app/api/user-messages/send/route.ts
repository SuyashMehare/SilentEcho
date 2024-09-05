import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { ApiResponse } from "@/types/ApiResponse";
import { Message } from "@/models/users.model";
import UserModel from "@/models/users.model";

//not protected : todo
export async function POST(req:NextRequest) {
    
    
    const { username , content } : {username:string,content:string} = await req.json()

    // add zod for content: todo
    try {
        const user = await UserModel.findOne({username})
    
        if(!user){
            return NextResponse.json(
                ApiResponse({ message: 'User not found', success: false }),
                { status: 404 }
              );
        }
    
        if(!user?.isAcceptingMessages){
            return NextResponse.json(
                ApiResponse({ message: 'User is not accepting messages', success: false }),
                { status: 403 }
              );
        }
    
        const newMessage = {content, createdAt: new Date()}
    
        user?.messages.push(newMessage as Message)
        await user?.save()  
        
    } catch (error) {
        console.error('Error adding message:', error);
        return NextResponse.json(
        ApiResponse({ message: 'Internal server error', success: false }),
        { status: 500 }
    );
    }

}