import React from "react";

function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="navigation">
      <ul>
        <li
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => onTabChange("dashboard")}
        >
          Dashboard
        </li>
        <li
          className={activeTab === "graph" ? "active" : ""}
          onClick={() => onTabChange("graph")}
        >
          Prerequisite Graph
        </li>
        <li
          className={activeTab === "bottlenecks" ? "active" : ""}
          onClick={() => onTabChange("bottlenecks")}
        >
          Bottlenecks
        </li>
        <li
          className={activeTab === "planner" ? "active" : ""}
          onClick={() => onTabChange("planner")}
        >
          Planner Optimizer
        </li>


      </ul>
    </nav>
  );
}

export default Navigation;