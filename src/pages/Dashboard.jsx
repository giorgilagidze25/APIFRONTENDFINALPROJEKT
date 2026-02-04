/**
 * Dashboard Page
 * Main dashboard with modern design
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const colorMap = {
  blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-100', text: 'text-blue-800' },
  green: { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-100', text: 'text-emerald-800' },
  yellow: { bg: 'from-amber-500 to-yellow-500', light: 'bg-amber-100', text: 'text-amber-800' },
  red: { bg: 'from-rose-500 to-red-600', light: 'bg-rose-100', text: 'text-rose-800' },
  purple: { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-100', text: 'text-violet-800' },
  orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-100', text: 'text-orange-800' }
};

const iconMap = {
  calculator: '🧮',
  atom: '⚛️',
  landmark: '🏛️',
  dna: '🧬',
  flask: '🧪',
  bookOpen: '📚'
};

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const response = await axios.get(`${API_URL}/subjects/my-subjects`, getAuthHeaders());
      setSubjects(response.data.data);
    } catch (err) {
      if (err.response?.status === 404 || !err.response?.data?.data?.length) {
        navigate('/subjects');
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading your subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                LearnHub
              </h1>

              <Link
                to="/progress"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Progress
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* WELCOME */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-slate-500 mt-1">
            Continue your learning journey
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
              📝
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {user?.stats?.totalQuizzes || 0}
              </p>
              <p className="text-slate-500">Quizzes Completed</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-2xl shadow-md">
              🎯
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {user?.stats?.averageScore || 0}%
              </p>
              <p className="text-slate-500">Average Score</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-md">
              📚
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">
                {subjects.length}
              </p>
              <p className="text-slate-500">Subjects Selected</p>
            </div>
          </div>

        </div>

        {/* SUBJECTS */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Your Subjects</h3>

            <Link
              to="/subjects"
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              Change Subjects
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map(subject => {
                const colors = colorMap[subject.color] || colorMap.blue;
                const icon = iconMap[subject.icon] || '📚';

                return (
                  <div
                    key={subject._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className={`h-2 bg-gradient-to-r ${colors.bg}`} />

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-4xl">{icon}</span>

                        <div>
                          <h4 className="font-bold text-lg text-slate-800">
                            {subject.title}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {subject.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          to={`/learn/${subject._id}`}
                          className={`flex-1 py-2.5 rounded-xl text-center font-medium text-white bg-gradient-to-r ${colors.bg} hover:opacity-90 transition-all shadow-md`}
                        >
                          Learn
                        </Link>

                        <Link
                          to={`/quiz/${subject._id}`}
                          className="flex-1 py-2.5 rounded-xl text-center font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Quiz
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-xl font-semibold text-slate-800 mb-2">
                No subjects selected
              </h4>
              <p className="text-slate-500 mb-6">
                Choose subjects to start learning
              </p>

              <Link
                to="/subjects"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Select Subjects
              </Link>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">
                Ready to learn something new?
              </h3>
              <p className="text-indigo-100">
                Explore all subjects and start your learning journey today!
              </p>
            </div>

            <Link
              to="/subjects"
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Subjects
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
