import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/home/Home";
import { DocsPage } from "./components/docs/DocsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/docs" element={<DocsPage />}></Route>
      </Routes>
   </BrowserRouter>
  )
}

export default App
