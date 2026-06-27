import axiosClient from "./axiosClient"

export const getAllDH=(params={})=>{
    return axiosClient.get('/admin/DonHang',{params})
}
export const xemchitiet=(id)=>{
    return axiosClient.get(`/admin/DonHang/${id}`)
}