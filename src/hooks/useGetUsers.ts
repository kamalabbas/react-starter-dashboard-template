
import { BaseResponse } from "@/interface/baseResponse.interface"
import { User } from "@/interface/user.interface"
import { getData } from "@/services/apiClient"
import { useQuery } from "@tanstack/react-query"

interface ResponseData {
    userList: User[]
}

const useGetUsers = () => {
    return useQuery<BaseResponse<ResponseData>, Error>({
        queryKey: ["users"],
        queryFn: () => getData<BaseResponse<ResponseData>>(`/Admin/GetAllUsers`)
    })
}

export default useGetUsers