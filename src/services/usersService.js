import api from "./api";

export const getOwners = () => api.get("/users/owners");
