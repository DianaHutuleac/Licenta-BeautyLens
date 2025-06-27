import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const uploadScan = async (
  userId,
  imageUri,
  resultSummary,
  token,
  ingredientInfoJson,
  recommendationsJson,
  productSafety
) => {
  const form = new FormData();

  form.append("userId", userId.toString());
  form.append("resultSummary", resultSummary);
  form.append("ingredientInfoJson", JSON.stringify(ingredientInfoJson));
  form.append("recommendationsJson", JSON.stringify(recommendationsJson));
  form.append("productSafety", productSafety);

  form.append("image", {
    uri: imageUri,
    name: imageUri.split("/").pop(),
    type: "image/jpeg",
  });

  const response = await axios.post(`${API_BASE_URL}/scans`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const fetchUserScans = async (userId, token) => {
  const response = await axios.get(`${API_BASE_URL}/scans/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
