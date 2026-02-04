/**
 * Quiz Page
 * AI-generated quizzes with modern, polished UI
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://aifinalprojekt.vercel.app/api';

function Quiz() {
  const { subjectId } = useParams();
  const { getAuthHeaders, refreshUser } = useAuth();
  
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchSubject();
  }, [subjectId]);

  async function fetchSubject() {
    try {
      const response = await axios.get(`${API_URL}/subjects/${subjectId}`, getAuthHeaders());
      setSubject(response.data.data);
      if (response.data.data.commonTopics?.length > 0) {
        setTopic(response.data.data.commonTopics[0]);
      }
    } catch (err) {
      setError('Failed to load subject');
    }
  }

  async function generateQuiz() {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz(null);
    setResult(null);
    setAnswers({});

    try {
      const response = await axios.post(
        `${API_URL}/quiz/generate`,
        { subjectId, topic, difficulty, questionCount: 5 },
        getAuthHeaders()
      );
      setQuiz(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionIndex, answerIndex) {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  }

  async function submitQuiz() {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSubmitting(true);
    setError(null);

    const questions = quiz.questions.map((q, i) => ({
      ...q,
      userAnswer: answers[i]
    }));

    try {
      const response = await axios.post(
        `${API_URL}/quiz/submit`,
        { subjectId, topic, difficulty, questions, timeTaken },
        getAuthHeaders()
      );
      setResult(response.data.data);
      refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }

  function startNewQuiz() {
    setQuiz(null);
    setResult(null);
    setAnswers({});
  }

  function getScoreColor(score) {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  }

  function getScoreBg(score) {
    if (score >= 80) return 'from-emerald-400 via-teal-500 to-cyan-500';
    if (score >= 60) return 'from-amber-400 via-orange-500 to-red-400';
    return 'from-rose-400 via-red-500 to-orange-400';
  }

  function getDifficultyColor(difficulty) {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  if (!subject && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full opacity-75 animate-pulse"></div>
            <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
          </div>
          <p className="mt-4 text-white/70 text-lg font-medium">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-200"
            >
              <span className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <span className="ml-2 font-medium">Back</span>
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {quiz ? quiz.topic : subject?.title}
              </h1>
              <p className="text-sm text-slate-500">
                {quiz ? `${quiz.questions.length} Questions • ${quiz.difficulty}` : 'Quiz'}
              </p>
            </div>
          </div>
          {!quiz && (
            <Link
              to={`/learn/${subjectId}`}
              className="group flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium">Study First</span>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center animate-shake">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Quiz Setup */}
        {!quiz && !result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-white/50">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready for a Challenge?</h2>
              <p className="text-slate-500">Test your knowledge with AI-powered questions</p>
            </div>
            
            {/* Quick Topics */}
            <div className="flex flex-wrap gap-3 mb-6">
              {subject?.commonTopics?.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    topic === t 
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Or type your own topic..."
                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              />
              
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="beginner">🟢 Beginner</option>
                <option value="intermediate">🟡 Intermediate</option>
                <option value="advanced">🔴 Advanced</option>
              </select>

              <button
                onClick={generateQuiz}
                disabled={loading}
                className={`group relative px-8 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {quiz && !result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-white/50">
            <div className="mb-8">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{quiz.topic}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-slate-500 text-sm">{quiz.questions.length} questions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-600">{Object.keys(answers).length}/{quiz.questions.length} answered</span>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((q, i) => (
                <div 
                  key={i} 
                  className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all duration-200"
                >
                  <div className="absolute -top-3 left-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-bold shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 text-lg mb-4 mt-2">{q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => selectAnswer(i, j)}
                        className={`group w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                          answers[i] === j 
                            ? 'border-violet-500 bg-violet-50 shadow-md' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-4 text-sm font-bold transition-colors ${
                            answers[i] === j 
                              ? 'bg-violet-500 text-white' 
                              : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                          }`}>
                            {String.fromCharCode(65 + j)}
                          </span>
                          <span className={`font-medium ${answers[i] === j ? 'text-violet-700' : 'text-slate-700'}`}>
                            {opt}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              disabled={submitting || Object.keys(answers).length < quiz.questions.length}
              className={`w-full mt-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center ${
                submitting || Object.keys(answers).length < quiz.questions.length 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Quiz
                </>
              )}
            </button>
          </div>
        )}

        {/* Quiz Result */}
        {result && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 text-center border border-white/50 animate-fade-in">
            {/* Score Circle */}
            <div className="relative inline-block mb-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${result.percentage * 5.53} 554`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-5xl font-bold ${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </span>
                  <p className="text-slate-500 text-sm mt-1">Score</p>
                </div>
              </div>
            </div>

            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative text-6xl">
                {result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '😊' : '💪'}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              {result.percentage >= 80 ? 'Outstanding!' : result.percentage >= 60 ? 'Great Job!' : 'Keep Going!'}
            </h2>
            <p className="text-slate-600 mb-6 text-lg">
              You got <span className="font-bold text-slate-900">{result.score}</span> out of <span className="font-bold text-slate-900">{result.totalQuestions}</span> questions correct
            </p>

            {result.suggestedDifficulty && (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl text-violet-700 text-sm mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-medium">Next time try:</span>
                <span className="capitalize font-bold">{result.suggestedDifficulty}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={startNewQuiz}
                className="group px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Another Quiz
              </button>
              <Link
                to="/dashboard"
                className="group px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Quiz;
