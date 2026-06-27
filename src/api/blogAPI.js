import axiosClient from "./axiosClient";
export const getBaiViet =(params={})=>{
    return axiosClient.get('/admin/BlogControl',{params});
}
export const createBaiViet = (formData) => {
    return axiosClient.post('/admin/BlogControl', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
    });
};
export const updateBaiViet = (id,formData)=>{
    return axiosClient.post(`/admin/BlogControl/${id}`,formData);
}
export const deleteBaiViet = (id)=>{
    return axiosClient.delete(`/admin/BlogControl/${id}`);
}
