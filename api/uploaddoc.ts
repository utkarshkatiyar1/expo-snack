import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const FormData= global.FormData;

interface GetPresignedUrlResponse {
  postForm: {
    acl: string;
    algorithm: string;
    bucket: string;
    content_type: string;
    credential: string;
    date: string;
    key: string;
    policy: string;
    signature: string;
    success_action_status: string;
  };
  signedURL: string;
}

export async function getPresignedUrl(resourcename: string, filename: string) {
  // const response = await axios.get({
  //   url: `${process.env.NEXT_PUBLIC_API_SERVICE}admin/protected_signed_url`,
  //   method: "GET",
  //   params: {
  //     resource_name: resourceName,
  //     filename,
  //   },
  // });
  // return response.data;
  const token = await AsyncStorage.getItem("auth_token");
  try {
    const response = await axios.get(
      `https://api-staging.loannetwork.app/api/protected_signed_url`,
      {
        params: {
          resource_name: resourcename,
          filename,
        },
        headers: {
          Authorization: `Bearer ${token}`, // Pass the authorization token here
        },
      }
    );
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    alert("An error has occurred");
    console.log("error", error);
  }
}

// export interface FileDoc
// {
//   uri: string;
//   type: string;
//   name: string;
// }
interface Params {
  uploadUrl: string;
  uri:string;
  name:string;
  payload: GetPresignedUrlResponse["postForm"];
}

export async function uploadToS3({ uploadUrl, uri,name, payload }: Params) {
  const formData = new FormData();

  formData.append("key", payload.key);
  formData.append("acl", payload.acl);
  formData.append("success_action_status", payload.success_action_status);
  formData.append("Policy", payload.policy);
  formData.append("Content-Type", payload.content_type);
  formData.append("x-amz-signature", payload.signature);
  formData.append("x-amz-date", payload.date);
  formData.append("x-amz-algorithm", payload.algorithm);
  formData.append("x-amz-credential", payload.credential);

formData.append("file",{
  uri: uri,
  type: "image/jpeg",
  name: "test.jpg",
} as any);

  console.log("formData", formData);
  try {
    console.log("res", formData);
    const res = await axios.post(uploadUrl, formData,    
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("res2", res.data);
    return res.data;
  } catch (error) {
    console.log("error", error);
    alert("An error has occurred");
  }
}


export async function getFileUrl(key: string) {
  const token = await AsyncStorage.getItem("auth_token");
  const response = await axios<{ url: string }>({
    url: `https://api-staging.loannetwork.app/api/get_url`,
    method: "GET",
    params: { key },
    headers: {
      Authorization: `Bearer ${token}`, // Pass the authorization token here
    },
  });
  return response.data.url;
}