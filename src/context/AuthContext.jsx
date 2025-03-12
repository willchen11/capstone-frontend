import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();
  const [userID, setUserID] = useState(null);

  // Sync with MongoDB if user is authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const loginData = {
        auth0_id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      };

      // Send user data to Flask backend to sync with MongoDB
      const REACT_APP_AUTH_URL = process.env.REACT_APP_AUTH_URL;
      fetch(`${REACT_APP_AUTH_URL}/api/sync-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })
        .then((response) => response.json())
        .then((data) => {
          setUserID(data.userID);
        })
        .catch((error) => {
        });
    } else {
    }
  }, [isLoading, isAuthenticated, user]);


  return (
    <AuthContext.Provider
      value={{
        loginWithRedirect,
        logout,
        isAuthenticated,
        isLoading,
        user, // Provide the Auth0 user object directly
        userID // Provide the Mongo UserId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

