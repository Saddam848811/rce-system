import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState("let a=5\nlet b=10\nconsole.log((a+b),'javascript');");
  const [language, setLanguage] = useState("javascript");
  const [languageOption, setLanguageOption] = useState({
    c: 104,
    java: 91,
    javascript: 63,
    python: 70,
  });
  const [tokenKey, setTokenKey] = useState("");
  const [statusId, setStatusId] = useState("");
  const [output, setOutput] = useState("Run the code to get Output...");
  const [input, setInput] = useState("");

  const runCode = (e) => {
    e.preventDefault();
    axios
      .post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: code, 
          language_id: languageOption[language],
          stdin: input,
        },
        {
          headers: {
            'x-rapidapi-key': 'b39bf70c62msh50baca1833c77a4p10557ajsncfaf476d105c',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          },
        }
      )
      .then((response) => {
        setTokenKey(response.data.token);
        setStatusId(response.status);
      });
  };

  useEffect(() => {
    if (statusId === 201 && tokenKey) {
      setOutput("Processing...");
      const timer = setInterval(() => {
        axios
          .get(`https://judge0-ce.p.rapidapi.com/submissions/${tokenKey}`, {
            headers: {
              'x-rapidapi-key': 'b39bf70c62msh50baca1833c77a4p10557ajsncfaf476d105c',
              'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            },
          })
          .then((response) => {
            const status = response.data.status.id;
            if (status === 3) {
              setOutput(response.data.stdout);
            } else if (status === 2) {
              setOutput("Processing...");
            } else if (status === 11) {
              setOutput(response.data.stderr);
            } else if (status === 6) {
              setOutput(response.data.compile_output);
            }
          })
          .catch((error) => {
            setOutput("Error fetching result.");
          });
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [statusId, tokenKey]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">Code Runner</h1>
        <div className="language-buttons">
          <button onClick={() => { setLanguage('java'); setCode('class Main {\n public static void main(String[] args) {\n System.out.println("Welcome to Java!");\n } \n}'); }}>Java</button>
          <button onClick={() => { setLanguage('javascript'); setCode("let a=5\nlet b=10\nconsole.log((a+b),'javascript');"); }}>JavaScript</button>
          <button onClick={() => { setLanguage('c'); setCode('#include <stdio.h>\nint main() {\n printf("Hello, C!");\n return 0;\n}'); }}>C</button>
          <button onClick={() => { setLanguage('python'); setCode('print("Hello, Python!")'); }}>Python</button>
        </div>
      </header>
      <div className="main-content">
        <div className="editor-section">
          <Editor
            theme="vs-dark"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 9,
            }}
          />
        </div>
        <div className="input-output-section">
          <div className="input-area">
            <label htmlFor="input">Input:</label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input here..."
            />
          </div>
          <div className="output-area">
            <label htmlFor="output">Output:</label>
            <textarea id="output" value={output} readOnly />
          </div>
        </div>
      </div>
      <div className="footer">
        <button onClick={runCode}>Run Code</button>
      </div>
    </div>
  );
}

export default App;
