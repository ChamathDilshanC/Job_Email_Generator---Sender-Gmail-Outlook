'use client';

import EducationSection from '@/app/components/EducationSection';
import { useTypewriter } from '@/app/components/TypewriterText';
import WorkExperienceSection from '@/app/components/WorkExperienceSection';
import { Education } from '@/app/models/Education';
import { WorkExperience } from '@/app/models/WorkExperience';
import {
  fetchSkillsForPosition,
  getPositionSuggestions,
} from '@/lib/skillsApiClient';
import { useState } from 'react';

export default function ResumeBuilder() {
  const [activeSection, setActiveSection] = useState('personal');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Work Experience State
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);

  // Education State
  const [educations, setEducations] = useState<Education[]>([]);

  // Skills state
  const [position, setPosition] = useState('');
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([]);
  const [showPositionSuggestions, setShowPositionSuggestions] = useState(false);
  const [allAvailableSkills, setAllAvailableSkills] = useState<string[]>([]); // All skills from API
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]); // Currently displayed
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkillSuggestions, setCustomSkillSuggestions] = useState<
    string[]
  >([]);
  const [showCustomSkillSuggestions, setShowCustomSkillSuggestions] =
    useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedCustomSkillIndex, setSelectedCustomSkillIndex] = useState(-1);

  // Typewriter animation for position placeholder
  const positionPlaceholder = useTypewriter(
    [
      'Software Developer',
      'Data Scientist',
      'Product Manager',
      'UX Designer',
      'DevOps Engineer',
      'Full Stack Developer',
    ],
    120, // typing speed
    true // loop
  );

  // Handle position input change with autocomplete
  const handlePositionChange = async (value: string) => {
    setPosition(value);
    const suggestions = await getPositionSuggestions(value);
    console.log('Position suggestions for:', value, '→', suggestions);
    setPositionSuggestions(suggestions);
    setShowPositionSuggestions(suggestions.length > 0);
    setSelectedSuggestionIndex(-1); // Reset selection when typing
  };

  // Select position from suggestions
  const selectPosition = (selectedPosition: string) => {
    console.log('Selecting position:', selectedPosition);
    setPosition(selectedPosition);
    setShowPositionSuggestions(false);
    setSelectedSuggestionIndex(-1);
    handlePositionBlur(selectedPosition);
  };

  // Handle keyboard navigation
  const handlePositionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showPositionSuggestions || positionSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < positionSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectPosition(positionSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowPositionSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Fetch skills when position is entered
  const handlePositionBlur = async (positionValue?: string) => {
    const targetPosition = positionValue || position;

    if (!targetPosition.trim()) {
      setSuggestedSkills([]);
      return;
    }

    // Delay to allow suggestion click
    setTimeout(() => {
      setShowPositionSuggestions(false);
    }, 200);

    setIsLoadingSkills(true);

    try {
      // Fetch skills from API
      const apiSkills = await fetchSkillsForPosition(targetPosition);

      if (apiSkills.length > 0) {
        setAllAvailableSkills(apiSkills);
        setSuggestedSkills(apiSkills.slice(0, 14)); // Show first 15
      } else {
        // No skills found for this position
        setAllAvailableSkills([]);
        setSuggestedSkills([]);
        console.warn(`No skills found for position: ${targetPosition}`);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setAllAvailableSkills([]);
      setSuggestedSkills([]);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  // Toggle skill selection - add to selected and remove from suggestions
  const toggleSkill = (skill: string) => {
    console.log('Toggle skill:', skill);
    console.log('Current suggestedSkills:', suggestedSkills);
    console.log('Current selectedSkills:', selectedSkills);

    if (selectedSkills.includes(skill)) {
      // If already selected, remove it from selected
      const newSelected = selectedSkills.filter(s => s !== skill);
      setSelectedSkills(newSelected);
      console.log('Removed from selected, new selected:', newSelected);

      // Add it back to suggestions if not already there
      if (!suggestedSkills.includes(skill)) {
        const newSuggested = [...suggestedSkills, skill];
        setSuggestedSkills(newSuggested);
        console.log('Added back to suggestions:', newSuggested);
      }
    } else if (selectedSkills.length < 50) {
      // Add to selected
      const newSelected = [...selectedSkills, skill];
      setSelectedSkills(newSelected);
      console.log('Added to selected:', newSelected);

      // Find a replacement skill from allAvailableSkills
      const replacementSkill = allAvailableSkills.find(
        s => !newSelected.includes(s) && !suggestedSkills.includes(s)
      );

      if (replacementSkill) {
        // Replace the selected skill with a new one
        const newSuggested = suggestedSkills.map(s =>
          s === skill ? replacementSkill : s
        );
        setSuggestedSkills(newSuggested);
        console.log(
          'Replaced in suggestions with:',
          replacementSkill,
          'New suggested:',
          newSuggested
        );
      } else {
        // No replacement available, just remove it
        const newSuggested = suggestedSkills.filter(s => s !== skill);
        setSuggestedSkills(newSuggested);
        console.log(
          'No replacement, removed from suggestions, new suggested:',
          newSuggested
        );
      }
    }
  };

  // Handle custom skill input change with autocomplete
  const handleCustomSkillChange = (value: string) => {
    setCustomSkill(value);
    setSelectedCustomSkillIndex(-1); // Reset selection when typing

    if (value.trim()) {
      // Filter from ALL available skills that aren't already selected
      const filtered = allAvailableSkills
        .filter(
          skill =>
            skill.toLowerCase().includes(value.toLowerCase()) &&
            !selectedSkills.includes(skill)
        )
        .slice(0, 10);
      setCustomSkillSuggestions(filtered);
      setShowCustomSkillSuggestions(filtered.length > 0);
    } else {
      setCustomSkillSuggestions([]);
      setShowCustomSkillSuggestions(false);
    }
  };

  // Select skill from custom skill suggestions
  const selectCustomSkill = (skill: string) => {
    if (selectedSkills.length < 50 && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setCustomSkill('');
      setShowCustomSkillSuggestions(false);
    }
  };

  // Add custom skill
  const addCustomSkill = () => {
    const trimmedSkill = customSkill.trim();
    if (
      trimmedSkill &&
      !selectedSkills.includes(trimmedSkill) &&
      selectedSkills.length < 50
    ) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
      setCustomSkill('');
      setShowCustomSkillSuggestions(false);
    }
  };

  // Handle keyboard navigation for custom skills
  const handleCustomSkillKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showCustomSkillSuggestions || customSkillSuggestions.length === 0) {
      // If no suggestions, let Enter add the custom skill
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomSkill();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCustomSkillIndex(prev =>
          prev < customSkillSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCustomSkillIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedCustomSkillIndex >= 0) {
          selectCustomSkill(customSkillSuggestions[selectedCustomSkillIndex]);
        } else {
          addCustomSkill();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowCustomSkillSuggestions(false);
        setSelectedCustomSkillIndex(-1);
        break;
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  return (
    <div className="h-full">
      {/* Sticky Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-11 h-11 flex items-center justify-center bg-[#3b3be3] text-white rounded-lg hover:bg-[#2929c9] transition-all shadow-md"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate">
          Resume Builder
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6 lg:p-8">
        {/* Desktop Header */}
        <div className="mb-6 md:mb-8 hidden lg:block">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#3b3be3] to-[#3b3be3] bg-clip-text text-transparent">
            Template Information
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Create a professional template to complement your job applications
          </p>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile: Stack vertically, Desktop: 3-column grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-[200px_1fr_300px] gap-4 lg:gap-6 lg:h-[calc(100vh-200px)]">
          {/* Sidebar - Slide-in drawer on mobile, fixed sidebar on desktop */}
          <div
            className={`fixed lg:relative inset-y-0 left-0 w-64 lg:w-auto bg-white lg:bg-transparent z-50 lg:z-auto transform transition-transform duration-300 ease-in-out lg:transform-none ${
              isMobileSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="h-full flex flex-col gap-2 p-4 lg:p-0 overflow-y-auto">
              {/* Mobile Close Button */}
              <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Sections
                </h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div
                className={`flex items-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 text-sm min-w-[160px] lg:min-w-0 flex-shrink-0 ${
                  activeSection === 'personal'
                    ? 'text-[#3b3be3] border-[#3b3be3] font-bold'
                    : 'text-gray-700 font-medium hover:border-[#3b3be3] hover:bg-blue-50'
                }`}
                onClick={() => {
                  setActiveSection('personal');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <svg
                  className={`w-[18px] h-[18px] ${
                    activeSection === 'personal'
                      ? 'opacity-100 text-[#3b3be3]'
                      : 'opacity-60'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Info
              </div>
              <div
                className={`flex items-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 text-sm min-w-[160px] lg:min-w-0 flex-shrink-0 ${
                  activeSection === 'experience'
                    ? 'text-[#3b3be3] border-[#3b3be3] font-bold'
                    : 'text-gray-700 font-medium hover:border-[#3b3be3] hover:bg-blue-50'
                }`}
                onClick={() => {
                  setActiveSection('experience');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <svg
                  className={`w-[18px] h-[18px] ${
                    activeSection === 'experience'
                      ? 'opacity-100 text-[#3b3be3]'
                      : 'opacity-60'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Experience
              </div>
              <div
                className={`flex items-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 text-sm min-w-[160px] lg:min-w-0 flex-shrink-0 ${
                  activeSection === 'education'
                    ? 'text-[#3b3be3] border-[#3b3be3] font-bold'
                    : 'text-gray-700 font-medium hover:border-[#3b3be3] hover:bg-blue-50'
                }`}
                onClick={() => {
                  setActiveSection('education');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <svg
                  className={`w-[18px] h-[18px] ${
                    activeSection === 'education'
                      ? 'opacity-100 text-[#3b3be3]'
                      : 'opacity-60'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Education
              </div>
              <div
                className={`flex items-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 text-sm min-w-[150px] lg:min-w-0 flex-shrink-0 ${
                  activeSection === 'skills'
                    ? 'text-[#3b3be3] border-[#3b3be3] font-bold'
                    : 'text-gray-700 font-medium hover:border-[#3b3be3] hover:bg-blue-50'
                }`}
                onClick={() => {
                  setActiveSection('skills');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <svg
                  className={`w-[18px] h-[18px] ${
                    activeSection === 'skills'
                      ? 'opacity-100 text-[#3b3be3]'
                      : 'opacity-60'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Skills
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] lg:max-h-full">
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 lg:p-8">
              <h2 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">
                {activeSection === 'personal' && 'Personal Information'}
                {activeSection === 'experience' && 'Work Experience'}
                {activeSection === 'education' && 'Education'}
                {activeSection === 'skills' && 'Skills & Expertise'}
              </h2>

              {activeSection === 'personal' && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Professional Summary
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Brief overview of your professional background..."
                      className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <WorkExperienceSection
                  experiences={workExperiences}
                  onUpdate={setWorkExperiences}
                />
              )}

              {activeSection === 'education' && (
                <EducationSection
                  educations={educations}
                  onUpdate={setEducations}
                />
              )}

              {activeSection === 'skills' && (
                <div className="flex flex-col gap-5">
                  <p className="text-gray-600 mb-4">
                    Enter your target position to get relevant skill
                    suggestions, or add custom skills.
                  </p>

                  <div
                    className="flex flex-col gap-2"
                    style={{ position: 'relative' }}
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Target Position
                    </label>
                    <input
                      type="text"
                      placeholder={
                        positionPlaceholder || 'e.g., Software Developer'
                      }
                      value={position}
                      onChange={e => handlePositionChange(e.target.value)}
                      onKeyDown={handlePositionKeyDown}
                      onBlur={() => handlePositionBlur()}
                      onFocus={async () => {
                        if (position) {
                          const suggestions = await getPositionSuggestions(
                            position
                          );
                          setPositionSuggestions(suggestions);
                          setShowPositionSuggestions(suggestions.length > 0);
                        }
                      }}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white"
                    />
                    {showPositionSuggestions &&
                      positionSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-lg z-[1000]">
                          {positionSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-200 text-gray-700 text-sm last:border-b-0 ${
                                index === selectedSuggestionIndex
                                  ? 'bg-blue-50 text-[#3b3be3]'
                                  : ''
                              }`}
                              onMouseEnter={() =>
                                setSelectedSuggestionIndex(index)
                              }
                              onMouseDown={e => {
                                e.preventDefault(); // Prevent blur
                                selectPosition(suggestion);
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    {isLoadingSkills && (
                      <div className="text-center py-8">
                        <div className="w-10 h-10 mx-auto mb-4 border-3 border-gray-200 border-t-[#3b3be3] rounded-full animate-spin"></div>
                        <p className="text-sm text-[#3b3be3] my-2 text-center font-medium">
                          Loading skills from API...
                        </p>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                            <div
                              key={i}
                              className="h-[38px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-lg"
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {suggestedSkills.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[15px] font-semibold mb-4 text-gray-700">
                        Suggested Skills (Select up to 50)
                      </h4>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                        {suggestedSkills.map((skill, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between gap-2 py-2.5 px-4 border rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-200 select-none ${
                              selectedSkills.includes(skill)
                                ? 'bg-[#3b3be3] text-white border-[#3b3be3]'
                                : 'bg-[#3b3be3] text-white border-[#3b3be3] hover:bg-[#5c5cff] hover:border-[#5c5cff] hover:-translate-y-0.5'
                            } ${
                              selectedSkills.length >= 50 &&
                              !selectedSkills.includes(skill)
                                ? 'opacity-50 cursor-not-allowed hover:transform-none hover:border-gray-200 hover:bg-gray-50'
                                : ''
                            }`}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            {selectedSkills.includes(skill) && (
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="flex flex-col gap-2"
                    style={{ position: 'relative' }}
                  >
                    <label className="text-sm font-medium text-gray-700">
                      Add Custom Skill
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter a skill and press Enter"
                        value={customSkill}
                        onChange={e => handleCustomSkillChange(e.target.value)}
                        onKeyDown={handleCustomSkillKeyDown}
                        onBlur={() => {
                          setTimeout(
                            () => setShowCustomSkillSuggestions(false),
                            200
                          );
                        }}
                        onFocus={() => {
                          if (
                            customSkill.trim() &&
                            customSkillSuggestions.length > 0
                          ) {
                            setShowCustomSkillSuggestions(true);
                          }
                        }}
                        disabled={selectedSkills.length >= 50}
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <button
                        className="px-6 py-2.5 bg-transparent text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        onClick={addCustomSkill}
                        disabled={
                          !customSkill.trim() || selectedSkills.length >= 50
                        }
                      >
                        Add
                      </button>
                    </div>
                    {showCustomSkillSuggestions &&
                      customSkillSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-lg z-[1000]">
                          {customSkillSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`px-4 py-3 cursor-pointer transition-all duration-200 border-b border-gray-200 text-gray-700 text-sm last:border-b-0 ${
                                index === selectedCustomSkillIndex
                                  ? 'bg-blue-50 text-[#3b3be3]'
                                  : ''
                              }`}
                              onMouseEnter={() =>
                                setSelectedCustomSkillIndex(index)
                              }
                              onMouseDown={e => {
                                e.preventDefault(); // Prevent blur
                                selectCustomSkill(suggestion);
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-[15px] font-semibold mb-4 text-gray-700">
                        Selected Skills ({selectedSkills.length}/50)
                      </h4>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                        {selectedSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2 py-2.5 px-4 bg-blue-400 border border-blue-400 rounded-lg text-[13px] font-medium text-white select-none"
                          >
                            {skill}
                            <button
                              className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                              onClick={() => removeSkill(skill)}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
