import React, { useState, useEffect } from "react";
import "./styles.css";
import Dashboard from "./components/Dashboard";
import CourseGraph from "./components/CourseGraph";
import StudentInfo from "./components/StudentInfo";
import Navigation from "./components/Navigation";
import BottlenecksList from "./components/BottlenecksList";
import ScenarioPlanner from "./components/ScenarioPlanner";

const BASE_URL = "http://localhost:3001";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [degreeProgress, setDegreeProgress] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/students`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setStudents(data);
        if (data.length > 0) setSelectedStudent(data[0]);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Load student data when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent.student_id);
    }
  }, [selectedStudent]);

  const fetchStudentData = async (studentId) => {
    setLoading(true);
    try {
      // Fetch student courses
      let res = await fetch(`${BASE_URL}/api/students/${studentId}/courses`);
      if (!res.ok) throw new Error();
      const courses = await res.json();
      setStudentCourses(courses);

      // Fetch degree progress
      res = await fetch(`${BASE_URL}/api/students/${studentId}/degree-progress`);
      if (!res.ok) throw new Error();
      const progressData = await res.json();
      setDegreeProgress(progressData);

      // Fetch prerequisite graph data
      res = await fetch(`${BASE_URL}/api/students/${studentId}/prereq-graph`);
      if (!res.ok) throw new Error();
      const graph = await res.json();
      setGraphData(graph);

      // Fetch bottleneck courses for this major
      const majorId = progressData.major.major_id;
      res = await fetch(
        `${BASE_URL}/api/majors/${majorId}/bottlenecks`
      );
      if (!res.ok) throw new Error();
      const bott = await res.json();
      setBottlenecks(bott);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (student) => {
    setSelectedStudent(student);
    setError(null);
  };

  const renderContent = () => {
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!selectedStudent) return <div className="no-student">No student selected</div>;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            studentCourses={studentCourses}
            degreeProgress={degreeProgress}
          />
        );
      case "graph":
        return <CourseGraph graphData={graphData} />;
      case "bottlenecks":
        return <BottlenecksList items={bottlenecks} />;
      case "planner":
        return <ScenarioPlanner degreeProgress={degreeProgress} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Degree Tracker</h1>
      </header>
      <div className="app-container">
        <aside className="sidebar">
          <StudentInfo
            students={students}
            selectedStudent={selectedStudent}
            onStudentChange={handleStudentChange}
            degreeProgress={degreeProgress}
          />
        </aside>
        <main className="main-content">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="content-container">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

export default App;
