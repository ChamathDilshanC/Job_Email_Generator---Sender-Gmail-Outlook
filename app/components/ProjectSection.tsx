'use client';

import { Project, createEmptyProject } from '@/app/models/Project';
import { fetchSkillsForPosition } from '@/lib/skillsApiClient';
import { useCallback, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper function to format date in local timezone (avoids timezone offset issues)
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ProjectSectionProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

export default function ProjectSection({
  projects,
  onUpdate,
}: ProjectSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Project>(createEmptyProject());
  const [currentTech, setCurrentTech] = useState('');

  // Technology suggestions state
  const [allAvailableSkills, setAllAvailableSkills] = useState<string[]>([]);
  const [techSuggestions, setTechSuggestions] = useState<string[]>([]);
  const [showTechSuggestions, setShowTechSuggestions] = useState(false);
  const [selectedTechIndex, setSelectedTechIndex] = useState(-1);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  const handleAdd = () => {
    setShowForm(true);
    setEditingProject(null);
    setFormData(createEmptyProject());
    loadTechnologySuggestions();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setShowForm(true);
    loadTechnologySuggestions();
  };

  const handleDelete = (id: string) => {
    onUpdate(projects.filter(proj => proj.id !== id));
  };

  const handleSave = () => {
    if (editingProject) {
      onUpdate(
        projects.map(proj => (proj.id === editingProject.id ? formData : proj))
      );
    } else {
      const newProject: Project = {
        ...formData,
        id: Date.now().toString(),
      };
      onUpdate([...projects, newProject]);
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const updateField = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Load technology suggestions from API
  const loadTechnologySuggestions = async () => {
    setIsLoadingSkills(true);
    try {
      // Fetch skills for common tech positions to get a good pool of technologies
      const positions = [
        'Full Stack Developer',
        'Software Engineer',
        'Web Developer',
      ];
      const skillsPromises = positions.map(pos => fetchSkillsForPosition(pos));
      const skillsArrays = await Promise.all(skillsPromises);

      // Combine and deduplicate skills
      const allSkills = Array.from(new Set(skillsArrays.flat()));
      setAllAvailableSkills(allSkills);
      setTechSuggestions(allSkills.slice(0, 15)); // Show first 15
    } catch (error) {
      console.error('Error loading technology suggestions:', error);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  // Handle technology input change with autocomplete
  const handleTechChange = useCallback(
    (value: string) => {
      setCurrentTech(value);
      setSelectedTechIndex(-1);

      if (value.trim()) {
        // Filter from ALL available skills that aren't already added
        const filtered = allAvailableSkills
          .filter(
            skill =>
              skill.toLowerCase().includes(value.toLowerCase()) &&
              !formData.technologies.includes(skill)
          )
          .slice(0, 10);
        setTechSuggestions(filtered);
        setShowTechSuggestions(filtered.length > 0);
      } else {
        // Show all available skills when input is empty
        const available = allAvailableSkills
          .filter(skill => !formData.technologies.includes(skill))
          .slice(0, 15);
        setTechSuggestions(available);
        setShowTechSuggestions(false);
      }
    },
    [allAvailableSkills, formData.technologies]
  );

  // Select technology from suggestions
  const selectTechnology = useCallback(
    (tech: string) => {
      if (!formData.technologies.includes(tech)) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, tech],
        }));
        setCurrentTech('');
        setShowTechSuggestions(false);
        setSelectedTechIndex(-1);
      }
    },
    [formData.technologies]
  );

  // Handle keyboard navigation for technology suggestions
  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showTechSuggestions || techSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTechnology();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedTechIndex(prev =>
          prev < techSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedTechIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedTechIndex >= 0) {
          selectTechnology(techSuggestions[selectedTechIndex]);
        } else {
          addTechnology();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowTechSuggestions(false);
        setSelectedTechIndex(-1);
        break;
    }
  };

  const addTechnology = () => {
    if (currentTech.trim()) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, currentTech.trim()],
      }));
      setCurrentTech('');
      setShowTechSuggestions(false);
    }
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const addKeyFeature = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, ''],
    }));
  };

  const updateKeyFeature = (index: number, value: string) => {
    setFormData(prev => {
      const newFeatures = [...prev.keyFeatures];
      newFeatures[index] = value;
      return { ...prev, keyFeatures: newFeatures };
    });
  };

  const removeKeyFeature = (index: number) => {
    if (formData.keyFeatures.length > 1) {
      setFormData(prev => ({
        ...prev,
        keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
      }));
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.role.trim() &&
      formData.startDate &&
      (formData.currentlyWorking || formData.endDate)
    );
  };

  return (
    <div className="w-full">
      {!showForm && (
        <>
          <p className="text-gray-600 mb-4 text-sm md:text-base">
            Add your projects, starting with the most recent or significant
            ones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto px-6 py-3 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2929c9] transition-all duration-200 hover:scale-105 text-sm md:text-base"
            >
              + Add Project
            </button>
          </div>

          {projects.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 transition-all duration-200 hover:border-[#3b3be3] hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">
                        {proj.name}
                      </h3>
                      <p className="text-sm md:text-[15px] text-gray-600 mb-1">
                        {proj.role}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 italic">
                        {proj.startDate} -{' '}
                        {proj.currentlyWorking ? 'Present' : proj.endDate}
                      </p>
                      {proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {proj.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(proj)}
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
                        onClick={() => handleDelete(proj.id)}
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

                  {proj.description && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {proj.description}
                    </p>
                  )}

                  {proj.keyFeatures.filter(f => f.trim()).length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Key Features:
                      </h4>
                      <ul className="list-none pl-0 m-0">
                        {proj.keyFeatures
                          .filter(f => f.trim())
                          .map((feature, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 leading-relaxed pl-6 mb-2 relative before:content-['▹'] before:absolute before:left-0 before:text-[#3b3be3] before:font-bold before:text-lg"
                            >
                              {feature}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {(proj.projectUrl || proj.githubUrl) && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          🔗 Project Link
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          💻 GitHub
                        </a>
                      )}
                    </div>
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
            {editingProject ? 'Edit' : 'Add'} Project
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., E-commerce Platform"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Your Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Full Stack Developer"
                value={formData.role}
                onChange={e => updateField('role', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
          </div>

          <div
            className="flex flex-col gap-2 mb-5"
            style={{ position: 'relative' }}
          >
            <label className="text-sm font-medium text-gray-700">
              Technologies Used
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
                value={currentTech}
                onChange={e => handleTechChange(e.target.value)}
                onKeyDown={handleTechKeyDown}
                onFocus={() => {
                  if (techSuggestions.length > 0) {
                    setShowTechSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowTechSuggestions(false), 200);
                }}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
              <button
                onClick={addTechnology}
                type="button"
                className="px-4 py-2.5 bg-transparent text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                Add
              </button>
            </div>

            {/* Technology Suggestions Dropdown */}
            {showTechSuggestions && techSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-[250px] overflow-y-auto shadow-lg z-[1000]">
                {techSuggestions.map((tech, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2.5 cursor-pointer transition-all duration-200 border-b border-gray-200 text-gray-700 text-sm last:border-b-0 ${
                      index === selectedTechIndex
                        ? 'bg-blue-50 text-[#3b3be3]'
                        : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setSelectedTechIndex(index)}
                    onMouseDown={e => {
                      e.preventDefault(); // Prevent blur
                      selectTechnology(tech);
                    }}
                  >
                    {tech}
                  </div>
                ))}
              </div>
            )}

            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-2"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechnology(idx)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Technologies - Only show when typing */}
            {!isLoadingSkills &&
              currentTech.trim() &&
              techSuggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">
                    Suggested Technologies (Click to add)
                  </h4>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                    {techSuggestions
                      .filter(tech => !formData.technologies.includes(tech))
                      .slice(0, 12)
                      .map((tech, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectTechnology(tech)}
                          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-medium hover:bg-blue-50 hover:border-[#3b3be3] hover:text-[#3b3be3] transition-all duration-200"
                        >
                          {tech}
                        </button>
                      ))}
                  </div>
                </div>
              )}

            {/* Loading State */}
            {isLoadingSkills && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-[#3b3be3] rounded-full animate-spin"></div>
                  Loading technology suggestions...
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={
                    formData.startDate ? new Date(formData.startDate) : null
                  }
                  onChange={date =>
                    updateField(
                      'startDate',
                      date ? formatDateToLocal(date) : ''
                    )
                  }
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select start date"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 w-full hover:border-[#3b3be3] hover:shadow-sm"
                  maxDate={new Date()}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                End Date{' '}
                {!formData.currentlyWorking && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <div className="relative">
                <DatePicker
                  selected={
                    formData.endDate && !formData.currentlyWorking
                      ? new Date(formData.endDate)
                      : null
                  }
                  onChange={date =>
                    updateField('endDate', date ? formatDateToLocal(date) : '')
                  }
                  dateFormat="MM/dd/yyyy"
                  placeholderText={
                    formData.currentlyWorking ? 'Ongoing' : 'Select end date'
                  }
                  disabled={formData.currentlyWorking}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 w-full hover:border-[#3b3be3] hover:shadow-sm"
                  maxDate={new Date()}
                  minDate={
                    formData.startDate ? new Date(formData.startDate) : null
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700">
              Project Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectStatus"
                  value="completed"
                  checked={!formData.currentlyWorking}
                  onChange={() => updateField('currentlyWorking', false)}
                  className="w-4 h-4 text-[#3b3be3] border-gray-300 focus:ring-[#3b3be3] cursor-pointer"
                />
                <span className="text-sm text-gray-700">Completed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectStatus"
                  value="ongoing"
                  checked={formData.currentlyWorking}
                  onChange={() => {
                    updateField('currentlyWorking', true);
                    updateField('endDate', '');
                  }}
                  className="w-4 h-4 text-[#3b3be3] border-gray-300 focus:ring-[#3b3be3] cursor-pointer"
                />
                <span className="text-sm text-gray-700">Ongoing</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700">
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of the project and its purpose..."
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700">
              Key Features & Achievements
            </label>
            {formData.keyFeatures.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., Implemented real-time chat functionality..."
                  value={feature}
                  onChange={e => updateKeyFeature(index, e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
                />
                {formData.keyFeatures.length > 1 && (
                  <button
                    onClick={() => removeKeyFeature(index)}
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
              onClick={addKeyFeature}
              type="button"
              className="px-4 py-2.5 bg-transparent text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              + Add Feature
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Project URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://project-demo.com"
                value={formData.projectUrl}
                onChange={e => updateField('projectUrl', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                GitHub URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.githubUrl}
                onChange={e => updateField('githubUrl', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] focus:ring-3 focus:ring-blue-100"
              />
            </div>
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
              {editingProject ? 'Update' : 'Save'} Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
