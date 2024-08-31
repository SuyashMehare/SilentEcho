interface IApiResponse{
    success : boolean,
    message : string,
    status? : number,
}

export const ApiResponse = ({message,success,status}: IApiResponse) : IApiResponse =>{

    return {
        message,
        success,
        status
    }
}