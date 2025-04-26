import React from "react";

export default function BottlenecksList({ items }) {
  if (!items || items.length === 0) {
    return <div className="empty-list">No bottlenecks found</div>;
  }

  return (
    <div className="bottlenecks">
      <h2>Bottleneck Courses</h2>
      <table className="bottlenecks-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Name</th>
            <th># Unlocked</th>
            <th># Multi-Prereq</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.bottleneck_course}>
              <td>{b.bottleneck_course}</td>
              <td>{b.course_name}</td>
              <td>{b.total_unlocks}</td>
              <td>{b.multi_unlocks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
