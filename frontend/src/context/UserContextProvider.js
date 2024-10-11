"use client";

import { createContext, useContext, useReducer } from "react";

const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

const userReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw Error(
        `Unknown action: ${action.type}. Remeber action type must be CAPITAL text.`,
      );
  }
};

const UserContextProvider = ({ children, initialValues = {} }) => {
  const [user, dispatch] = useReducer(userReducer, initialValues);

  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
export const useUserDispatch = () => useContext(UserDispatchContext);

export default UserContextProvider;
