import React, { useState, useEffect } from "react";

const formStyle = {
  maxWidth: "300px",
  margin: "auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  backgroundColor: "#f4f4f4",
};

const labelStyle = {
  display: "block",
  margin: "10px 0",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  boxSizing: "border-box",
  borderRadius: "3px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#4caf50",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};

const headingStyle = {
  textAlign: "center",
  color: "#333",
};

const dropdownStyle = {
  position: "relative",
  top: "80%", // Adjust this value to fit your layout
  left: 0,
  width: "100%",
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "0 0 5px 5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  zIndex: 1,
};

function App() {
  const [courseUsers, setCourseUsers] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentID, setStudentID] = useState(0);
  const [studentPosts, setStudentPosts] = useState([]);
  const [studentComments, setStudentComments] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);

  useEffect(() => {
    fetch("/course_users")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setCourseUsers(data);
      });
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setStudentName(value);

    const filteredNames = courseUsers.filter((item) => {
      // console.log(item);
      return item.name.toLowerCase().includes(value.toLowerCase());
    });

    setFilteredNames(filteredNames);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(studentID);
    if (studentID === 0 || !studentName || studentName.length === 0) {
      alert("Please enter a valid student name!");
      return;
    }

    await fetch(`/user_activity?user_id=${studentID}&activity_type=post`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStudentPosts(data);
      });

    await fetch(`/user_activity?user_id=${studentID}&activity_type=comment`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStudentComments(data);
      });

    await fetch(`/user_activity?user_id=${studentID}&activity_type=question`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStudentQuestions(data);
      });

    await fetch(`/user_activity?user_id=${studentID}&activity_type=answer`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setStudentAnswers(data);
      });
  };

  return (
    <>
      <h1 style={headingStyle}>Ed Discussion Participation Scores</h1>
      <form style={formStyle} onSubmit={handleSubmit}>
        <label style={labelStyle}>
          Student Name:
          <input
            type="text"
            name="name"
            style={inputStyle}
            value={studentName}
            onChange={handleNameChange}
          />
          {filteredNames.length > 0 && (
            <div>
              {filteredNames.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setStudentName(item.name);
                    console.log(item.user_id);
                    setStudentID(item.user_id);
                    setFilteredNames([]);
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </label>
        <input
          type="submit"
          value="Get Participation Score"
          style={buttonStyle}
        />
      </form>
      <h3 style={headingStyle}>
        Number of questions: {studentQuestions.length}
      </h3>
      <h3 style={headingStyle}>Number of posts: {studentPosts.length}</h3>
      <h3 style={headingStyle}>Number of answers: {studentAnswers.length}</h3>
      <h3 style={headingStyle}>
        Number of GOOD comments: {studentComments.length}
      </h3>
    </>
  );
}

export default App;
