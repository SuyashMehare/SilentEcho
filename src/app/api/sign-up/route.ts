import bcrypt from "bcryptjs";

import sendVerificationEmail from "@/lib/send-mail.util";
import UserModel from "@/models/users.model";
import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";

export async function POST(req:Request) {

    await dbConnect()

    const{ username , email , password } = await req.json() 

    try {
        const userAlreadyExist = await UserModel.findOne({
            username,
            isVerified:true
        })
    
        // console.log(user); // todo
        if(userAlreadyExist){
            return Response.json(
                ApiResponse({
                    success: false,
                    message: "User already exist",
                    data: {}
                }),
                {status:200}
            )
        }
    
        const userWithEmail = await UserModel.findOne({
            email
        })
    
        if(userWithEmail){
            
            const verifyCodeExpiry = new Date();
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1)
    
            const hashedPassword = await bcrypt.hash(password,10);
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
            userWithEmail.password = hashedPassword;
            userWithEmail.verifyCode = verifyCode;
            userWithEmail.verifyCodeExpiry = verifyCodeExpiry;

            await userWithEmail.save()
        }
        else{
            
            const hashedPassword = await bcrypt.hash(password,10);;
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            const verifyCodeExpiry = new Date();
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1)
    
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry, 
                isVerified: false,
                isAcceptingMessages: true,
                messages:[]
            });
    
    
            await newUser.save();
        }
    
        const res = await sendVerificationEmail(username,email);
    
        // handle both scearios : failed & success  checkout:sendVerificationEmail
        return Response.json(
            ApiResponse({
                    success: res.success,
                    message: res.message,
                    data: res.data,
                }),
                {
                    status: res.status
                }
        )
    
    } catch (error) {
        
        console.log("Error while registering user", error);
        return Response.json(
            ApiResponse({
                success: false,
                message: "Error while registering user",
                data:{},
            }),
            {
                status:500
            }
        )
        
    }
}
