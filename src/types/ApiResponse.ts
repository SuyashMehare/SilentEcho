export interface IApiResponse{
    success : boolean,
    message : string,
    status? : number,
    data?:object
}


export function ApiResponse (data: IApiResponse) : IApiResponse {

   return {
    success:data.success,
    message:data.message,
    data:data.data,
    status:data.status,
   }
}