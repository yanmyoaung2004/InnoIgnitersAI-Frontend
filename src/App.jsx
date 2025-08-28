import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "react-quill-new/dist/quill.snow.css";
import Login from "./page/Login";
import { AuthProvider } from "./contexts/auth-context";
import Register from "./page/Register";
import ChatBot from "./page/ChatBot";
import Test from "./page/Test";

const routeConfig = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/", element: <ChatBot /> },
  { path: "/c/:chatId", element: <ChatBot /> },
  { path: "/test", element: <Test /> },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Navigate to="/" />} />
          {routeConfig.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
