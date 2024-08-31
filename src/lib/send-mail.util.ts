import { EmailTemplate } from "@/components/email-template";
import { ApiResponse } from "@/utility/ApiResponse";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);



export default async function (username:string,to:string) {
    
    const verifyCode : string = String(Math.floor(Math.random()*1000000))

    const { data , error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: to,
        subject: 'Verfication code | SiltEcho',
        react: EmailTemplate({username,verifyCode})
    })



    if(error){
        return Response.json(
            ApiResponse({
                success : false,
                message : "Error while sending email",
                status : 500
            }),
            {status:500}
        )
    }

    return Response.json(
        ApiResponse({
            success:true,
            message: "Email send successfully",
            status:200
        }),
        {
            status:200
        }
    )
}