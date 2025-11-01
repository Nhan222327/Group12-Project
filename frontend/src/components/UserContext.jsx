import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  return <UserContext.Provider value={{ users, setUsers }}>{children}</UserContext.Provider>;
}
