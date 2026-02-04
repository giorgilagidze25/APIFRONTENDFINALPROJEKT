/**
 * Subject Selection Page
 * Beautiful subject selection UI
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const colorConfig = {
  blue: { 
    bg: 'from-blue-500 to-blue-600', 
    light: 'bg-blue-50', 
    border: 'border-blue-200',
    selectedBg: 'bg-blue-500',
    hover: 'hover:border-blue-400'
  },
  green: { 
    bg: 'from-green-500 to-green-600', 
    light: 'bg-green-50', 
    border: 'border-green-200',
    selectedBg: 'bg-green-500',
    hover: 'hover:border-green-400'
  },
  yellow: { 
    bg: 'from-yellow-500 to-yellow-600', 
    light: 'bg-yellow-50', 
    border: 'border-yellow-200',
    selectedBg: 'bg-yellow-500',
    hover: 'hover:border-yellow-400'
  },
  red: { 
    bg: 'from-red-500 to-red-600', 
    light: 'bg-red-50', 
    border: 'border-red-200',
    selectedBg: 'bg-red-500',
    hover: 'hover:border-red-400'
  },
  purple: { 
    bg: 'from-purple-500 to-purple-600', 
    light: 'bg-purple-50', 
    border: 'border-purple-200',
    selectedBg: 'bg-purple-500',
    hover: 'hover:border-purple-400'
  },
  orange: { 
    bg: 'from-orange-500 to-orange-600', 
    light: 'bg-orange-50', 
    border: 'border-orange-200',
    selectedBg: 'bg-orange-500',
    hover: 'hover:border-orange-400'
  }
};

const iconMap = {
  calculator: '🧮',
  atom: '⚛️',
  landmark: '🏛️',
  dna: '🧬',
  flask: '🧪',
  bookOpen: '📚'
};

function SubjectSelection() {
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const response = await axios.get(`${API_URL}/subjects`, getAuthHeaders());
      setSubjects(response.data.data);
      
      if (user?.selectedSubjects) {
        const ids = user.selectedSubjects.map(s => s._id || s);
        setSelectedIds(ids);
      }
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }

  function toggleSubject(id) {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  }

  async function saveSelections() {
    if (selectedIds.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/subjects/select`, { subjectIds: selectedIds }, getAuthHeaders());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save selections');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Choose Your Subjects</h1>
            <p className="text-sm text-gray-500">Select subjects to start learning</p>
          </div>
          <Link to="/dashboard" className="text-purple-600 hover:text-purple-800 font-medium">
            Skip for now →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Selection Counter */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            <span className="font-semibold text-purple-600">{selectedIds.length}</span> subject{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.map(subject => {
            const isSelected = selectedIds.includes(subject._id);
            const config = colorConfig[subject.color] || colorConfig.blue;
            const icon = iconMap[subject.icon] || '📚';

            return (
              <div
                key={subject._id}
                onClick={() => toggleSubject(subject._id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? `${config.light} ${config.border} shadow-lg scale-105` 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? `${config.selectedBg} border-transparent text-white` 
                    : 'border-gray-300 text-transparent'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* Subject Icon */}
                <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                  {icon}
                </div>

                {/* Subject Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{subject.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{subject.description}</p>

                {/* Difficulty Tags */}
                <div className="flex flex-wrap gap-2">
                  {subject.difficultyLevels?.map(level => (
                    <span 
                      key={level.name} 
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        isSelected ? 'bg-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {level.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={saveSelections}
            disabled={saving || selectedIds.length === 0}
            className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 ${
              saving || selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed transform-none' : ''
            }`}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Continue with {selectedIds.length} Subject{selectedIds.length !== 1 ? 's' : ''}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

export default SubjectSelection;
