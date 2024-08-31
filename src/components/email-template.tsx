export interface EmailTemplateProps{
    username : string;
    verifyCode :string;
}


export const EmailTemplate = (props: EmailTemplateProps) => {

    return <div>
        <h1>Hello {props.username},</h1>
        <div>
            Here is your Verification Code: {props.verifyCode}
        </div>
    </div>
}

