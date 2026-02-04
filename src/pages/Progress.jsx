/**
 * Progress Dashboard Page
 * Beautiful progress tracking UI
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://aifinalprojekt.vercel.app/api';

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
  green: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
  red: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', bar: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' }
};

function Progress() {
  const { getAuthHeaders } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const response = await axios.get(`${API_URL}/progress/dashboard`, getAuthHeaders());
      setDashboard(response.data.data);
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Your Progress</h1>

          {/* ✅ Dashboard Button */}
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-md hover:opacity-90 transition"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome back, {dashboard?.user?.name}!
          </h2>
          <p className="text-slate-500">Track your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📝</div>
              <span className="text-green-500 text-sm font-medium">
                +{dashboard?.user?.stats?.totalQuizzes || 0} this week
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {dashboard?.user?.stats?.totalQuizzes || 0}
            </div>
            <div className="text-slate-500">Quizzes Completed</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl mb-4">🎯</div>
            <div className="text-3xl font-bold text-slate-800">
              {dashboard?.user?.stats?.averageScore || 0}%
            </div>
            <div className="text-slate-500">Average Score</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl mb-4">📚</div>
            <div className="text-3xl font-bold text-slate-800">
              {dashboard?.selectedSubjectsCount || 0}
            </div>
            <div className="text-slate-500">Subjects Selected</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl mb-4">💡</div>
            <div className="text-3xl font-bold text-slate-800">
              {dashboard?.recentExplanations?.length || 0}
            </div>
            <div className="text-slate-500">Explanations Viewed</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Subject Progress */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Subject Progress</h3>

            {dashboard?.subjectProgress?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.subjectProgress.map((subject, i) => {
                  const colors = colorMap[subject.color] || colorMap.blue;

                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${colors.bar}`}></div>

                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-800">
                            {subject.subject}
                          </span>
                          <span className="text-slate-500">
                            {subject.averageScore}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors.bar} transition-all duration-500`}
                            style={{ width: `${subject.averageScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 w-20 text-right">
                        {subject.totalQuizzes} quizzes
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No quiz data yet. Start learning!</p>

                <Link
                  to="/dashboard"
                  className="text-purple-600 hover:text-purple-800 font-medium mt-2 inline-block"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Quizzes */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Quizzes</h3>

            {dashboard?.recentQuizzes?.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentQuizzes.map((quiz, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-slate-800">{quiz.subject}</div>
                      <div className="text-sm text-slate-500">{quiz.topic}</div>
                    </div>

                    <div className={`font-bold ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {quiz.score}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No quizzes completed yet.</p>
              </div>
            )}
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Continue Learning</h3>

          <div className="flex flex-wrap gap-3">
            {dashboard?.user?.selectedSubjects?.map(subject => (
              <div key={subject._id} className="flex gap-2">
                <Link
                  to={`/learn/${subject._id}`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Study {subject.title}
                </Link>

                <Link
                  to={`/quiz/${subject._id}`}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Quiz
                </Link>
              </div>
            ))}

            <Link
              to="/subjects"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              More Subjects
            </Link>

            {/* ✅ Dashboard Quick Button */}
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

export default Progress;
