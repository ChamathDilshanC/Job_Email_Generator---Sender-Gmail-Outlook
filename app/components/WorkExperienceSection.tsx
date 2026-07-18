'use client';

import {
  WorkExperience,
  createEmptyWorkExperience,
} from '@/app/models/WorkExperience';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper function to format date in local timezone (avoids timezone offset issues)
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onUpdate: (experiences: WorkExperience[]) => void;
}

export default function WorkExperienceSection({
  experiences,
  onUpdate,
}: WorkExperienceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [formData, setFormData] = useState<WorkExperience>(
    createEmptyWorkExperience()
  );

  const handleAdd = () => {
    setShowForm(true);
    setEditingExp(null);
    setFormData(createEmptyWorkExperience());
  };

  const handleFresher = () => {
    const fresherExp: WorkExperience = {
      id: Date.now().toString(),
      position: 'Intern / Fresh Graduate',
      company: 'Recent Graduate',
      location: 'Your City',
      startDate: new Date().getFullYear().toString(),
      endDate: new Date().getFullYear().toString(),
      currentlyWorking: false,
      description: `• Recent graduate with strong academic foundation and eagerness to contribute
• Completed internship/academic projects demonstrating practical skills
• Proficient in modern development tools and technologies
• Quick learner with excellent problem-solving abilities
• Strong communication and teamwork skills
• Passionate about technology and continuous learning
• Ready to contribute fresh perspectives and innovative ideas`,
      responsibilities: [],
    };
    onUpdate([...experiences, fresherExp]);
  };

  const handleEdit = (exp: WorkExperience) => {
    setEditingExp(exp);
    setFormData(exp);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(experiences.filter(exp => exp.id !== id));
  };

  const handleSave = () => {
    if (editingExp) {
      onUpdate(
        experiences.map(exp => (exp.id === editingExp.id ? formData : exp))
      );
    } else {
      const newExp: WorkExperience = {
        ...formData,
        id: Date.now().toString(),
      };
      onUpdate([...experiences, newExp]);
    }
    setShowForm(false);
    setEditingExp(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExp(null);
  };

  const updateField = (field: keyof WorkExperience, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ''],
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setFormData(prev => {
      const newResp = [...prev.responsibilities];
      newResp[index] = value;
      return { ...prev, responsibilities: newResp };
    });
  };

  const removeResponsibility = (index: number) => {
    if (formData.responsibilities.length > 1) {
      setFormData(prev => ({
        ...prev,
        responsibilities: prev.responsibilities.filter((_, i) => i !== index),
      }));
    }
  };

  const isFormValid = () => {
    return (
      formData.company.trim() &&
      formData.position.trim() &&
      formData.location.trim() &&
      formData.startDate &&
      (formData.currentlyWorking || formData.endDate)
    );
  };

  return (
    <div className="w-full">
      {!showForm && (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm md:text-base">
            Add your work experience, starting with the most recent position.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto px-6 py-3 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2929c9] transition-all duration-200 hover:scale-105 text-sm md:text-base"
            >
              + Add Experience
            </button>
            <button
              onClick={handleFresher}
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 hover:scale-105 text-sm md:text-base"
            >
              🎓 I'm a Fresher
            </button>
          </div>

          {experiences.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 transition-all duration-200 hover:border-[#3b3be3] dark:hover:border-[#818cf8] hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {exp.position}
                      </h3>
                      <p className="text-sm md:text-[15px] text-gray-600 dark:text-gray-400 mb-1">
                        {exp.company} • {exp.location}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 italic">
                        {exp.startDate} -{' '}
                        {exp.currentlyWorking ? 'Present' : exp.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(exp)}
                        title="Edit"
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-[#3b3be3] dark:hover:border-[#818cf8] hover:text-[#3b3be3] dark:hover:text-[#818cf8] transition-all duration-200"
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
                        onClick={() => handleDelete(exp.id)}
                        title="Delete"
                        className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all duration-200"
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

                  {exp.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {exp.description}
                    </p>
                  )}

                  {exp.responsibilities.filter(r => r.trim()).length > 0 && (
                    <ul className="list-none pl-0 m-0">
                      {exp.responsibilities
                        .filter(r => r.trim())
                        .map((resp, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-6 mb-2 relative before:content-['▹'] before:absolute before:left-0 before:text-[#3b3be3] dark:before:text-[#818cf8] before:font-bold before:text-lg"
                          >
                            {resp}
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
        <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 lg:p-8">
          <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
            {editingExp ? 'Edit' : 'Add'} Work Experience
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Google, Microsoft"
                value={formData.company}
                onChange={e => updateField('company', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Position/Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer"
                value={formData.position}
                onChange={e => updateField('position', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={e => updateField('location', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20 w-full hover:border-[#3b3be3] dark:hover:border-[#818cf8] hover:shadow-sm"
                  maxDate={new Date()}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    formData.currentlyWorking ? 'Present' : 'Select end date'
                  }
                  disabled={formData.currentlyWorking}
                  className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 w-full hover:border-[#3b3be3] dark:hover:border-[#818cf8] hover:shadow-sm"
                  maxDate={new Date()}
                  minDate={
                    formData.startDate ? new Date(formData.startDate) : null
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Employment Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="workStatus"
                  value="past"
                  checked={!formData.currentlyWorking}
                  onChange={() => updateField('currentlyWorking', false)}
                  className="w-4 h-4 text-[#3b3be3] dark:text-[#818cf8] border-gray-300 dark:border-gray-700 focus:ring-[#3b3be3] dark:focus:ring-[#818cf8] cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Past Position</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="workStatus"
                  value="current"
                  checked={formData.currentlyWorking}
                  onChange={() => {
                    updateField('currentlyWorking', true);
                    updateField('endDate', '');
                  }}
                  className="w-4 h-4 text-[#3b3be3] dark:text-[#818cf8] border-gray-300 dark:border-gray-700 focus:ring-[#3b3be3] dark:focus:ring-[#818cf8] cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Currently Working Here
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief overview of your role and what the company does..."
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 mb-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Key Responsibilities & Achievements
            </label>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., Led a team of 5 developers to build..."
                  value={resp}
                  onChange={e => updateResponsibility(index, e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:border-[#3b3be3] dark:focus:border-[#818cf8] focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    onClick={() => removeResponsibility(index)}
                    type="button"
                    className="w-9 h-9 flex items-center justify-center bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all duration-200"
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
              onClick={addResponsibility}
              type="button"
              className="px-4 py-2.5 bg-transparent text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm"
            >
              + Add Responsibility
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 bg-transparent text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-6 py-2.5 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2929c9] transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3b3be3] disabled:hover:scale-100"
            >
              {editingExp ? 'Update' : 'Save'} Experience
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
