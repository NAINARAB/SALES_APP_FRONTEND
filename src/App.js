import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/login/login";
import LoaderComp from "./pages/loadingScreen/loading";
import { routes } from "./AppRoutes";
import { ContextDataProvider } from './pages/contextApi';
import MainComponent from "./pages/AppLayout/layout";
import { api } from "./host";


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const localAuth = localStorage.getItem('user');
  const parsed = JSON.parse(localAuth);

  useEffect(() => {    
    const queryParams = new URLSearchParams(window.location.search);
    const Auth = queryParams.get('Auth') || parsed?.Autheticate_Id;

    if (Auth) {
      fetch(`${api}api/userAuth?Auth=${Auth}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data?.data[0]))
            setIsLogin(true);
          } else {
            setIsLogin(false)
          }
        })
        .catch(e => console.error(e))
        .finally(() => {
          const newUrl = window.location.pathname;
          window.history.pushState({}, document.title, newUrl);
          setIsLoading(false);
        })
    } else {
      setIsLoading(false);
    }

  }, [parsed]);

  const setLoginTrue = () => {
    setIsLogin(true);
  }

  const setLoading = (val) => {
    setIsLoading(val);
  }

  const toasterFun = (message, status) => {
    if (status === 1) {
      return toast.success(message)
    }
    if (status === 2) {
      return toast.warn(message)
    }
    if (status === 3) {
      return toast.error(message)
    }
    return toast(message || 'Message not supplied')
  }

  const logout = () => {
    localStorage.clear();
    setIsLogin(false);
    window.location = '/'
  }

  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        {isLoading && <LoaderComp />}
        {!isLogin ? (
          <Routes>
            <Route path="*" element={<Login setLogin={setLoginTrue} setLoading={setLoading} toast={toasterFun} />} />
          </Routes>
        ) : (
          <ContextDataProvider>
            <MainComponent logout={logout} toast={toasterFun} setLoading={setLoading}>
              <Routes>
                
                {routes.map((o, i) => (
                  <Route
                    key={i}
                    path={o?.path}
                    element={o.comp}
                    setLoading={setLoading}
                    toast={toasterFun}
                    storage={parsed}
                  />
                ))}

                <Route path="/invalid-credentials" element={(
                  <>
                    <div className="d-flex flex-column align-items-center justify-content-center p-5">
                      <h5 className="mb-2">You are not authorized user ☹️</h5>
                      <button
                        className="btn btn-primary rounded-5 px-5"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </button>
                    </div>
                  </>
                )} />

                <Route path="*" element={(
                  <>
                    <div className="d-flex flex-column align-items-center justify-content-center p-5">
                      <h5 className="mb-2">404 Page Not Found ☹️</h5>
                      <button
                        className="btn btn-primary rounded-5 px-5"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </button>
                    </div>
                  </>
                )} />

              </Routes>
            </MainComponent>
          </ContextDataProvider>
        )}
      </BrowserRouter >
    </>
  );
}

export default App;
