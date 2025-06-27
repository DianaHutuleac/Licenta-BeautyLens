import axios from "axios";

export async function updateSkinType(userId, skinType, token) {
  const response = await axios.put(
    `http://localhost:8080/user/${userId}/skin-type`,
    { skinType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
