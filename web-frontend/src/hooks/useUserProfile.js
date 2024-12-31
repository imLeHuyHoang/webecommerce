// src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import apiClient from "../utils/api-client";

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Lỗi fetch user:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const updateUser = async (updatedFields) => {
    try {
      setLoadingUser(true);
      const response = await apiClient.put("/user/profile", updatedFields);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi cập nhật user:", error);
      throw error;
    } finally {
      setLoadingUser(false);
    }
  };

  return {
    user,
    loadingUser,
    updateUser,
  };
}
