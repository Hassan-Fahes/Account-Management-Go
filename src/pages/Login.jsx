import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import cedar from '../assets/cedar.png';

function Login() {
  const [inputValue, setInputValue] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ errorUsername: "", errorPassword: "", incorrect: "" });

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const body = {
      username: inputValue.username,
      password: inputValue.password
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      credentials: 'include',
      body: JSON.stringify(body)
    };

    await fetch("http://localhost:8080/login", requestOptions)
      .then(response => response.json())
      .then(result => getResultLogin(result))
      .catch(error => console.error("Error:", error));

    function getResultLogin(result) {
      // console.log(result);
      if (result.status === "error") {
        setErrors({
          errorUsername: result.errors.username || "",
          errorPassword: result.errors.password || "",
          incorrect: "",
        });
      } else if (result.message === 'Incorrect username or password') {
        setErrors({
          errorUsername: "",
          errorPassword: "",
          incorrect: result.message,
        });
      } else {
        setErrors({ errorUsername: "", errorPassword: "", incorrect: "" });
        // console.log("result " +  JSON.stringify(result.message.id))
        setUser(JSON.stringify(result.message)); 
        localStorage.setItem("token" , result.token) ;
        navigate('/admin');     
      }
    }
  };

  return (
    <div className='flex flex-col mb-4 sm:flex-row sm:justify-center sm:items-center sm:h-screen'>
      <div className='sm:w-[50%] h-[50%] sm:h-[100%]'>
        <img className='sm:h-[100%] h-[100%] w-[100%]' src={cedar} alt="" />
      </div>
      <div className='sm:w-[50%] h-[50%] mt-10 flex justify-center flex-col items-center'>
        <h1 className='text-2xl font-bold text-blue-900'>Login</h1>
        <span className='text-sm mt-5 text-red-600 font-bold'>{errors.incorrect}</span>
        <form className='w-[80%] mt-5' action="">
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <label className='text-sm text-blue-800' htmlFor="username">Username</label>
              <span className='text-sm text-red-600 font-bold'> {errors.errorUsername} </span>
            </div>
            <input type="text" onChange={(e) => setInputValue({ ...inputValue, username: e.target.value })} className='border border-blue-900 p-3 h-8 rounded-md w-full' id="username" />
          </div>
          <div className='flex flex-col mt-4 gap-2'>
            <div className='flex gap-2'>
              <label className='text-sm text-blue-800' htmlFor="password">Password</label>
              <span className='text-red-600 text-sm font-bold'>{errors.errorPassword}</span>
            </div>
            <input type="password" onChange={(e) => setInputValue({ ...inputValue, password: e.target.value })} className='border border-blue-900 p-3 h-8 rounded-md w-full' id="password" />
          </div>
          <div className='flex flex-col mt-4 gap-2'>
            <label className='text-sm text-blue-800'>Language :</label>
            <div className='flex gap-4'>
              <div className='flex gap-1 items-center'>
                <input type="radio" className='' id="english" />
                <label className='text-sm font-bold text-blue-900' htmlFor="english">EN</label>
              </div>
              <div className='flex gap-1 items-center'>
                <input type="radio" className='' id="arabic" />
                <label className='text-sm font-bold text-blue-900' htmlFor="arabic">AR</label>
              </div>
            </div>
          </div>
          <div className='flex justify-center'>
            <button onClick={() => login()} type='button' className='w-[40%] h-10 mt-4 text-white rounded-md font-bold bg-blue-900'>Login</button>
          </div>
        </form>
        <p className='mt-4 mb-12 text-sm font-bold text-blue-950'>Cedars Software Solutions (CSS) <span className='text-blue-600'>CSS</span></p>
      </div>
    </div>
  );
}

export default Login;
