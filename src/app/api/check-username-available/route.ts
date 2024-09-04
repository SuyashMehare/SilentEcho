import { NextRequest, NextResponse } from "next/server";
import { usernameValidation } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import UserModel from "@/models/users.model";
import dbConnect from "@/lib/dbConnect";


export async function GET(request: NextRequest) {

    await dbConnect()
    
    try {
        const { searchParams } = new URL(request.nextUrl.href)
        const username = searchParams.get("username")

        const isUsernameValid = usernameValidation.safeParse(username)

        
        if(!isUsernameValid.success){

            const usernameErrors = isUsernameValid.error.format()._errors || []
            
            return NextResponse.json(


                ApiResponse({
                    success:false,
                    message: 
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ')
                            : "Invali username parameter" ,
                    status:400,
                    data:{}
                }),
                {status:400}
            )
        }

        
        const user = await UserModel.findOne({
            username,
            isVerified:true
        })

        if(!user){
            return NextResponse.json(
                ApiResponse({
                    success:true,
                    message:"Username available",
                    status:200,
                    data:{}
                }),
                {status:200}
            )
        }
        
        return NextResponse.json(
            ApiResponse({
                success:true,
                message:"Username already taken",
                status:200,
                data:{}
            }),
            {status:200}
        )
    } catch (error) {
        console.error("Error while checking username",error);

        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"Error while checking username",
                data:{},
                status:500
            }),
            {status:500}
        )   
    }
}