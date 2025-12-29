'use client';

import { createEmptyEducation, Education } from '@/app/models/Education';
import { searchDegrees } from '@/lib/degreesApiClient';
import {
  getUniversityLogoUrl,
  searchUniversities,
  University,
} from '@/lib/universitiesApiClient';
import { useState } from 'react';

interface EducationSectionProps {
  educations: Education[];
  onUpdate: (educations: Education[]) => void;
}

export default function EducationSection({
  educations,
  onUpdate,
}: EducationSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [formData, setFormData] = useState<Education>(createEmptyEducation());

  // University autocomplete state
  const [universitySuggestions, setUniversitySuggestions] = useState<
    University[]
  >([]);
  const [showUniversitySuggestions, setShowUniversitySuggestions] =
    useState(false);
  const [selectedUniversityIndex, setSelectedUniversityIndex] = useState(-1);
  const [isSearchingUniversities, setIsSearchingUniversities] = useState(false);

  // Degree autocomplete state
  const [degreeSuggestions, setDegreeSuggestions] = useState<string[]>([]);
  const [showDegreeSuggestions, setShowDegreeSuggestions] = useState(false);
  const [selectedDegreeIndex, setSelectedDegreeIndex] = useState(-1);

  const handleAdd = () => {
    setShowForm(true);
    setEditingEdu(null);
    setFormData(createEmptyEducation());
  };

  const handleEdit = (edu: Education) => {
    setEditingEdu(edu);
    setFormData(edu);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(educations.filter(edu => edu.id !== id));
  };

  const handleSave = () => {
    if (editingEdu) {
      onUpdate(
        educations.map(edu => (edu.id === editingEdu.id ? formData : edu))
      );
    } else {
      const newEdu: Education = {
        ...formData,
        id: Date.now().toString(),
      };
      onUpdate([...educations, newEdu]);
    }
    setShowForm(false);
    setEditingEdu(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEdu(null);
  };

  const updateField = (field: keyof Education, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, ''],
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index: number) => {
    if (formData.achievements.length > 1) {
      const newAchievements = formData.achievements.filter(
        (_, i) => i !== index
      );
      setFormData({ ...formData, achievements: newAchievements });
    }
  };

  // Handle university search with debouncing
  const handleInstitutionChange = async (value: string) => {
    updateField('institution', value);
    setSelectedUniversityIndex(-1);

    if (value.trim().length >= 2) {
      setIsSearchingUniversities(true);
      try {
        const results = await searchUniversities(value);
        setUniversitySuggestions(results);
        setShowUniversitySuggestions(results.length > 0);
      } catch (error) {
        console.error('Error searching universities:', error);
      } finally {
        setIsSearchingUniversities(false);
      }
    } else {
      setUniversitySuggestions([]);
      setShowUniversitySuggestions(false);
    }
  };

  // Select university from autocomplete
  const selectUniversity = (university: University) => {
    const location = university['state-province']
      ? `${university['state-province']}, ${university.country}`
      : university.country;

    setFormData({
      ...formData,
      institution: university.name,
      location: location,
      country: university.country,
      domain: university.domains[0] || '',
    });
    setShowUniversitySuggestions(false);
    setSelectedUniversityIndex(-1);
  };

  // Handle keyboard navigation for universities
  const handleUniversityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showUniversitySuggestions || universitySuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedUniversityIndex(prev =>
          prev < universitySuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedUniversityIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedUniversityIndex >= 0) {
          selectUniversity(universitySuggestions[selectedUniversityIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowUniversitySuggestions(false);
        setSelectedUniversityIndex(-1);
        break;
    }
  };

  // Handle degree search
  const handleDegreeChange = async (value: string) => {
    updateField('degree', value);
    setSelectedDegreeIndex(-1);

    const results = await searchDegrees(value);
    setDegreeSuggestions(results);
    setShowDegreeSuggestions(results.length > 0);
  };

  // Select degree from autocomplete
  const selectDegree = (degree: string) => {
    updateField('degree', degree);
    setShowDegreeSuggestions(false);
    setSelectedDegreeIndex(-1);
  };

  // Handle keyboard navigation for degrees
  const handleDegreeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDegreeSuggestions || degreeSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDegreeIndex(prev =>
          prev < degreeSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDegreeIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDegreeIndex >= 0) {
          selectDegree(degreeSuggestions[selectedDegreeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDegreeSuggestions(false);
        setSelectedDegreeIndex(-1);
        break;
    }
  };

  const isFormValid = () => {
    return (
      formData.institution.trim() &&
      formData.degree.trim() &&
      formData.fieldOfStudy.trim() &&
      formData.location.trim() &&
      formData.startDate &&
      (formData.currentlyStudying || formData.endDate)
    );
  };

  return (
    <div className="w-full">
      {!showForm && (
        <>
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            Add your educational background and qualifications.
          </p>
          <button
            onClick={handleAdd}
            className="w-full md:w-auto px-6 py-3 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2929c9] transition-all duration-200 hover:scale-105 text-sm md:text-base"
          >
            + Add Education
          </button>

          {educations.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {educations.map(edu => (
                <div
                  key={edu.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 transition-all duration-200 hover:border-[#3b3be3] hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 flex-1">
                      {edu.domain && (
                        <div className="flex-shrink-0">
                          <img
                            src={getUniversityLogoUrl(edu.domain)}
                            alt={edu.institution}
                            className="w-14 h-14 object-contain rounded-lg bg-white border border-gray-200 p-2"
                            onError={e => {
                              // Fallback to favicon
                              (
                                e.target as HTMLImageElement
                              ).src = `https://www.google.com/s2/favicons?domain=${edu.domain}&sz=128`;
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {edu.degree} in {edu.fieldOfStudy}
                        </h3>
                        <p className="text-[15px] text-gray-600 mb-1">
                          {edu.institution} • {edu.location}
                        </p>
                        <p className="text-sm text-gray-500 italic">
                          {edu.startDate} -{' '}
                          {edu.currentlyStudying ? 'Present' : edu.endDate}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-700 mt-1 font-medium">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(edu)}
                        title="Edit"
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 rounded-lg text-gray-600 hover:bg-blue-50 hover:border-[#3b3be3] hover:text-[#3b3be3] transition-all duration-200"
                      >
                        <svg
                          className="w-[18px] h-[18px]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
                        title="Delete"
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 rounded-lg text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all duration-200"
                      >
                        <svg
                          className="w-[18px] h-[18px]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {edu.achievements.filter(a => a.trim()).length > 0 && (
                    <ul className="list-none pl-0 m-0">
                      {edu.achievements
                        .filter(a => a.trim())
                        .map((achievement, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 leading-relaxed pl-6 mb-2 relative before:content-['▹'] before:absolute before:left-0 before:text-[#3b3be3] before:font-bold before:text-lg"
                          >
                            {achievement}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 lg:p-8">
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">
            {editingEdu ? 'Edit' : 'Add'} Education
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div
              className="flex flex-col gap-2"
              style={{ position: 'relative' }}
            >
              <label className="text-sm font-medium text-gray-700">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Harvard University"
                value={formData.institution}
                onChange={e => handleInstitutionChange(e.target.value)}
                onKeyDown={handleUniversityKeyDown}
                onBlur={() => {
                  setTimeout(() => setShowUniversitySuggestions(false), 200);
                }}
                onFocus={() => {
                  if (
                    formData.institution.trim().length >= 2 &&
                    universitySuggestions.length > 0
                  ) {
                    setShowUniversitySuggestions(true);
                  }
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
              {showUniversitySuggestions &&
                universitySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-lg z-[1000]">
                    {universitySuggestions.map((university, index) => (
                      <div
                        key={index}
                        className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-200 last:border-b-0 flex items-center gap-3 ${
                          index === selectedUniversityIndex
                            ? 'bg-blue-50 text-[#3b3be3]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onMouseEnter={() => setSelectedUniversityIndex(index)}
                        onMouseDown={e => {
                          e.preventDefault();
                          selectUniversity(university);
                        }}
                      >
                        {university.domains[0] && (
                          <img
                            src={getUniversityLogoUrl(university.domains[0])}
                            alt={university.name}
                            className="w-8 h-8 object-contain rounded bg-white border border-gray-200 p-1"
                            onError={e => {
                              (
                                e.target as HTMLImageElement
                              ).src = `https://www.google.com/s2/favicons?domain=${university.domains[0]}&sz=64`;
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {university.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {university['state-province'] &&
                              `${university['state-province']}, `}
                            {university.country}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              {isSearchingUniversities && (
                <div className="text-xs text-gray-500 mt-1">Searching...</div>
              )}
            </div>
            <div
              className="flex flex-col gap-2"
              style={{ position: 'relative' }}
            >
              <label className="text-sm font-medium text-gray-700">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bachelor of Science"
                value={formData.degree}
                onChange={e => handleDegreeChange(e.target.value)}
                onKeyDown={handleDegreeKeyDown}
                onBlur={() => {
                  setTimeout(() => setShowDegreeSuggestions(false), 200);
                }}
                onFocus={async () => {
                  const results = await searchDegrees(formData.degree);
                  setDegreeSuggestions(results);
                  setShowDegreeSuggestions(results.length > 0);
                }}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
              {showDegreeSuggestions && degreeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-lg z-[1000]">
                  {degreeSuggestions.map((degree, index) => (
                    <div
                      key={index}
                      className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-200 last:border-b-0 text-sm ${
                        index === selectedDegreeIndex
                          ? 'bg-blue-50 text-[#3b3be3] font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => setSelectedDegreeIndex(index)}
                      onMouseDown={e => {
                        e.preventDefault();
                        selectDegree(degree);
                      }}
                    >
                      {degree}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Computer Science"
                value={formData.fieldOfStudy}
                onChange={e => updateField('fieldOfStudy', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Cambridge, MA"
                value={formData.location}
                onChange={e => updateField('location', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={formData.startDate}
                onChange={e => updateField('startDate', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                End Date{' '}
                {!formData.currentlyStudying && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="month"
                value={formData.endDate}
                onChange={e => updateField('endDate', e.target.value)}
                disabled={formData.currentlyStudying}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.currentlyStudying}
                onChange={e => {
                  updateField('currentlyStudying', e.target.checked);
                  if (e.target.checked) {
                    updateField('endDate', '');
                  }
                }}
                className="w-[18px] h-[18px] cursor-pointer accent-[#3b3be3]"
              />
              I currently study here
            </label>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700">
              GPA (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., 3.8/4.0"
              value={formData.gpa}
              onChange={e => updateField('gpa', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700">
              Achievements & Honors
            </label>
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., Dean's List, Published Research Paper"
                  value={achievement}
                  onChange={e => updateAchievement(index, e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
                />
                {formData.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(index)}
                    type="button"
                    className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 rounded-lg text-gray-600 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-all duration-200"
                  >
                    <svg
                      className="w-[18px] h-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAchievement}
              type="button"
              className="px-4 py-2.5 bg-transparent text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              + Add Achievement
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 bg-transparent text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-6 py-2.5 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2929c9] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3b3be3] disabled:hover:scale-100"
            >
              {editingEdu ? 'Update' : 'Save'} Education
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
