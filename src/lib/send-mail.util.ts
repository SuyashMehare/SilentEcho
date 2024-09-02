import { EmailTemplate } from "@/components/email-template";
import { IApiResponse } from "@/types/ApiResponse";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);



export default async function sendVerificationEmail(username:string,email:string) : Promise<IApiResponse>{
    
    const verifyCode : string = String(Math.floor(Math.random()*1000000))

    const { data , error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: email,
        subject: 'SiltEcho | Verfication code',
        react: EmailTemplate({username,verifyCode})
    })



    if(error){

        console.error('Error sending verification email:', error);    
        return {
            success: false,
            message: "Failed to send verification email",
            status:500
        }
    }


    return {
        success: true,
        message: 'Verification email sent successfully'
    }
}