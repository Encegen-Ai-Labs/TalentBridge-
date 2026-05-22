import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPreferences, updatePreferences } from '../services/api';
import { toast } from 'react-toastify';
import './EditPreferences.css';

export default function EditPreferences() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [areasOfInterest, setAreasOfInterest] = useState([]);
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [interestSearch, setInterestSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  useEffect(() => {
    const fetchCurrentPreferences = async () => {
      try {
        const pref = await getPreferences();
        if (pref) {
          setAreasOfInterest(pref.areasOfInterest || []);
          setPreferredLocations(pref.preferredLocations || []);
          setCareerGoal(pref.careerGoal || '');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load preferences.');
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentPreferences();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePreferences({
        areasOfInterest,
        preferredLocations,
        careerGoal
      });
      toast.success('Preferences Updated Successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="preferences-loading-container">
        <div className="preferences-spinner"></div>
        <p>Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="preferences-page-wrapper">
      <div className="preferences-container-card">
        {/* HEADER */}
        <div className="preferences-card-header">
          <button type="button" className="btn-back-home" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <h1 className="preferences-main-title">Your preferences</h1>
          <p className="preferences-subtitle-desc">
            Update your career interests and location choices to match target openings.
          </p>
        </div>

        <form onSubmit={handleSave} className="preferences-form">
          {/* AREAS OF INTEREST */}
          <div className="pref-form-group">
            <label className="pref-field-label">Area(s) of interest</label>
            <div className="pref-search-tag-container">
              <input
                type="text"
                className="pref-text-input"
                placeholder="e.g. Graphic Design"
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (interestSearch.trim() && !areasOfInterest.includes(interestSearch.trim())) {
                      setAreasOfInterest([...areasOfInterest, interestSearch.trim()]);
                      setInterestSearch('');
                    }
                  }
                }}
              />
            </div>

            {/* Selected Tag Chips */}
            <div className="pref-selected-chips-row">
              {areasOfInterest.map((interest) => (
                <span key={interest} className="pref-green-tag-chip">
                  {interest}
                  <button
                    type="button"
                    className="pref-remove-tag-btn"
                    onClick={() => setAreasOfInterest(areasOfInterest.filter((t) => t !== interest))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="pref-suggestions-meta">
              <span>Also select the following to get more opportunities:</span>
              <div className="pref-suggested-pills-row">
                {['Film Making', 'Videography', 'Cinematography'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="pref-suggestion-pill"
                    onClick={() => {
                      if (!areasOfInterest.includes(suggestion)) {
                        setAreasOfInterest([...areasOfInterest, suggestion]);
                      }
                    }}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-popular-block">
              <label className="pref-sub-label">Popular career interests</label>
              <div className="pref-pills-grid">
                {[
                  'Sales', 'Data Entry', 'Digital Marketing', 'Web Development', 
                  'Marketing', 'Human Resources (HR)', 'General Management', 
                  'Social Media Marketing', 'Finance', 'Software Development', 
                  'Telecalling', 'Market/Business Research', 'Content Writing', 
                  'Accounts', 'Project Management', 'Client Servicing', 'Operations'
                ].map((interest) => {
                  const isSelected = areasOfInterest.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={`pref-interest-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setAreasOfInterest(areasOfInterest.filter((i) => i !== interest));
                        } else {
                          setAreasOfInterest([...areasOfInterest, interest]);
                        }
                      }}
                    >
                      {interest} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PREFERRED CITIES */}
          <div className="pref-form-group" style={{ marginTop: '2.5rem' }}>
            <label className="pref-field-label">Preferred city for jobs/internships (Maximum 3)</label>
            <input
              type="text"
              className="pref-text-input"
              placeholder="e.g. Pune"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (locationSearch.trim() && preferredLocations.length < 3 && !preferredLocations.includes(locationSearch.trim())) {
                    setPreferredLocations([...preferredLocations, locationSearch.trim()]);
                    setLocationSearch('');
                  }
                }
              }}
            />

            {/* Selected locations */}
            <div className="pref-selected-chips-row">
              {preferredLocations.map((loc) => (
                <span key={loc} className="pref-green-tag-chip pref-location-chip">
                  {loc}
                  <button
                    type="button"
                    className="pref-remove-tag-btn"
                    onClick={() => setPreferredLocations(preferredLocations.filter((t) => t !== loc))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="pref-popular-block">
              <div className="pref-pills-grid">
                {['Pune', 'Mumbai', 'Delhi / NCR', 'Bangalore', 'Hyderabad', 'Chennai'].map((loc) => {
                  const isSelected = preferredLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      className={`pref-interest-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setPreferredLocations(preferredLocations.filter((l) => l !== loc));
                        } else if (preferredLocations.length < 3) {
                          setPreferredLocations([...preferredLocations, loc]);
                        } else {
                          toast.warning('Maximum 3 preferred cities allowed.');
                        }
                      }}
                    >
                      {loc} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CAREER GOALS */}
          <div className="pref-form-group" style={{ marginTop: '2.5rem' }}>
            <label className="pref-field-label">What is your current career goal?</label>
            <div className="pref-goals-list">
              {[
                'Get an online degree from a premium institute in India',
                'Go for study abroad',
                'Enroll in job-guaranteed training to get a job',
                'Prepare for government exams'
              ].map((goal) => (
                <label key={goal} className="pref-goal-option">
                  <input
                    type="radio"
                    name="careerGoal"
                    checked={careerGoal === goal}
                    onChange={() => setCareerGoal(goal)}
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pref-form-footer">
            <button
              type="submit"
              className="btn-save-preferences"
              disabled={loading}
            >
              {loading ? 'Saving Preferences...' : 'Save Preferences ➔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
