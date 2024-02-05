import React, { useState, useEffect, useRef } from "react";
import { CSVLink } from "react-csv";

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

const csvButtonStyle = {
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
  border: "2px solid #ccc",
  textAlign: "center",
};

const dropdownActivityStyle = {
  border: "2px solid #ccc",
};

const Dropdown = ({ label, data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h3 style={headingStyle} onClick={() => setIsOpen(!isOpen)}>
        {label} <span style={{ fontSize: "14px" }}>{isOpen ? "▲" : "▼"}</span>
      </h3>
      {isOpen && (
        <div style={{ listStyleType: "none", padding: 0 }}>
          {data.map((item, index) => (
            <div style={dropdownActivityStyle} key={index}>
              {item.document}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

  const [csvData, setCsvData] = useState([
    ["Name", "User ID", "Comments", "Questions", "Answers", "Posts"],
  ]);
  const csvLink = useRef();

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

  const generateCsvData = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const user of courseUsers) {
      try {
        const id = user.user_id;
        await fetch(`/user_activity?user_id=${id}&activity_type=all`)
          .then((res) => res.json())
          .then((data) => {
            var posts = 0;
            var comments = 0;
            var questions = 0;
            var answers = 0;
            console.log(data);
            for (let i = 0; i < data.length; i++) {
              if (data[i].type === "post") {
                posts++;
              } else if (data[i].type === "comment") {
                comments++;
              } else if (data[i].type === "question") {
                questions++;
              } else if (data[i].type === "answer") {
                answers++;
              }
            }
            const newRow = [user.name, id, comments, questions, answers, posts];
            console.log(newRow);
            setCsvData((csvData) => [...csvData, newRow]);
          });
        await delay(1); // Introduce a delay between requests
      } catch (error) {
        console.error(error);
        return;
      }
    }
    csvLink.current.link.click();
  };

  return (
    <>
      <h1 style={headingStyle}>Ed Discussion Participation Scores</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button type="button" style={csvButtonStyle} onClick={generateCsvData}>
          Download CSV
        </button>
        <CSVLink
          data={csvData}
          filename="user_participation.csv"
          className="hidden"
          ref={csvLink}
          target="_blank"
        />
      </div>
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
          {filteredNames.length > 0 && studentName.length > 0 && (
            <div>
              {filteredNames.map((item, index) => (
                <div
                  style={dropdownStyle}
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
      <Dropdown
        label={`Number of questions: ${studentQuestions.length}`}
        data={studentQuestions}
      />
      <Dropdown
        label={`Number of posts: ${studentPosts.length}`}
        data={studentPosts}
      />
      <Dropdown
        label={`Number of answers: ${studentAnswers.length}`}
        data={studentAnswers}
      />
      <Dropdown
        label={`Number of comments: ${studentComments.length}`}
        data={studentComments}
      />
    </>
  );
}

export default App;
