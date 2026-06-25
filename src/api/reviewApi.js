import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from './axiosClient';

/**
 * Lấy tất cả đánh giá của shop (phân trang)
 * GET /api/seller/{idShop}/danh-gia
 */
export const getSellerReviews = (idShop, page = 1) => {
  return axiosClient.get(`/seller/${idShop}/danh-gia`, {
    params: { page }
  });
};

/**
 * Gửi phản hồi lại đánh giá của khách hàng
 * POST /api/seller/danh-gia/{id}
 */
export const replyReview = (idDanhGia, noiDungPhanHoi) => {
  return axiosClient.post(`/seller/danh-gia/${idDanhGia}`, {
    NoiDungPhanHoi: noiDungPhanHoi
  });
};

/**
 * Hook useQuery lấy danh sách đánh giá của shop
 */
export const useSellerReviews = (idShop, page = 1) => {
  return useQuery({
    queryKey: ['sellerReviews', idShop, page],
    queryFn: async () => {
      const res = await getSellerReviews(idShop, page);
      return res.data;
    },
    enabled: !!idShop,
    keepPreviousData: true,
    staleTime: 5000,
  });
};

/**
 * Hook useMutation phản hồi đánh giá khách hàng
 */
export const useReplyReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idDanhGia, noiDungPhanHoi }) => replyReview(idDanhGia, noiDungPhanHoi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerReviews'] });
    },
  });
};

