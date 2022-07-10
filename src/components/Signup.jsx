import React, { useState } from "react";
import axios from "axios";

export default function Signup({ setIsSignedup }) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const userNameChange = (e) => {
    setUserName(e.target.value);
  };

  const userEmailChange = (e) => {
    setUserEmail(e.target.value);
  };

  const userPasswordChange = (e) => {
    setUserPassword(e.target.value);
  };

  const handleSignup = () => {
    const newUser = {
      name: userName,
      email: userEmail,
      password: userPassword,
    };

    axios
      .post("/signup", newUser)
      .then((result) => {
        setIsSignedup("");
        console.log(result.data);
        alert("user registered, please log in now!");
      })
      .catch((error) => {
        console.log("Error message: ", error);
      });

    setUserName("");
    setUserEmail("");
    setUserPassword("");
  };

  return (
    <div>
      <div>
        <h5>Create account</h5>
      </div>
      <input
        type="text"
        value={userName}
        onChange={userNameChange}
        placeholder="Name"
      />
      <input
        type="text"
        value={userEmail}
        onChange={userEmailChange}
        placeholder="Email"
      />
      <input
        type="password"
        value={userPassword}
        onChange={userPasswordChange}
        placeholder="Password"
      />
      <button type="button" onClick={handleSignup}>
        SIGN UP
      </button>
    </div>
  );
}
