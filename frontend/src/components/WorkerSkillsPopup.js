import React, { useState } from "react";
import axios from "axios";

const ALL_SKILLS = [
  "Garbage",
  "Pothole",
  "Water Leakage",
  "Electrical",
  "Road Sign"
];

const WorkerSkillsPopup = ({ userId, onSaved }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const saveSkills = async () => {
    if (selectedSkills.length === 0) {
      alert("Select at least one skill");
      return;
    }

    try {
      setSaving(true);
      await axios.put(
        "http://localhost:5000/worker/profile",
        { workerSkills: selectedSkills },
        { headers: { "x-user-id": userId } }
      );
      onSaved(); // tell dashboard to refresh
    } catch {
      alert("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <h5>Select Your Skills</h5>

          {ALL_SKILLS.map((skill) => (
            <div key={skill} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                onChange={() => toggleSkill(skill)}
              />
              <label className="form-check-label">{skill}</label>
            </div>
          ))}

          <button
            className="btn btn-primary mt-3"
            disabled={saving}
            onClick={saveSkills}
          >
            {saving ? "Saving..." : "Save Skills"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerSkillsPopup;
