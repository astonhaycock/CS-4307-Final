// src/components/ScenarioPlanner.js

import React, { useState, useMemo } from 'react';

export default function ScenarioPlanner({ degreeProgress }) {
  // 1) Top‐level state/hooks
  const [toggles, setToggles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // 2) Course data
  const allCourses = degreeProgress?.courses || [];
  const totalRequired = degreeProgress?.total_credits_required || 0;

  // 3) Filter courses by search term
  const filteredCourses = useMemo(
    () =>
      allCourses.filter(c =>
        c.course_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allCourses, searchTerm]
  );

  // 4) Build a set of base completed courses
  const baseCompleted = useMemo(
    () => filteredCourses.filter(c => c.status === 'Completed').map(c => c.course_id),
    [filteredCourses]
  );

  // 5) Merge in hypothetical toggles
  const scenarioCompletedSet = useMemo(() => {
    const s = new Set(baseCompleted);
    Object.entries(toggles).forEach(([id, on]) => {
      if (on) s.add(id);
    });
    return s;
  }, [toggles, baseCompleted]);

  // 6) Toggle handler
  const handleToggle = courseId => {
    setToggles(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  // 7) Compute credits & percentage
  const completedCredits = allCourses
    .filter(c => scenarioCompletedSet.has(c.course_id))
    .reduce((sum, c) => sum + (c.credits || 0), 0);
  const progressPerc = totalRequired
    ? Math.round((completedCredits / totalRequired) * 100)
    : 0;

  // 8) Partition into available vs locked
  const available = [];
  const locked = [];
  allCourses.forEach(course => {
    if (scenarioCompletedSet.has(course.course_id)) return;
    const unmet = (course.prerequisites || []).filter(
      p => !scenarioCompletedSet.has(p.prereq_id)
    );
    unmet.length ? locked.push(course) : available.push(course);
  });

  // 9) Next‐best suggestions: count how many unlocks each available gives
  const suggestionCounts = useMemo(() => {
    const map = {};
    available.forEach(av => { map[av.course_id] = 0; });
    allCourses.forEach(target => {
      (target.prerequisites || []).forEach(p => {
        if (map[p.prereq_id] !== undefined) map[p.prereq_id]++;
      });
    });
    return Object.entries(map)
      .map(([course_id, unlocks]) => ({ course_id, unlocks }))
      .sort((a, b) => b.unlocks - a.unlocks);
  }, [available, allCourses]);

  // 10) Render
  return (
    <div className="scenario-planner">
      <h2>Best classes to take Next</h2>

      {/* Search toolbar */}
      <div className="planner-toolbar">
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Summary cards */}
      <div className="planner-summary-cards">
        <div className="card">
          <strong>{progressPerc}%</strong>
          <span>Complete</span>
        </div>
        <div className="card">
          <strong>{completedCredits}</strong>
          <span>Credits Earned</span>
        </div>
        <div className="card">
          <strong>{totalRequired - completedCredits}</strong>
          <span>Remaining</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="planner-grid">
        {/* Checklist */}
        <section className="course-checklist">
          <h3>Mark Completed</h3>
          {filteredCourses.map(c => (
            <div key={c.course_id} className="check-item">
              <label>
                <input
                  type="checkbox"
                  checked={scenarioCompletedSet.has(c.course_id)}
                  onChange={() => handleToggle(c.course_id)}
                />
                <span className="check-label">
                  {c.course_id} – {c.course_name}
                </span>
              </label>
            </div>
          ))}
        </section>

        {/* Available & Locked lists */}
        <section className="unlock-lists">
          <div className="list-panel">
            <h3>Available</h3>
            <ul>
              {available.map(c => (
                <li key={c.course_id}>{c.course_id}</li>
              ))}
            </ul>
          </div>
          <div className="list-panel">
            <h3>Locked</h3>
            <ul>
              {locked.map(c => (
                <li key={c.course_id}>{c.course_id}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next-best suggestions */}
        <section className="suggestions">
          <h3>Next Best Courses</h3>
          <ol>
            {suggestionCounts.slice(0, 10).map(s => (
              <li key={s.course_id}>
                {s.course_id}: unlocks {s.unlocks}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
