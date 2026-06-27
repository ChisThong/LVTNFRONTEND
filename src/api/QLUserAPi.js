import axiosClient from "./axiosClient"

export const getAlluser=(params={})=>{
    return axiosClient.get('/admin/Nguoidung',{params});
}
export const Lockuser=(id)=>{
    return axiosClient.put(`/admin/Nguoidung/${id}/ChangeClock`)
}
export const Capquyenadmin=(id)=>{
    return axiosClient.put(`/admin/Nguoidung/capquyen/${id}`);
}