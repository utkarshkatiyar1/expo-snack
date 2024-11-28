import axiosInstance from "./axiosInterceptor";

export const get = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response;
};

export const post = async (url: string, data: any) => {
  const response = await axiosInstance.post(url, data);
  return response;
};

export const put = async (url: string, data: any) => {
  const response = await axiosInstance.put(url, data);
  return response;
};

export const deleteCall = async (url: string, request: any = null) => {
  const response = await axiosInstance.delete(url, { data: request });
  return response;
};