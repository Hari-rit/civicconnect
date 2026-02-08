import React from "react";

const WorkerNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "skills" ? "active" : ""
            }`}
            onClick={() => setActiveTab("skills")}
          >
            My Skills
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "assigned" ? "active" : ""
            }`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned Works
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "available" ? "active" : ""
            }`}
            onClick={() => setActiveTab("available")}
          >
            Available Works
          </button>
        </li>
      </ul>
    </div>
  );
};

export default WorkerNavbar;
