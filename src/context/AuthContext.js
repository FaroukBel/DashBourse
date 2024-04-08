import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";


export const Context = createContext();

export function AuthContext({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(false);
          setUser(user);
        });
        return ()   => {
            if (unsubscribe) {
                unsubscribe();
            }}
    }, []);
    const values = {
        user,
        setUser
    };
    return (
        <Context.Provider value={values}>
        
        {!loading &&
            children}
        </Context.Provider>
    );
    }

