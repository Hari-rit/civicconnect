import React, { useState } from "react";
import axios from "axios";

const ALL_SKILLS = [
  "Road Maintenance",
  "Waste Management",
  "Drainage & Sewage",
  "Water Supply",
  "Electrical Maintenance",
  "Traffic & Signals",
  "Tree & Obstruction Removal",
  "Animal Control",
  "Public Infrastructure Repair"
];

const WorkerSkillsPopup = ({ userId, onSaved }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    if (saving) return;

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
        {
          workerSkills: selectedSkills,
          skillsCompleted: true
        },
        {
          headers: { Authorization: `Bearer ${userId}` }
        }
      );

      onSaved();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to save skills"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <h5 className="mb-2">Select Your Specializations</h5>
          <p className="text-muted small">
            Choose the types of civic issues you are qualified to handle.
          </p>

          {ALL_SKILLS.map((skill) => (
            <div key={skill} className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id={skill}
                checked={selectedSkills.includes(skill)}
                disabled={saving}
                onChange={() => toggleSkill(skill)}
              />
              <label
                className="form-check-label"
                htmlFor={skill}
              >
                {skill}
              </label>
            </div>
          ))}

          <button
            className="btn btn-primary mt-4 w-100"
            disabled={saving}
            onClick={saveSkills}
          >
            {saving ? "Saving Skills..." : "Save Skills"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerSkillsPopup;