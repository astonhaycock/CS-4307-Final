import React from "react";

function StudentInfo({
  students,
  selectedStudent,
  onStudentChange,
  degreeProgress,
}) {
  return (
    <div className="student-info">
      <h2>Student Information</h2>

      <div className="student-selector">
        <label htmlFor="student-select">Select Student:</label>
        <select
          id="student-select"
          value={selectedStudent ? selectedStudent.student_id : ""}
          onChange={(e) => {
            const studentId = parseInt(e.target.value);
            const student = students.find((s) => s.student_id === studentId);
            onStudentChange(student);
          }}
        >
          {students.map((student) => (
            <option key={student.student_id} value={student.student_id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="student-details">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">
              {selectedStudent.first_name} {selectedStudent.last_name}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{selectedStudent.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Enrollment Date:</span>
            <span className="info-value">
              {selectedStudent.enrollment_date}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Major:</span>
            <span className="info-value">{selectedStudent.major_name}</span>
          </div>

          {degreeProgress && (
            <div className="degree-progress-summary">
              <h3>Degree Progress</h3>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${degreeProgress.progress_percentage}%` }}
                ></div>
              </div>
              <div className="progress-details">
                <span>
                  {Math.round(degreeProgress.progress_percentage)}% Complete
                </span>
                <span>
                  {degreeProgress.completed_credits} /{" "}
                  {degreeProgress.total_credits_required} Credits
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentInfo;
