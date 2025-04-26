import React from "react";

function Dashboard({ studentCourses, degreeProgress }) {
  if (!degreeProgress) {
    return <div>No degree progress data available</div>;
  }

  // Group courses by status
  const completedCourses = degreeProgress.courses.filter(
    (course) => course.status === "Completed"
  );
  const inProgressCourses = degreeProgress.courses.filter(
    (course) => course.status === "In Progress"
  );
  const availableCourses = degreeProgress.courses.filter(
    (course) => course.status === "Available"
  );
  const lockedCourses = degreeProgress.courses.filter(
    (course) => course.status === "Locked"
  );

  return (
    <div className="dashboard">
      <h2>Degree Progress Dashboard</h2>

      <div className="progress-summary">
        <h3>Progress Summary</h3>
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value">
              {Math.round(degreeProgress.progress_percentage)}%
            </span>
            <span className="stat-label">Complete</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {degreeProgress.completed_credits}
            </span>
            <span className="stat-label">Credits Earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {degreeProgress.total_credits_required}
            </span>
            <span className="stat-label">Credits Required</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {degreeProgress.total_credits_required -
                degreeProgress.completed_credits}
            </span>
            <span className="stat-label">Credits Remaining</span>
          </div>
        </div>
      </div>

      <div className="courses-grid">
        <div className="course-group">
          <h3>Completed Courses ({completedCourses.length})</h3>
          <div className="course-list completed">
            {completedCourses.length > 0 ? (
              completedCourses.map((course) => (
                <div key={course.course_id} className="course-card">
                  <h4>
                    {course.course_id}: {course.course_name}
                  </h4>
                  <div className="course-details">
                    <span>{course.credits} credits</span>
                    <span>Grade: {course.grade || "N/A"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list">No completed courses</div>
            )}
          </div>
        </div>

        <div className="course-group">
          <h3>In Progress ({inProgressCourses.length})</h3>
          <div className="course-list in-progress">
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map((course) => (
                <div key={course.course_id} className="course-card">
                  <h4>
                    {course.course_id}: {course.course_name}
                  </h4>
                  <div className="course-details">
                    <span>{course.credits} credits</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list">No courses in progress</div>
            )}
          </div>
        </div>

        <div className="course-group">
          <h3>Available to Take ({availableCourses.length})</h3>
          <div className="course-list available">
            {availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <div key={course.course_id} className="course-card">
                  <h4>
                    {course.course_id}: {course.course_name}
                  </h4>
                  <div className="course-details">
                    <span>{course.credits} credits</span>
                    {course.prerequisites &&
                      course.prerequisites.length > 0 && (
                        <div className="prereqs">
                          <strong>Prerequisites:</strong>
                          <ul>
                            {course.prerequisites.map((prereq) => (
                              <li
                                key={prereq.prereq_id}
                                className={
                                  prereq.is_completed ? "completed" : ""
                                }
                              >
                                {prereq.prereq_id}: {prereq.prereq_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list">No available courses</div>
            )}
          </div>
        </div>

        <div className="course-group">
          <h3>Locked ({lockedCourses.length})</h3>
          <div className="course-list locked">
            {lockedCourses.length > 0 ? (
              lockedCourses.map((course) => (
                <div key={course.course_id} className="course-card">
                  <h4>
                    {course.course_id}: {course.course_name}
                  </h4>
                  <div className="course-details">
                    <span>{course.credits} credits</span>
                    {course.prerequisites &&
                      course.prerequisites.length > 0 && (
                        <div className="prereqs">
                          <strong>Prerequisites Needed:</strong>
                          <ul>
                            {course.prerequisites.map((prereq) => (
                              <li
                                key={prereq.prereq_id}
                                className={
                                  prereq.is_completed ? "completed" : ""
                                }
                              >
                                {prereq.prereq_id}: {prereq.prereq_name}
                                {prereq.is_completed
                                  ? " (Completed)"
                                  : " (Not completed)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-list">No locked courses</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
