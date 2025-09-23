import { useQuery } from "@tanstack/react-query";
import { getData } from "../services/apiClient";
import { AxiosError } from "axios";

const useGetData = <T>() => {
  return useQuery<T, AxiosError>({
    queryKey: ["Leads"],
    queryFn: () => getData("/all"),
  });
};

export default useGetData;
