import React from 'react';
import '../styles/Signup.css';
import { Link } from 'react-router-dom';
import { signup } from '../api';


const Signup = () => {
  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form>
        <input type="text" placeholder="Username" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">SIGN UP</button>
        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;