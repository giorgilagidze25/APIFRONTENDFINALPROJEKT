/**
 * Learning Page
 * AI-powered explanations with modern, polished UI
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

function Learning() {
  const { subjectId } = useParams();
  const { getAuthHeaders } = useAuth();
  
  const [subject, setSubject] = useState(null);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [error, setError] = useState(null);

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

  async function generateExplanation() {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await axios.post(
        `${API_URL}/learning/explain`,
        { subjectId, topic, difficulty },
        getAuthHeaders()
      );
      setExplanation(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      const response = await axios.post(
        `${API_URL}/learning/regenerate/${explanation.id}`,
        { difficulty },
        getAuthHeaders()
      );
      setExplanation(response.data.data);
    } catch (err) {
      setError('Failed to regenerate explanation');
    } finally {
      setRegenerating(false);
    }
  }

  // Animated loading dots
  function LoadingDots() {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  // Extract sections from content
  function parseContent(content) {
    if (!content) return [];
    
    const sections = [];
    const parts = content.split(/(?=^#{1,3}\s)/gm);
    
    parts.forEach(part => {
      if (part.trim()) {
        sections.push(part);
      }
    });
    
    return sections.length > 0 ? sections : [content];
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
          <p className="mt-4 text-white/70 text-lg font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <span className="ml-2 font-medium hidden sm:inline">Back</span>
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {subject?.title}
              </h1>
              <p className="text-sm text-slate-500">AI-Powered Learning</p>
            </div>
          </div>
          <Link
            to={`/quiz/${subjectId}`}
            className="group flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="font-medium">Take Quiz</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center animate-shake">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Topic Selection Card */}
        {!explanation && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-8 mb-8 border border-white/50">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">What would you like to learn?</h2>
            
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
                onClick={generateExplanation}
                disabled={loading}
                className={`group relative px-8 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center ${
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Explain
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-12 text-center border border-white/50">
            <div className="mb-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 mb-4">
                  <svg className="w-10 h-10 text-violet-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">AI is thinking...</h3>
            <p className="text-slate-500 mb-4">Generating a personalized explanation for "{topic}"</p>
            <LoadingDots />
          </div>
        )}

        {/* Explanation Display */}
        {explanation && !loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-white/50 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 px-6 py-6 relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="relative flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{explanation.topic}</h2>
                  <div className="flex items-center mt-3 space-x-4">
                    <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full capitalize border border-white/20 ${getDifficultyColor(explanation.difficulty)}`}>
                      {explanation.difficulty} Level
                    </span>
                    <span className="text-white/80 text-sm">
                      {new Date(explanation.generatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={regenerate}
                  disabled={regenerating}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                  title="Regenerate"
                >
                  <svg className={`w-5 h-5 text-white ${regenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                  {explanation.content}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 justify-between items-center">
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                >
                  <svg className={`w-5 h-5 transition-transform ${showReasoning ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-medium">{showReasoning ? 'Hide' : 'Show'} AI Reasoning</span>
                </button>
                
                <Link
                  to={`/quiz/${subjectId}`}
                  className="group px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Test Your Knowledge
                </Link>
              </div>

              {/* Reasoning Details */}
              {showReasoning && explanation.reasoning && (
                <div className="mt-6 p-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 animate-fade-in">
                  <h4 className="font-semibold text-violet-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Reasoning Process
                  </h4>
                  <p className="text-violet-700 text-sm leading-relaxed">{explanation.reasoning}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Learning;
