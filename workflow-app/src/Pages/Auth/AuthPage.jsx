import React, { useState } from "react";
import "./AuthPage.css";

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginClick = () => {
    console.log("Login clicked, current state:", showLogin); // Debug log
    setShowLogin(true);
  };

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div className="signup-container">
        {/* Left Section */}
        <div className="left-section">
          <div className="brand">Acme Inc</div>
          <div className="testimonial">
            <blockquote>
              This library has saved me countless hours of work and helped me
              deliver stunning designs to my clients faster than ever before.
            </blockquote>
            <div className="author">Sofia Davis</div>
          </div>
        </div>

        {/* Right Section */}
        <div className="right-section">
          <div className="header">
            <div className="mobile-brand">Acme Inc</div>
            <button className="login-button" onClick={() => setShowLogin(true)}>
              Login
            </button>
          </div>

          <div className="form-container">
            <h1>Create an account</h1>
            <p>Enter your email below to create your account</p>

            <form className="signup-form">
              <input type="text" placeholder="Name" className="input-field" />
              <input
                type="email"
                placeholder="name@example.com"
                className="input-field"
              />
              <button type="submit" className="submit-button">
                Sign In with Email
              </button>
            </form>

            <div className="divider">OR CONTINUE WITH</div>

            <button className="github-button">
              <svg
                className="github-icon"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>

            <p className="terms">
              By clicking continue, you agree to our{" "}
              <a href="#" className="terms-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="terms-link">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className={`login-slide ${showLogin ? "show" : ""}`}>
          <div className="login-content">
            <h1 className="login-title">Login</h1>
            <p className="login-subtitle">
              Enter your email below to login to your account
            </p>

            <form className="login-form">
              <input
                type="email"
                placeholder="m@example.com"
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                className="login-input"
              />
              <button
                onClick={() => setShowLogin(false)}
                type="submit"
                className="login-submit-button"
              >
                Login
              </button>
            </form>

            <div className="login-alt-container">
              <button className="github-button">
                <svg
                  className="github-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Login With GitHub
              </button>
            </div>

            <p className="forgot-password">
              <a href="#" className="forgot-password-link">
                Forgot your password?
              </a>
            </p>

            <div className="switch-signup">
              Don&apos;t have an account?
              <button
                onClick={() => setShowLogin(false)}
                className="switch-signup-link"
              >
                Sign up
              </button>
            </div>
          </div>

          <button onClick={() => setShowLogin(false)} className="close-button">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
