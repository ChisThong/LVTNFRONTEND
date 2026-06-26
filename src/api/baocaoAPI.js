import axiosClient from "./axiosClient"

export const getThongKeDoanhThu=(params)=>{
    return axiosClient.get('/admin/baocao/thongkedoanhthu',{params});
}

export const getSellerThongKeDoanhThu=(params)=>{
    return axiosClient.get('/seller/baocao/thongkedoanhthu',{params});
}