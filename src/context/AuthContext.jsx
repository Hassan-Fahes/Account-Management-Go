import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({
    user : null ,
    setUser : () => {} ,
    isLoading : true 
}) ;


export const AuthProvider = ({children}) => {
    const [user , setUser] = useState(null) ;
    const [isLoading , setIsLoading] = useState(true) ;

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const token = localStorage.getItem("token") ;
            const response = await fetch('http://localhost:8080/isLogin', {
              method: 'GET',
              credentials: 'include',
              headers: {
                "Authorization": `Bearer ${token}`,
              },
          
            });
            const data = await response.json();
            if (data.status === 'success' && data.user) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          } catch (err) {
            console.error('Error fetching authentication status:', err);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        };
      
        checkAuth();
      }, []);

      return <AuthContext.Provider value={{user , setUser , isLoading}}>
        {children}
      </AuthContext.Provider>
}