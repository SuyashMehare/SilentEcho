import UserModel from "@/models/users.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { verifyCodeSchema } from "@/schemas/verifyCodeSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){


    const { username , verifyCode } = await request.json()
    
    const isUsernamevalid = usernameValidation.safeParse(username)
    
    if (!isUsernamevalid.success) {
        
        const usernameErrors = isUsernamevalid.error.format()._errors || [];

        return NextResponse.json(
            ApiResponse({
                success:false,
                message:usernameErrors.length> 0
                    ? usernameErrors.join(', ')
                    : "Invalid username format",
                data:{},
                status:400
            }),
            {status:400}
        )
    }
    
    const isVerifyCodeValid = verifyCodeSchema.safeParse({verifyCode})
    
    if(!isVerifyCodeValid.success){
        
        const verifyCodeErrors = isVerifyCodeValid.error.format()._errors || []
               
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:verifyCodeErrors.length > 0
                    ? verifyCodeErrors.join(', ')
                    : "Invalid verification code format",
                data:{},
                status:400
            }),
            {status:400}
        )
    }


    const user = await UserModel.findOne({
        username
    })

    const isverifyCodeValid = verifyCode === user?.verifyCode

    if(!isverifyCodeValid){
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"Invalid verification Code"
            })
        )
    }

    const registeredTime = user?.verifyCodeExpiry as Date;

    const isverifyCodeExpired = new Date() > new Date(registeredTime)

    if(isverifyCodeExpired){
        return NextResponse.json(
            ApiResponse({
                success:false,
                message:"Verfication code is expried, please sign up again",
                data:{}
            }),
            {status:400}
        )
    }

        
    user && (user.isVerified = true)

    await user?.save()
    
    return NextResponse.json(
        ApiResponse({
            success:true,
            message:"User verified successfully"
        }),
        {status:200}
    )
    
}