import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";

import Home from "./pages/Home/Home.js";

export default function App() {
    return (
        <LoginModalProvider>
            <BrowserRouter>
                <Routes>

                    {/* HOME */}
                    <Route path="/" element={<Home />} />

                </Routes>
            </BrowserRouter>
        </LoginModalProvider>
    );
}
