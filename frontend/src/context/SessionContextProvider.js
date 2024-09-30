"use client";

import { createContext, useContext, useReducer } from "react";

const SessionContext = createContext(null);
const SessionDispatchContext = createContext(null);
const initialValues = {
  loading: false,
  saving: false,
  session: {
    fetched: false,
    summary: null,
    notes: null,
    comments: [],
  },
  decisions: {
    fetched: false,
    data: [],
  },
};

const patSessionReducer = (state, action) => {
  switch (action.type) {
    case "LOADING_TRUE":
      return {
        ...state,
        loading: true,
      };
    case "LOADING_FALSE":
      return {
        ...state,
        loading: false,
      };
    case "SAVING_TRUE":
      return {
        ...state,
        saving: true,
      };
    case "SAVING_FALSE":
      return {
        ...state,
        saving: false,
      };
    case "DECISION_FETCHED":
      return {
        ...state,
        decisions: {
          ...state.decisions,
          fetched: true,
        },
      };
    case "DECISION_UPDATE":
      return {
        ...state,
        decisions: {
          ...state.decisions,
          data: action?.payload || state.decisions.data,
        },
      };
    case "RESET":
      return initialValues;
    default:
      throw Error(
        `Unknown action: ${action.type}. Remeber action type must be CAPITAL text.`
      );
  }
};

const SessionContextProvider = ({ children }) => {
  const [patSession, dispatch] = useReducer(patSessionReducer, initialValues);

  return (
    <SessionContext.Provider value={patSession}>
      <SessionDispatchContext.Provider value={dispatch}>
        {children}
      </SessionDispatchContext.Provider>
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext);
export const useSessionDispatch = () => useContext(SessionDispatchContext);

export default SessionContextProvider;
