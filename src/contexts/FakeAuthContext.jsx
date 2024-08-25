import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
};

const FAKE_USER = {
  name: "Jack",
  email: "jack@example.com",
  password: "qwerty",
  avatar: "https://i.pravatar.cc/100",
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case "logout":
      return initialState;
    default:
      throw new Error("Unknown action type");
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
    if (storedUser && storedIsAuthenticated === 'true') {
      dispatch({ type: "login", payload: JSON.parse(storedUser) });
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.setItem('isAuthenticated', state.isAuthenticated);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }, [state.isAuthenticated, state.user]);

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password) {
      dispatch({ type: "login", payload: FAKE_USER });
    }
  }

  function logout() {
    dispatch({ type: "logout" });
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Context was used outside Provider");
  return context;
}

export { AuthProvider, useAuth };
