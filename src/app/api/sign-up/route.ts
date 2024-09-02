import bcrypt from "bcryptjs";

import sendVerificationEmail from "@/lib/send-mail.util";
import UserModel from "@/models/users.model";
import { ApiResponse } from "@/types/ApiResponse";
import dbConnect from "@/lib/dbConnect";

async function POST(req:Request) {

    const{ username , email , password } = await req.json() 

    // compelsory username,email,password

    /**
     * Username + verified => return user already exist
     * 
     * username + not verified => update with new credentials + send verifyCode
     * 
     * not username + not verified => add new credentials + send verifyCode
     */

    await dbConnect()

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
            const verifyCode = String(Math.floor(Math.random()*1000000));
    
    
            userWithEmail.password = hashedPassword;
            userWithEmail.verifyCode = verifyCode;
            userWithEmail.verifyCodeExpiry = verifyCodeExpiry;
    
        }
        else{
            
            const hashedPassword = 0;
            const verifyCodeExpiry = 0;
            const verifyCode = 0;
    
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
    
        if(!res.success){
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
        }
    
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
