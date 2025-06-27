import { createContext, useEffect, useReducer, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../services/authService";

export const AuthContext = createContext(null);

const emptyUser = {};
const initialState = { token: null, user: emptyUser };

function reducer(state, action) {
  switch (action.type) {
    case "SET_AUTH":
      return { token: action.token, user: action.user };
    case "CLEAR_AUTH":
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bootSplashDone, setBootSplashDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const user = await AsyncStorage.getItem("userData");
        if (token && user)
          dispatch({ type: "SET_AUTH", token, user: JSON.parse(user) });
        else dispatch({ type: "CLEAR_AUTH" });
      } finally {
        setBootSplashDone(true);
      }
    })();
  }, []);

  const saveAuthData = async (token, user) => {
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userData", JSON.stringify(user));
    dispatch({ type: "SET_AUTH", token, user });
  };

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    await saveAuthData(data.token, data.user);
  };

  const register = async (info) => {
    const data = await registerUser(info);
    await saveAuthData(data.token, data.user);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["authToken", "userData"]);
    dispatch({ type: "CLEAR_AUTH" });
  };

  const updateUser = async (newUser) => {
    await AsyncStorage.setItem("userData", JSON.stringify(newUser));
    dispatch({ type: "SET_AUTH", token: state.token, user: newUser });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        bootSplashDone,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
