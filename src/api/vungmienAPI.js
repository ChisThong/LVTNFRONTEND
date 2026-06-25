import axiosClient from "./axiosClient"

export const getTinhThanh=()=>{
    return axiosClient.get('/tinh-thanh');
}