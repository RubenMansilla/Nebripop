import { createContext, useContext, useState } from "react";
import LoginPopup from "../components/LoginPopup/LoginPopup";
import RegisterPopup from "../components/RegisterPopup/RegisterPopup";

interface LoginContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeAll: () => void;
}

const LoginContext = createContext<LoginContextType>({
  openLogin: () => {},
  openRegister: () => {},
  closeAll: () => {},
});

export function useLoginModal() {
  return useContext(LoginContext);
}

export function LoginModalProvider({ children }: any) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const closeAll = () => {
    // ✅ DEBUG: mira la consola y verás quién llama a closeAll
    console.log(new Error("closeAll llamado").stack);

    setLoginOpen(false);
    setRegisterOpen(false);
  };

  return (
    <LoginContext.Provider value={{ openLogin, openRegister, closeAll }}>
      {children}
      <LoginPopup open={loginOpen} onClose={closeAll} />
      <RegisterPopup open={registerOpen} onClose={closeAll} />
    </LoginContext.Provider>
  );
}
