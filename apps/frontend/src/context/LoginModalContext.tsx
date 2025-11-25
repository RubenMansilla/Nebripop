import { createContext, useContext, useState } from "react";
import LoginPopup from "../components/LoginPopup/LoginPopup";
import RegisterPopup from "../components/RegisterPopup/RegisterPopup";

const LoginContext = createContext({
  openLogin: () => {},
  openRegister: () => {},
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
    setLoginOpen(false);
    setRegisterOpen(false);
  };

  return (
    <LoginContext.Provider value={{ openLogin, openRegister }}>
      {children}

      <LoginPopup open={loginOpen} onClose={closeAll} />
      <RegisterPopup open={registerOpen} onClose={closeAll} />
    </LoginContext.Provider>
  );
}
