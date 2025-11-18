import React, { useState, useRef } from 'react';
import { UserProfile, UserType } from '../types';
import { Loader2, ArrowRight, CheckCircle, Upload, FileText } from 'lucide-react';
import { parseResume } from '../services/geminiService';

interface AssessmentFormProps {
  userType: UserType;
  onSubmit: (data: UserProfile) => void;
  isLoading: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ userType, onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    educationLevel: 'Bachelor',
    fieldOfStudy: '',
    workExperienceYears: 0,
    englishScore: 6.5,
    targetProvince: 'Ontario',
    savings: 10000,
    hasJobOffer: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const extractedData = await parseResume(file);
      setFormData((prev) => ({
        ...prev,
        name: extractedData.name || prev.name,
        educationLevel: extractedData.educationLevel || prev.educationLevel,
        fieldOfStudy: extractedData.fieldOfStudy || prev.fieldOfStudy,
        workExperienceYears: extractedData.workExperienceYears !== undefined ? extractedData.workExperienceYears : prev.workExperienceYears,
        englishScore: (extractedData.englishScore && extractedData.englishScore > 0) ? extractedData.englishScore : prev.englishScore,
      }));
    } catch (error) {
      console.error("Resume parse error", error);
      alert("Failed to parse resume. Please fill details manually.");
    } finally {
      setIsParsing(false);
      // Clear input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">AI Engine is Analyzing...</h3>
        <p className="text-gray-500 mt-2">Calculating CRS scores, checking PNP eligibility, and predicting pathways.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {userType === UserType.Student ? 'Student Visa Assessment' : 'Immigration Eligibility Check'}
        </h2>
        <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Resume Upload Section */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <FileText className="text-red-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900">Auto-fill with Resume</h3>
                    <p className="text-sm text-red-700 mt-1">Upload your resume (PDF) to automatically populate your details.</p>
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                    className="bg-white text-red-600 hover:bg-red-50 border border-red-200 font-medium py-2 px-6 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} /> Upload Resume
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Score (IELTS)</label>
                <input
                  type="number"
                  step="0.5"
                  max="9"
                  name="englishScore"
                  value={formData.englishScore}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Province</label>
                <select
                  name="targetProvince"
                  value={formData.targetProvince}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                >
                  <option value="Ontario">Ontario</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={nextStep}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Education & Experience</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highest Level of Education</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                >
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma / Certificate</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                  placeholder="e.g. Computer Science, Business Admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience (Years)</label>
                <input
                  type="number"
                  name="workExperienceYears"
                  value={formData.workExperienceYears}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                Back
              </button>
              <button
                onClick={nextStep}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900">Financials & Intent</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Savings (CAD Equivalent)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="savings"
                    value={formData.savings}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for Proof of Funds (POF).</p>
              </div>
              
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => setFormData({...formData, hasJobOffer: !formData.hasJobOffer})}>
                <input
                  type="checkbox"
                  name="hasJobOffer"
                  checked={formData.hasJobOffer}
                  onChange={(e) => {}} // handled by parent div
                  className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div>
                  <label className="font-medium text-gray-700 cursor-pointer">Do you have a valid Job Offer in Canada?</label>
                  <p className="text-xs text-gray-500">Includes LMIA supported offers.</p>
                </div>
              </div>

            </div>
            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition shadow-md flex items-center gap-2"
              >
                Run AI Assessment <CheckCircle size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};