import { ExpertVideoDto, ExpertVideoCreateUpdateDto } from "../../types/dtos/ExpertVideoDto";
import axiosInstance from "../auth/axiosInstance.ts";

export const expertVideoService = {
  async fetchLatest(limit = 4): Promise<ExpertVideoDto[]> {
    const res = await axiosInstance.get<ExpertVideoDto[]>("/expert-videos/latest", {
      params: { limit },
    });
    return res.data;
  },

  async fetchPage(page = 1, pageSize = 20) {
    const res = await axiosInstance.get<{
      items: ExpertVideoDto[];
      total: number;
      page: number;
      pageSize: number;
    }>("/expert-videos", {
      params: { page, pageSize },
    });
    return res.data;
  },

  async create(payload: ExpertVideoCreateUpdateDto) {
    const res = await axiosInstance.post<ExpertVideoDto>("/expert-videos", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<ExpertVideoCreateUpdateDto>) {
    const res = await axiosInstance.put<ExpertVideoDto>(`/expert-videos/${id}`, payload);
    return res.data;
  },

  async remove(id: string) {
    await axiosInstance.delete(`/expert-videos/${id}`);
  },

  async uploadThumbnail(id: string, file: File) {
    const formData = new FormData();
    formData.append("thumbnail", file);
    const res = await axiosInstance.post<ExpertVideoDto>(
      `/expert-videos/${id}/thumbnail-upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },
};
