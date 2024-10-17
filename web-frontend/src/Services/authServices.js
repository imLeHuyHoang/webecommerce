import apiClient from "../utils/api-client";

function signup(user, profile) {
  const body = new FormData();
  body.append("name", user.name);
  body.append("email", user.email);
  body.append("password", user.password);
  body.append("delivery_address", profile.delivery_address);
  body.append("phone_number", profile.phone_number);
  body.append("profile_picture", profile.profile_picture);
  return apiClient.post("/signup", body);
}
