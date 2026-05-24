import React, { useState } from 'react'
import './styles/Login.css';
import Google_icon from '../Components/Assets/Frontend_Assets/google.png';

const Login = () => {

  const [isLogin, setIsLogin] = useState(true);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const [formData,setFormData] = useState({
    username:"",
    password:"",
    email:""
  })

  const changeHandler = (e) =>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }
  const login = async ()=>{
    console.log("login exe",formData)
    let responseData;

    await fetch('http://localhost:4000/login',{
      method:'POST',
      headers:{
        Accept:'application/form-data',
        'Content-Type':'application/json',

      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data)=>responseData = data)

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/");
    }else{
      alert(responseData.errors);
    }

  }

  const signup = async () =>{
    console.log("signup exe",formData)
    let responseData;

    await fetch('http://localhost:4000/signup',{
      method:'POST',
      headers:{
        Accept:'application/form-data',
        'Content-Type':'application/json',

      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data)=>responseData = data)

    if(responseData.success && responseData.requiresOtp){
      setOtpStep(true);
      setMessage(responseData.message || "OTP sent to your email");
    }else if(responseData.success){
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/");
    }else{
      alert(responseData.errors);
    }
  }

  const verifySignup = async () => {
    let responseData;

    await fetch('http://localhost:4000/verifySignup', {
      method: 'POST',
      headers: {
        Accept: 'application/form-data',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email, otp }),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      setMessage(responseData.errors);
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setOtpStep(false);
    setOtp("");
    setMessage("");
  }


  return (
    <div className='login'>
      <div className="login-container">
        <h1>{isLogin ? 'Login' : 'SignUp'}</h1>
        {!otpStep ? (
          <>
            {!isLogin && <input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder="Enter you'r name" />}
            <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder="Enter email address" required title='Email Should not be empty' />
            <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='password' minLength={4} required title='Should be of lenth >4' />
            {isLogin && <p className='forgot-password' >forgot password?</p>}
            <button onClick={()=>(isLogin? login(): signup())} className='login-btn'>
              <p>{isLogin ? 'Login' : 'Send OTP'}</p>
            </button>
          </>
        ) : (
          <>
            <p className="otp-copy">Enter the 6-digit OTP sent to {formData.email}</p>
            <input name='otp' value={otp} onChange={(event) => setOtp(event.target.value)} type="text" inputMode="numeric" maxLength={6} placeholder="6-digit OTP" />
            <button onClick={verifySignup} className='login-btn'>
              <p>Verify & Create Account</p>
            </button>
            <button onClick={signup} className='resend-btn'>Resend OTP</button>
          </>
        )}
        {message && <p className="login-message">{message}</p>}
        <div className="separator">
          <hr />
          <span>Signup/Login with Google</span>
          <hr />
        </div>
        <div className="google">
          <img src={Google_icon} alt="" />
          <p>Continue with google</p>
        </div>

        <div className='login-toggle'>
          <p>{isLogin ? "Don't have an Account?" : "Already have an account?"}</p>
          <span onClick={toggleForm} >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </div>

        <em>By clicking the login/signup
          you have accepted for the terms and condition </em>
      </div>

    </div>
  )
}

export default Login
