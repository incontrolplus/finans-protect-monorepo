import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'wallestars_personal_dev';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const HABIT_CATEGORIES = [
  { id: 'health', label: 'Health & Fitness', color: 'text-green-400 bg-green-500/20' },
  { id: 'mental', label: 'Mental & Focus', color: 'text-blue-400 bg-blue-500/20' },
  { id: 'bad', label: 'Bad Habits', color: 'text-red-400 bg-red-500/20' },
  { id: 'learning', label: 'Learning', color: 'text-purple-400 bg-purple-500/20' },
  { id: 'social', label: 'Social & Family', color: 'text-pink-400 bg-pink-500/20' },
];

const DEFAULT_HABITS = [
  { id: 1, name: 'Gym / Workout', category: 'health', type: 'good', counter: 'daily', psychological: 'Discipline, endorphins, self-image' },
  { id: 2, name: 'Read 30 min', category: 'learning', type: 'good', counter: 'daily', psychological: 'Growth mindset, knowledge compound effect' },
  { id: 3, name: 'Journaling', category: 'mental', type: 'good', counter: 'daily', psychological: 'Self-awareness, processing emotions' },
  { id: 4, name: 'Procrastination', category: 'bad', type: 'bad', counter: 'daily', psychological: 'Fear of failure, perfectionism, dopamine seeking' },
  { id: 5, name: 'Healthy eating', category: 'health', type: 'good', counter: 'daily', psychological: 'Energy, mental clarity, longevity' },
  { id: 6, name: 'Call family', category: 'social', type: 'good', counter: 'weekly', psychological: 'Connection, support network, gratitude' },
  { id: 7, name: 'Late night screens', category: 'bad', type: 'bad', counter: 'daily', psychological: 'Dopamine, avoidance of silence, FOMO' },
  { id: 8, name: 'Meditation / Deep breathing', category: 'mental', type: 'good', counter: 'daily', psychological: 'Stress regulation, presence, clarity' },
];

const FITNESS_PLAN = {
  schedule: [
    { day: 'Monday', focus: 'Upper Body', exercises: ['Bench Press 4x8', 'Rows 4x10', 'OHP 3x8', 'Curls 3x12', 'Tricep dips 3x12'] },
    { day: 'Tuesday', focus: 'Cardio + Core', exercises: ['30 min run/bike', 'Planks 3x60s', 'Russian twists 3x20', 'Leg raises 3x15'] },
    { day: 'Wednesday', focus: 'Lower Body', exercises: ['Squats 4x8', 'RDL 4x10', 'Leg press 3x12', 'Calf raises 4x15', 'Lunges 3x10'] },
    { day: 'Thursday', focus: 'Rest / Light Walk', exercises: ['30 min walk', 'Stretching 15 min'] },
    { day: 'Friday', focus: 'Full Body', exercises: ['Deadlift 3x5', 'Pull-ups 4xmax', 'Dips 3x10', 'Face pulls 3x15', 'Farmer walks'] },
    { day: 'Saturday', focus: 'Active Recovery', exercises: ['Swimming / Sports', 'Yoga 30 min'] },
    { day: 'Sunday', focus: 'Rest', exercises: ['Complete rest', 'Meal prep'] },
  ],
  supplements: [
    { name: 'Creatine', dose: '5g/day', timing: 'Any time', purpose: 'Strength, muscle, cognitive' },
    { name: 'Vitamin D3', dose: '4000 IU/day', timing: 'Morning with fat', purpose: 'Immune, mood, bones' },
    { name: 'Omega-3', dose: '2g EPA+DHA', timing: 'With meals', purpose: 'Brain, heart, inflammation' },
    { name: 'Magnesium', dose: '400mg', timing: 'Before bed', purpose: 'Sleep, recovery, stress' },
    { name: 'Zinc', dose: '15-30mg', timing: 'With food', purpose: 'Immune, testosterone, recovery' },
  ],
  nutrition: [
    { meal: 'Breakfast', example: 'Oats + banana + protein + nuts', macros: '~500 cal, 30g protein' },
    { meal: 'Lunch', example: 'Chicken/fish + rice + vegetables', macros: '~700 cal, 45g protein' },
    { meal: 'Snack', example: 'Greek yogurt + berries + honey', macros: '~300 cal, 20g protein' },
    { meal: 'Dinner', example: 'Lean meat + sweet potato + salad', macros: '~600 cal, 40g protein' },
  ],
};

function PersonalDev() {
  const [activeTab, setActiveTab] = useState('journal');
  const [data, setData] = useState(loadData);

  // Journal
  const [journalEntry, setJournalEntry] = useState('');
  const [journalMotivation, setJournalMotivation] = useState('');
  const journals = data.journals || [];

  // Habits
  const [habits, setHabits] = useState(data.habits || DEFAULT_HABITS);
  const [habitLog, setHabitLog] = useState(data.habitLog || {});
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('health');
  const [newHabitType, setNewHabitType] = useState('good');

  // Mentors
  const [mentors, setMentors] = useState(data.mentors || [
    { id: 1, name: 'Mentor Example', area: 'Business', lesson: 'Consistency > intensity', linkedHabit: 'Journaling' },
  ]);
  const [newMentor, setNewMentor] = useState({ name: '', area: '', lesson: '', linkedHabit: '' });

  // Projects
  const [projects, setProjects] = useState(data.projects || [
    { id: 1, name: 'Diploma Project', progress: 0, deadline: '', tasks: [], notes: '' },
  ]);

  useEffect(() => {
    saveData({ journals, habits, habitLog, mentors, projects });
  }, [journals, habits, habitLog, mentors, projects]);

  const today = new Date().toISOString().split('T')[0];

  const addJournal = () => {
    if (!journalEntry.trim()) return;
    const updated = [...journals, {
      id: Date.now(),
      date: today,
      entry: journalEntry,
      motivation: journalMotivation,
      createdAt: new Date().toISOString(),
    }];
    setData(prev => ({ ...prev, journals: updated }));
    setJournalEntry('');
    setJournalMotivation('');
  };

  const toggleHabitDay = (habitId) => {
    const key = `${habitId}_${today}`;
    setHabitLog(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      setData(d => ({ ...d, habitLog: updated }));
      return updated;
    });
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const h = { id: Date.now(), name: newHabitName, category: newHabitCategory, type: newHabitType, counter: 'daily', psychological: '' };
    const updated = [...habits, h];
    setHabits(updated);
    setData(prev => ({ ...prev, habits: updated }));
    setNewHabitName('');
  };

  const addMentor = () => {
    if (!newMentor.name.trim()) return;
    const updated = [...mentors, { ...newMentor, id: Date.now() }];
    setMentors(updated);
    setData(prev => ({ ...prev, mentors: updated }));
    setNewMentor({ name: '', area: '', lesson: '', linkedHabit: '' });
  };

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const dateKey = `${habitId}_${d.toISOString().split('T')[0]}`;
      if (habitLog[dateKey]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const todayChecked = habits.filter(h => habitLog[`${h.id}_${today}`]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Personal Development</h1>
          <p className="text-gray-400 mt-1">
            Дневник, навици, фитнес, ментори и проекти
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400">
          Задачи 14, 15, 37, 38, 42, 48
        </span>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Today Habits', value: `${todayChecked}/${habits.length}`, color: 'text-green-400' },
          { label: 'Journal Entries', value: journals.length, color: 'text-blue-400' },
          { label: 'Bad Habits', value: habits.filter(h => h.type === 'bad').length, color: 'text-red-400' },
          { label: 'Mentors', value: mentors.length, color: 'text-purple-400' },
          { label: 'Projects', value: projects.length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-800/50 border border-dark-700 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'journal', label: 'Journal' },
          { id: 'habits', label: 'Habits' },
          { id: 'fitness', label: 'Fitness' },
          { id: 'mentors', label: 'Mentors' },
          { id: 'projects', label: 'Projects' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Journal Tab - Tasks 14, 15, 25 */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">What did life teach me today?</h2>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write what you learned today..."
              rows={4}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inner motivation / Safety net</label>
              <textarea
                value={journalMotivation}
                onChange={(e) => setJournalMotivation(e.target.value)}
                placeholder="What drives you? What's your safety net if things go wrong?"
                rows={2}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              />
            </div>
            <button onClick={addJournal} disabled={!journalEntry.trim()}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors">
              Save Entry
            </button>
          </motion.div>

          {journals.slice().reverse().map((j, idx) => (
            <motion.div key={j.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary-400 text-sm font-medium">{j.date}</span>
                <span className="text-gray-600 text-xs">{new Date(j.createdAt).toLocaleTimeString('bg-BG')}</span>
              </div>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">{j.entry}</p>
              {j.motivation && (
                <p className="text-gray-500 text-sm mt-2 italic border-l-2 border-primary-500/30 pl-3">{j.motivation}</p>
              )}
            </motion.div>
          ))}

          {journals.length === 0 && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No journal entries yet. Start writing above.</p>
            </div>
          )}
        </div>
      )}

      {/* Habits Tab - Tasks 37, 42 */}
      {activeTab === 'habits' && (
        <div className="space-y-4">
          {/* Add Habit */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 flex items-center space-x-3">
            <input value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} placeholder="New habit..."
              className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <select value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm">
              {HABIT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={newHabitType} onChange={(e) => setNewHabitType(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-300 text-sm">
              <option value="good">Good</option>
              <option value="bad">Bad</option>
            </select>
            <button onClick={addHabit} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Add</button>
          </div>

          {/* Habit Groups */}
          {HABIT_CATEGORIES.map(cat => {
            const catHabits = habits.filter(h => h.category === cat.id);
            if (catHabits.length === 0) return null;
            return (
              <div key={cat.id} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-dark-700">
                  <h3 className={`text-sm font-medium ${cat.color.split(' ')[0]}`}>{cat.label}</h3>
                </div>
                <div className="divide-y divide-dark-700/50">
                  {catHabits.map(habit => {
                    const checked = habitLog[`${habit.id}_${today}`];
                    const streak = getStreak(habit.id);
                    return (
                      <div key={habit.id} className="px-5 py-3 flex items-center space-x-4">
                        <button onClick={() => toggleHabitDay(habit.id)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            checked ? (habit.type === 'bad' ? 'bg-red-500 border-red-500' : 'bg-green-500 border-green-500') : 'border-dark-600 hover:border-gray-400'
                          }`}>
                          {checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{habit.name}</span>
                            {habit.type === 'bad' && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">bad</span>}
                          </div>
                          {habit.psychological && (
                            <p className="text-gray-600 text-xs mt-0.5">{habit.psychological}</p>
                          )}
                        </div>
                        {streak > 0 && (
                          <span className="text-xs text-yellow-400 font-medium">{streak}d streak</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fitness Tab - Task 48 */}
      {activeTab === 'fitness' && (
        <div className="space-y-6">
          {/* Weekly Schedule */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-white">Weekly Workout Plan</h2>
            </div>
            <div className="divide-y divide-dark-700/50">
              {FITNESS_PLAN.schedule.map((day, idx) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day.day;
                return (
                  <div key={day.day} className={`px-5 py-3 ${isToday ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-sm ${isToday ? 'text-primary-400' : 'text-white'}`}>
                        {day.day} {isToday && '(Today)'}
                      </span>
                      <span className="text-gray-500 text-xs">{day.focus}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.exercises.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 bg-dark-700/80 text-gray-400 text-xs rounded">{ex}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-white">Nutrition Plan</h2>
            </div>
            <div className="divide-y divide-dark-700/50">
              {FITNESS_PLAN.nutrition.map(meal => (
                <div key={meal.meal} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{meal.meal}</span>
                    <p className="text-gray-400 text-xs mt-0.5">{meal.example}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{meal.macros}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplements */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-white">Supplements</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplement</th>
                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dose</th>
                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timing</th>
                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {FITNESS_PLAN.supplements.map(s => (
                    <tr key={s.name}>
                      <td className="px-5 py-2.5 text-sm text-white">{s.name}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-300">{s.dose}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-400">{s.timing}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-500">{s.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mentors Tab - Task 42 */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Add Mentor / Role Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={newMentor.name} onChange={(e) => setNewMentor(p => ({ ...p, name: e.target.value }))} placeholder="Name"
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder-gray-500" />
              <input value={newMentor.area} onChange={(e) => setNewMentor(p => ({ ...p, area: e.target.value }))} placeholder="Area (Business, Health...)"
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder-gray-500" />
              <input value={newMentor.lesson} onChange={(e) => setNewMentor(p => ({ ...p, lesson: e.target.value }))} placeholder="Key lesson"
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder-gray-500" />
              <button onClick={addMentor} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Add</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentors.map((m, idx) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-dark-800/50 border border-dark-700 rounded-xl p-5">
                <h3 className="text-white font-medium">{m.name}</h3>
                <span className="text-primary-400 text-xs">{m.area}</span>
                {m.lesson && <p className="text-gray-400 text-sm mt-2 italic">"{m.lesson}"</p>}
                {m.linkedHabit && <p className="text-gray-600 text-xs mt-1">Linked habit: {m.linkedHabit}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Tab - Task 38 */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {projects.map((project, idx) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800/50 border border-dark-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-lg">{project.name}</h3>
                {project.deadline && <span className="text-gray-500 text-sm">Due: {project.deadline}</span>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-white text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <div className="flex space-x-2">
                <input type="range" min="0" max="100" value={project.progress}
                  onChange={(e) => {
                    const updated = projects.map(p => p.id === project.id ? { ...p, progress: parseInt(e.target.value) } : p);
                    setProjects(updated);
                    setData(prev => ({ ...prev, projects: updated }));
                  }}
                  className="flex-1" />
              </div>
              <textarea
                value={project.notes}
                onChange={(e) => {
                  const updated = projects.map(p => p.id === project.id ? { ...p, notes: e.target.value } : p);
                  setProjects(updated);
                  setData(prev => ({ ...prev, projects: updated }));
                }}
                placeholder="Project notes..."
                rows={3}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              />
            </motion.div>
          ))}

          <button
            onClick={() => {
              const updated = [...projects, { id: Date.now(), name: 'New Project', progress: 0, deadline: '', tasks: [], notes: '' }];
              setProjects(updated);
              setData(prev => ({ ...prev, projects: updated }));
            }}
            className="w-full px-4 py-3 border-2 border-dashed border-dark-600 rounded-xl text-gray-500 hover:text-gray-300 hover:border-dark-500 transition-colors"
          >
            + Add Project
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalDev;
