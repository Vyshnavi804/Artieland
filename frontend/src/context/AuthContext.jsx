import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("artieland_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("artieland_user", JSON.stringify(user));
    else localStorage.removeItem("artieland_user");
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("artieland_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (username, email, password) => {
    const { data } = await api.post("/auth/signup", { username, email, password });
    localStorage.setItem("artieland_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("artieland_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
