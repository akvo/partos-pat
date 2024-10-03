"use client";

import { createContext, useContext, useReducer } from "react";

const SessionContext = createContext(null);
const SessionDispatchContext = createContext(null);
const initialValues = {
  loading: false,
  saving: false,
  step: 0,
  session: {
    fetched: false,
    summary: null,
    notes: null,
  },
  comments: {
    fetched: false,
    data: [],
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
    case "SAVING_TRUE":
      return {
        ...state,
        saving: true,
      };
    case "STOP_LOADING":
      if (state.saving) {
        return {
          ...state,
          saving: false,
        };
      }
      if (state.loading) {
        return {
          ...state,
          loading: false,
        };
      }
      return state;

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

    case "COMMENT_FETCHED":
      return {
        ...state,
        comments: {
          ...state.comments,
          fetched: true,
        },
      };

    case "COMMENT_UPDATE":
      return {
        ...state,
        comments: {
          ...state.comments,
          data: action?.payload || state.comments.data,
        },
      };

    case "RESET":
      return initialValues;
    case "STEP_NEXT":
      return {
        ...state,
        step: state.step + 1,
      };
    case "STEP_BACK":
      return {
        ...state,
        step: state.step - 1,
      };
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
