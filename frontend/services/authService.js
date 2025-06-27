import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export async function loginUser(email, password) {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
}

export async function registerUser(data) {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
}
