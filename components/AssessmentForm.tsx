
import React, { useState, useRef } from 'react';
import { UserProfile, UserType } from '../types';
import { Loader2, ArrowRight, CheckCircle, Upload, FileText, User, Briefcase, Languages, Heart, Award, Globe, GraduationCap, DollarSign, ShieldAlert, MapPin, Info } from 'lucide-react';
import { parseResume } from '../services/geminiService';

interface AssessmentFormProps {
  userType: UserType;
  onSubmit: (data: UserProfile) => void;
  isLoading: boolean;
}

// Comprehensive list of countries
const COUNTRIES = [
  "India", "China", "Philippines", "Nigeria", "France", "United States", "United Kingdom", "Pakistan", "Iran", "Brazil", 
  "Vietnam", "South Korea", "Mexico", "Colombia", "Bangladesh", "Morocco", "Algeria", "Lebanon", "Egypt", "Turkey",
  "Afghanistan", "Albania", "Argentina", "Australia", "Austria", "Belgium", "Chile", "Costa Rica", "Croatia", 
  "Czech Republic", "Denmark", "Ethiopia", "Finland", "Germany", "Ghana", "Greece", "Hong Kong", "Hungary", 
  "Indonesia", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Kenya", "Malaysia", "Netherlands", "New Zealand", 
  "Norway", "Peru", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa", "Spain", 
  "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Ukraine", "United Arab Emirates", "Zimbabwe", "Other"
];

// Helper Component for "Radio Cards"
const SelectionCard: React.FC<{ selected: boolean; onClick: () => void; label: string; icon?: React.ReactNode }> = ({ selected, onClick, label, icon }) => (
  <div 
      onClick={onClick}
      className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all duration-200 h-full
      ${selected 
          ? 'border-red-500 bg-red-50 ring-1 ring-red-500' 
          : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
      }`}
  >
      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
          ${selected ? 'border-red-500' : 'border-gray-300'}`}
      >
          {selected && <div className="w-2 h-2 rounded-full bg-red-500" />}
      </div>
      <span className={`text-sm font-medium ${selected ? 'text-red-900' : 'text-gray-700'}`}>{label}</span>
      {icon && <span className="ml-auto text-gray-400">{icon}</span>}
  </div>
);

// Helper Component for consistent Form Rows (Table-like layout)
const FormRow: React.FC<{ 
  label: string; 
  subLabel?: string | React.ReactNode; 
  children: React.ReactNode; 
  required?: boolean;
}> = ({ label, subLabel, children, required }) => (
  <div className="flex flex-col md:flex-row md:items-start gap-4 py-6 px-6 hover:bg-gray-50 transition-colors">
    <div className="md:w-5/12 pt-2 pr-4">
      <label className="block text-sm font-bold text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {subLabel && <div className="text-xs text-gray-500 mt-1.5 leading-relaxed">{subLabel}</div>}
    </div>
    <div className="md:w-7/12 w-full">
      {children}
    </div>
  </div>
);

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ userType, onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    countryOfResidence: 'India',
    passportValid: true,
    maritalStatus: 'Never Married',
    hasSiblingInCanada: false,
    bringingDependents: false,
    
    immigrationCategory: 'Express Entry',
    
    educationLevel: 'Bachelor',
    hasCanadianEducation: false,
    hasEca: false,
    fieldOfStudy: '',
    intendedStudyField: '',
    gradesOrGpa: '',
    
    workExperienceYears: 0,
    workExperienceLocation: 'Outside Canada',
    canadianWorkExperience: 'None',
    foreignWorkExperience: 'None',
    
    englishScore: 0,
    languageDetails: {
        testType: 'None',
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
        overallScore: 0
    },
    hasFrench: false,
    frenchDetails: {
        testType: 'None',
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
        overallScore: 0
    },

    certificateOfQualification: false,
    targetProvince: 'Ontario',
    preferredProvinces: [],
    savings: 15000,
    savingsExempt: false,
    
    hasJobOffer: false,
    hasNominationCertificate: false,
    
    hasVisaHistory: false,
    hasRefusalHistory: false,
    hasCriminalRecord: false,
    hasMedicalCondition: false,

    spouse: {
        isCanadian: false,
        comingToCanada: false,
        educationLevel: 'Bachelor',
        canadianWorkExperienceYears: 'None',
        languageScores: {
            testType: 'None',
            reading: 0,
            writing: 0,
            listening: 0,
            speaking: 0,
            overallScore: 0
        }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
      setFormData(prev => {
          const currentArr = (prev as any)[field] as string[] || [];
          if (currentArr.includes(value)) {
              return { ...prev, [field]: currentArr.filter(item => item !== value) };
          } else {
              return { ...prev, [field]: [...currentArr, value] };
          }
      });
  };

  const handleLanguageChange = (lang: 'english' | 'french', field: string, value: any) => {
      const targetField = lang === 'english' ? 'languageDetails' : 'frenchDetails';
      setFormData(prev => ({
          ...prev,
          [targetField]: {
              ...(prev as any)[targetField],
              [field]: field === 'testType' ? value : Number(value)
          }
      }));
  };

  const handleSpouseChange = (field: string, value: any) => {
      if (!formData.spouse) return;
      setFormData(prev => ({
          ...prev,
          spouse: {
              ...prev.spouse!,
              [field]: field === 'isCanadian' || field === 'comingToCanada' ? value === 'true' : value
          }
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
        countryOfResidence: extractedData.countryOfResidence && COUNTRIES.includes(extractedData.countryOfResidence) ? extractedData.countryOfResidence : prev.countryOfResidence,
        educationLevel: extractedData.educationLevel || prev.educationLevel,
        fieldOfStudy: extractedData.fieldOfStudy || prev.fieldOfStudy,
        workExperienceYears: extractedData.workExperienceYears !== undefined ? extractedData.workExperienceYears : prev.workExperienceYears,
        foreignWorkExperience: extractedData.workExperienceYears && extractedData.workExperienceYears >= 1 ? '1' : 'None', 
      }));
      alert("Resume parsed successfully! Please review the auto-filled fields.");
    } catch (error) {
      console.error("Resume parse error", error);
      alert("Failed to parse resume. Please fill details manually.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const nextStep = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(step + 1);
  };
  const prevStep = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-20 w-20 text-red-600 animate-spin mb-8" />
        <h3 className="text-3xl font-bold text-gray-900">AI Engine is Analyzing...</h3>
        <p className="text-gray-500 mt-4 text-center max-w-md text-lg">
            We are scanning 80+ immigration pathways, calculating CRS scores, and checking course eligibility.
        </p>
      </div>
    );
  }

  // Helper for Resume Upload UI (Reusable)
  const ResumeUploadSection = () => (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
                <FileText size={24}/> 
            </div>
            <div>
                <h3 className="font-bold text-blue-900 text-lg">Auto-fill with Resume</h3>
                <p className="text-sm text-blue-700">Upload your CV/Resume to skip manual entry.</p>
            </div>
        </div>
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="bg-white text-blue-700 px-6 py-3 rounded-lg border border-blue-200 text-sm font-bold hover:bg-white hover:shadow-md transition-all flex items-center gap-2">
                {isParsing ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
                {isParsing ? 'Parsing...' : 'Upload PDF'}
            </button>
        </div>
    </div>
  );

  // --- STUDENT FLOW ---
  if (userType === UserType.Student) {
      const studentSteps = 5;
      return (
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-8 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <GraduationCap className="text-blue-200" size={28}/> 
                        Student Visa Assessment
                    </h2>
                    <p className="text-blue-100 mt-2 opacity-90">Step-by-step eligibility check & course matching.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                    Step {step} of {studentSteps}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1.5">
                <div className="bg-blue-500 h-1.5 transition-all duration-500 ease-out" style={{ width: `${(step / studentSteps) * 100}%` }}></div>
            </div>

            <div className="p-0">
                {/* Step 1: Personal & Origin */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div className="p-6 pb-0">
                            <ResumeUploadSection />
                        </div>
                        
                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                            <FormRow label="Full Name" subLabel="As it appears on your passport.">
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. John Doe" />
                            </FormRow>

                            <FormRow label="Age" subLabel="Your current age in years.">
                                <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field w-32" />
                            </FormRow>

                            <FormRow label="Country of Residence" subLabel="Where you are currently living legally.">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <select name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} className="input-field pl-10">
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </FormRow>

                            <FormRow label="Passport Status" subLabel="Do you hold a valid passport?">
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectionCard selected={formData.passportValid} onClick={() => setFormData({...formData, passportValid: true})} label="Yes, Valid" />
                                    <SelectionCard selected={!formData.passportValid} onClick={() => setFormData({...formData, passportValid: false})} label="No / Expired" />
                                </div>
                            </FormRow>

                            <FormRow label="Marital Status" subLabel="Your current legal marital status.">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Never Married', 'Married', 'Common-Law'].map(status => (
                                        <SelectionCard 
                                            key={status} 
                                            selected={formData.maritalStatus === status} 
                                            onClick={() => setFormData({...formData, maritalStatus: status})} 
                                            label={status === 'Never Married' ? 'Single' : status} 
                                        />
                                    ))}
                                </div>
                            </FormRow>

                            {formData.maritalStatus !== 'Never Married' && (
                                <FormRow label="Family Dependents" subLabel="Will your spouse or children accompany you?">
                                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="bringingDependents" checked={formData.bringingDependents} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded"/>
                                        <span className="text-gray-700 font-medium">Yes, I plan to bring family members</span>
                                    </label>
                                </FormRow>
                            )}
                        </div>
                    </div>
                )}
                
                {step === 2 && (
                    <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-blue-50 border-b border-blue-100 mb-0">
                             <h3 className="text-lg font-bold text-blue-900">Academic Profile</h3>
                             <p className="text-sm text-blue-700">We use this to match you with eligible College & University programs.</p>
                        </div>
                        <FormRow label="Highest Education" subLabel="Select the highest level you have completed.">
                            <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field">
                                <option value="High School">Secondary (High School)</option>
                                <option value="Diploma">Diploma (1-2 Years)</option>
                                <option value="Bachelor">Bachelor's Degree</option>
                                <option value="Master">Master's Degree</option>
                                <option value="PhD">PhD</option>
                            </select>
                        </FormRow>
                        <FormRow label="Field of Study" subLabel="Major subject of your highest qualification.">
                            <input type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} className="input-field" placeholder="e.g. Commerce, Biology, Arts" />
                        </FormRow>
                        <FormRow label="Grades / GPA" subLabel="Percentage or GPA (e.g. 75%, 3.5/4.0).">
                             <input type="text" name="gradesOrGpa" value={formData.gradesOrGpa} onChange={handleChange} className="input-field" placeholder="e.g. 75%" />
                        </FormRow>
                    </div>
                )}
                
                {step === 3 && (
                    <div className="animate-fade-in divide-y divide-gray-100">
                         <div className="p-6 bg-gray-50 border-b border-gray-100">
                             <h3 className="text-lg font-bold text-gray-900">Language Proficiency</h3>
                        </div>
                        
                        {/* English */}
                        <FormRow label="English Test" subLabel="Have you taken an official test?">
                            <select 
                                value={formData.languageDetails.testType} 
                                onChange={(e) => handleLanguageChange('english', 'testType', e.target.value)} 
                                className="input-field"
                            >
                                <option value="None">No, not yet</option>
                                <option value="IELTS">IELTS Academic</option>
                                <option value="IELTS-General">IELTS General</option>
                                <option value="PTE Core">PTE Academic</option>
                                <option value="TOEFL">TOEFL</option>
                                <option value="Duolingo">Duolingo</option>
                            </select>
                        </FormRow>
                        {formData.languageDetails.testType !== 'None' && (
                             <FormRow label="English Scores" subLabel="Enter your Overall and individual band scores.">
                                 <div className="grid grid-cols-1 mb-3">
                                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Overall Score</label>
                                     <input 
                                        type="number" 
                                        step="0.5" 
                                        value={formData.languageDetails.overallScore || 0} 
                                        onChange={(e) => handleLanguageChange('english', 'overallScore', e.target.value)} 
                                        className="input-field text-center font-mono font-bold border-blue-300 bg-blue-50" 
                                     />
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                                         <div key={skill}>
                                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{skill}</label>
                                             <input 
                                                type="number" 
                                                step="0.5" 
                                                value={(formData.languageDetails as any)[skill.toLowerCase()]} 
                                                onChange={(e) => handleLanguageChange('english', skill.toLowerCase(), e.target.value)} 
                                                className="input-field text-center font-mono" 
                                             />
                                         </div>
                                     ))}
                                 </div>
                             </FormRow>
                        )}

                        {/* French */}
                         <FormRow label="French Test" subLabel="TEF Canada or TCF Canada?">
                            <select 
                                value={formData.frenchDetails?.testType || 'None'} 
                                onChange={(e) => handleLanguageChange('french', 'testType', e.target.value)} 
                                className="input-field"
                            >
                                <option value="None">None</option>
                                <option value="TEF Canada">TEF Canada</option>
                                <option value="TCF Canada">TCF Canada</option>
                            </select>
                        </FormRow>
                        {formData.frenchDetails && formData.frenchDetails.testType !== 'None' && (
                             <FormRow label="French Scores" subLabel="Enter your scores.">
                                 <div className="grid grid-cols-1 mb-3">
                                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Overall Score</label>
                                     <input 
                                        type="number" 
                                        step="0.5" 
                                        value={formData.frenchDetails.overallScore || 0} 
                                        onChange={(e) => handleLanguageChange('french', 'overallScore', e.target.value)} 
                                        className="input-field text-center font-mono font-bold" 
                                     />
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                                         <div key={skill}>
                                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{skill}</label>
                                             <input 
                                                type="number" 
                                                step="0.5" 
                                                value={(formData.frenchDetails as any)[skill.toLowerCase()]} 
                                                onChange={(e) => handleLanguageChange('french', skill.toLowerCase(), e.target.value)} 
                                                className="input-field text-center font-mono" 
                                             />
                                         </div>
                                     ))}
                                 </div>
                             </FormRow>
                        )}
                    </div>
                )}

                {step === 4 && (
                     <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                             <h3 className="text-lg font-bold text-gray-900">Study Goals</h3>
                        </div>
                        <FormRow label="Intended Program" subLabel="What field do you want to study?">
                             <input type="text" name="intendedStudyField" value={formData.intendedStudyField} onChange={handleChange} className="input-field" placeholder="e.g. Project Management, Nursing" />
                        </FormRow>
                        <FormRow label="First Year Budget" subLabel="Total funds available (CAD).">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input type="number" name="savings" value={formData.savings} onChange={handleChange} className="input-field pl-10" />
                            </div>
                        </FormRow>
                        <FormRow label="Preferred Provinces">
                            <div className="grid grid-cols-2 gap-3">
                                {['Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Atlantic Provinces'].map(prov => (
                                    <label key={prov} className={`
                                        flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
                                        ${(formData.preferredProvinces || []).includes(prov) ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50 border-gray-200'}
                                    `}>
                                        <input 
                                            type="checkbox" 
                                            checked={(formData.preferredProvinces || []).includes(prov)} 
                                            onChange={() => handleArrayToggle('preferredProvinces', prov)}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{prov}</span>
                                    </label>
                                ))}
                            </div>
                        </FormRow>
                     </div>
                )}
                {step === 5 && (
                     <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-red-50 border-b border-red-100">
                             <h3 className="text-lg font-bold text-red-900 flex items-center gap-2"><ShieldAlert size={20}/> Background Check</h3>
                        </div>
                        <FormRow label="Visa History">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasVisaHistory} onClick={() => setFormData({...formData, hasVisaHistory: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasVisaHistory} onClick={() => setFormData({...formData, hasVisaHistory: false})} label="No" />
                            </div>
                        </FormRow>
                        <FormRow label="Refusal History">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasRefusalHistory} onClick={() => setFormData({...formData, hasRefusalHistory: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasRefusalHistory} onClick={() => setFormData({...formData, hasRefusalHistory: false})} label="No" />
                            </div>
                        </FormRow>
                        <FormRow label="Criminal Record">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasCriminalRecord} onClick={() => setFormData({...formData, hasCriminalRecord: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasCriminalRecord} onClick={() => setFormData({...formData, hasCriminalRecord: false})} label="No" />
                            </div>
                        </FormRow>
                     </div>
                )}

                {/* Nav Buttons */}
                <div className="p-8 flex justify-between mt-4 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={prevStep} 
                        disabled={step === 1}
                        className="text-gray-600 hover:text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Back
                    </button>
                    {step === studentSteps ? (
                        <button onClick={handleSubmit} className="bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 font-bold text-lg">
                        View Eligible Programs <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button onClick={nextStep} className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 font-bold">
                        Next Step <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- WORKER / DIRECT PR FLOW ---
  const workerSteps = 7;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-8 text-white flex justify-between items-center">
        <div>
             <h2 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="text-red-200" size={28}/> 
                Immigration Eligibility Check
            </h2>
            <p className="text-red-100 mt-2 opacity-90">Comprehensive 10-Point Analysis</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
            Step {step} of {workerSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5">
        <div className="bg-red-600 h-1.5 transition-all duration-500 ease-out" style={{ width: `${(step / workerSteps) * 100}%` }}></div>
      </div>

      <div className="p-0">
        
        {/* STEP 1: Stream, Resume & Basic Bio */}
        {step === 1 && (
            <div className="animate-fade-in">
                <div className="p-6 pb-0">
                    <ResumeUploadSection />
                </div>

                 <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {/* Q0: Stream */}
                    <FormRow label="Target Stream" subLabel="Which category are you hoping to qualify under?">
                        <select name="immigrationCategory" value={formData.immigrationCategory} onChange={handleChange} className="input-field">
                            <option value="Express Entry">Express Entry (CEC/FSW/FST)</option>
                            <option value="PNP">Provincial Nominee Program (PNP)</option>
                            <option value="Atlantic">Atlantic Immigration Program</option>
                            <option value="RNIP">Rural & Northern Pilot (RNIP)</option>
                            <option value="Express Entry + PNP">Other / Not Sure (Auto-Assess)</option>
                        </select>
                    </FormRow>

                    {/* Q1: Country */}
                    <FormRow label="Citizenship" subLabel="Your country of citizenship." required>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} className="input-field pl-10">
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </FormRow>

                    {/* Q2: Passport */}
                    <FormRow label="Passport Validity" subLabel="Do you have a valid passport with at least 1 year remaining?" required>
                         <div className="grid grid-cols-2 gap-4">
                             <SelectionCard selected={formData.passportValid} onClick={() => setFormData({...formData, passportValid: true})} label="Yes" />
                             <SelectionCard selected={!formData.passportValid} onClick={() => setFormData({...formData, passportValid: false})} label="No" />
                         </div>
                         {!formData.passportValid && (
                             <div className="mt-2 text-sm text-red-600 flex items-center gap-2 bg-red-50 p-2 rounded">
                                 <ShieldAlert size={16} /> You must renew your passport before applying.
                             </div>
                         )}
                    </FormRow>

                    {/* Q3: Age */}
                    <FormRow label="Age" subLabel="Your age today (Impacts CRS Score)." required>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field w-32" />
                        {formData.age < 18 && <div className="mt-2 text-red-500 text-sm">You must be 18+ for most streams.</div>}
                    </FormRow>

                    <FormRow label="Marital Status" required>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {['Never Married', 'Married', 'Common-Law', 'Divorced', 'Widowed'].map(status => (
                                <SelectionCard 
                                    key={status} 
                                    selected={formData.maritalStatus === status} 
                                    onClick={() => setFormData({...formData, maritalStatus: status})} 
                                    label={status} 
                                />
                             ))}
                        </div>
                    </FormRow>
                 </div>
            </div>
        )}

        {/* STEP 2: Work Experience */}
        {step === 2 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Work Experience</h3>
                     <p className="text-sm text-gray-500">Skilled work experience is mandatory (TEER 0, 1, 2, 3).</p>
                 </div>

                 {/* Q4.2: Total Years */}
                 <FormRow label="Total Experience" subLabel="Full-time skilled work in the last 10 years." required>
                        <select name="workExperienceYears" value={formData.workExperienceYears} onChange={handleChange} className="input-field">
                            <option value={0}>None / Less than 1 year</option>
                            <option value={1}>1 Year</option>
                            <option value={2}>2 Years</option>
                            <option value={3}>3 or more Years</option>
                        </select>
                 </FormRow>

                 {formData.workExperienceYears > 0 && (
                     <>
                        {/* Q4.3: Location */}
                        <FormRow label="Location of Work" subLabel="Where did you gain this experience?">
                             <div className="flex flex-col gap-3">
                                 <SelectionCard selected={formData.workExperienceLocation === 'Inside Canada'} onClick={() => setFormData({...formData, workExperienceLocation: 'Inside Canada', canadianWorkExperience: '1', foreignWorkExperience: 'None'})} label="Inside Canada Only" />
                                 <SelectionCard selected={formData.workExperienceLocation === 'Outside Canada'} onClick={() => setFormData({...formData, workExperienceLocation: 'Outside Canada', canadianWorkExperience: 'None', foreignWorkExperience: '1'})} label="Outside Canada Only" />
                                 <SelectionCard selected={formData.workExperienceLocation === 'Both'} onClick={() => setFormData({...formData, workExperienceLocation: 'Both', canadianWorkExperience: '1', foreignWorkExperience: '1'})} label="Both Inside & Outside" />
                             </div>
                        </FormRow>
                        
                        {/* Q4.1: Job Role */}
                        <FormRow label="Job Role / Title" subLabel="e.g. Software Engineer, Nurse, Carpenter.">
                            <input type="text" name="jobRole" value={formData.jobRole || ''} onChange={handleChange} className="input-field" placeholder="Enter your primary job title"/>
                        </FormRow>
                     </>
                 )}
            </div>
        )}

        {/* STEP 3: Education */}
        {step === 3 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Education</h3>
                 </div>
                 
                 {/* Q5: Level */}
                 <FormRow label="Highest Education" subLabel="Completed level." required>
                        <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field">
                            <option value="High School">Secondary (High School)</option>
                            <option value="Diploma">Diploma (1-2 Years)</option>
                            <option value="Bachelor">Bachelor's Degree</option>
                            <option value="Master">Master's Degree</option>
                            <option value="PhD">PhD / Doctorate</option>
                            <option value="Medical">Professional (Medical/Law/Pharmacy)</option>
                        </select>
                 </FormRow>

                 {/* Q6: ECA */}
                 <FormRow label="ECA Report" subLabel="Do you have an Educational Credential Assessment?">
                     <div className="grid grid-cols-2 gap-4">
                         <SelectionCard selected={formData.hasEca === true} onClick={() => setFormData({...formData, hasEca: true})} label="Yes" />
                         <SelectionCard selected={formData.hasEca === false} onClick={() => setFormData({...formData, hasEca: false})} label="No / In Progress" />
                     </div>
                     {!formData.hasEca && (
                         <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <Info size={14}/> An ECA is required for FSW eligibility unless your degree is Canadian.
                         </div>
                     )}
                 </FormRow>
            </div>
        )}

        {/* STEP 4: Language */}
        {step === 4 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Language Skills</h3>
                     <p className="text-sm text-gray-500">Minimum CLB 7 is usually required for Express Entry.</p>
                 </div>
                 
                 {/* Q7: English */}
                 <FormRow label="English Test" required>
                     <select 
                        value={formData.languageDetails.testType} 
                        onChange={(e) => handleLanguageChange('english', 'testType', e.target.value)} 
                        className="input-field"
                     >
                         <option value="None">No Test Taken</option>
                         <option value="IELTS">IELTS (General Training)</option>
                         <option value="CELPIP-G">CELPIP-G</option>
                         <option value="PTE Core">PTE Core</option>
                     </select>
                 </FormRow>

                 {formData.languageDetails.testType !== 'None' && (
                     <FormRow label="English Scores" subLabel="Overall & Sectional">
                         <div className="grid grid-cols-1 mb-3">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Overall Score</label>
                             <input 
                                type="number" 
                                step="0.5" 
                                value={formData.languageDetails.overallScore || 0} 
                                onChange={(e) => handleLanguageChange('english', 'overallScore', e.target.value)} 
                                className="input-field text-center font-mono font-bold bg-gray-50" 
                             />
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                            {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                                 <input 
                                    key={skill}
                                    type="number" 
                                    step="0.5" 
                                    placeholder={skill.charAt(0)}
                                    value={(formData.languageDetails as any)[skill.toLowerCase()]} 
                                    onChange={(e) => handleLanguageChange('english', skill.toLowerCase(), e.target.value)} 
                                    className="input-field text-center px-1" 
                                 />
                             ))}
                         </div>
                     </FormRow>
                 )}

                 {/* Q8: French */}
                 <FormRow label="French Test" subLabel="Have you taken TEF or TCF Canada?">
                    <select 
                        value={formData.frenchDetails?.testType || 'None'} 
                        onChange={(e) => handleLanguageChange('french', 'testType', e.target.value)} 
                        className="input-field"
                    >
                        <option value="None">None</option>
                        <option value="TEF Canada">TEF Canada</option>
                        <option value="TCF Canada">TCF Canada</option>
                    </select>
                 </FormRow>

                 {formData.frenchDetails && formData.frenchDetails.testType !== 'None' && (
                     <FormRow label="French Scores" subLabel="Enter your scores.">
                         <div className="grid grid-cols-1 mb-3">
                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Overall Score</label>
                             <input 
                                type="number" 
                                step="0.5" 
                                value={formData.frenchDetails.overallScore || 0} 
                                onChange={(e) => handleLanguageChange('french', 'overallScore', e.target.value)} 
                                className="input-field text-center font-mono font-bold" 
                             />
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                             {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                                 <input 
                                    key={skill}
                                    type="number" 
                                    step="0.5" 
                                    placeholder={skill.charAt(0)}
                                    value={(formData.frenchDetails as any)[skill.toLowerCase()]} 
                                    onChange={(e) => handleLanguageChange('french', skill.toLowerCase(), e.target.value)} 
                                    className="input-field text-center px-1" 
                                 />
                             ))}
                         </div>
                     </FormRow>
                 )}
            </div>
        )}

        {/* STEP 5: Funds & Job */}
        {step === 5 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Funds & Employment</h3>
                 </div>

                 {/* Q9: Funds */}
                 <FormRow label="Settlement Funds" subLabel="Do you have proof of funds (Cash/Savings)?">
                     <div className="flex flex-col gap-3">
                         <SelectionCard selected={!formData.savingsExempt && formData.savings > 0} onClick={() => setFormData({...formData, savingsExempt: false, savings: 15000})} label="Yes, I have savings" />
                         <SelectionCard selected={formData.savingsExempt === true} onClick={() => setFormData({...formData, savingsExempt: true})} label="Not Required (I have a valid Job Offer or Work Status)" />
                         <SelectionCard selected={!formData.savingsExempt && formData.savings === 0} onClick={() => setFormData({...formData, savingsExempt: false, savings: 0})} label="No" />
                     </div>
                     {!formData.savingsExempt && formData.savings > 0 && (
                         <div className="mt-4">
                             <label className="text-xs font-bold text-gray-500">Approx Amount (CAD)</label>
                             <input type="number" name="savings" value={formData.savings} onChange={handleChange} className="input-field mt-1" />
                         </div>
                     )}
                 </FormRow>

                 {/* Q10: Job Offer */}
                 <FormRow label="Canadian Job Offer" subLabel="Valid offer for at least 1 year?">
                     <div className="flex flex-col gap-3">
                        <SelectionCard selected={formData.hasJobOffer && formData.jobOfferIsLmia === true} onClick={() => setFormData({...formData, hasJobOffer: true, jobOfferIsLmia: true})} label="Yes, LMIA Supported (+50 pts)" />
                        <SelectionCard selected={formData.hasJobOffer && formData.jobOfferIsLmia === false} onClick={() => setFormData({...formData, hasJobOffer: true, jobOfferIsLmia: false})} label="Yes, LMIA Exempt (Intra-company, etc.)" />
                        <SelectionCard selected={!formData.hasJobOffer} onClick={() => setFormData({...formData, hasJobOffer: false})} label="No" />
                     </div>
                 </FormRow>
            </div>
        )}

        {/* STEP 6: History & Family */}
        {step === 6 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Canadian Connections</h3>
                 </div>
                 
                 {/* Q11: Study History */}
                 <FormRow label="Studied in Canada?" subLabel="At least 2 years full-time?">
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard selected={formData.hasCanadianEducation} onClick={() => setFormData({...formData, hasCanadianEducation: true})} label="Yes" />
                        <SelectionCard selected={!formData.hasCanadianEducation} onClick={() => setFormData({...formData, hasCanadianEducation: false})} label="No" />
                     </div>
                 </FormRow>

                 {/* Q12: Work History */}
                 <FormRow label="Worked in Canada?" subLabel="At least 1 year skilled?">
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard selected={formData.canadianWorkExperience !== 'None'} onClick={() => setFormData({...formData, canadianWorkExperience: '1'})} label="Yes" />
                        <SelectionCard selected={formData.canadianWorkExperience === 'None'} onClick={() => setFormData({...formData, canadianWorkExperience: 'None'})} label="No" />
                     </div>
                 </FormRow>

                 {/* Q13: Family */}
                 <FormRow label="Family in Canada" subLabel="Immediate family (Citizen or PR)?">
                     <div className="space-y-3">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={formData.hasSiblingInCanada} onChange={(e) => setFormData({...formData, hasSiblingInCanada: e.target.checked})} className="w-5 h-5 text-red-600"/>
                             <span>Sibling (Brother/Sister)</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" checked={formData.parentsInCanada} onChange={(e) => setFormData({...formData, parentsInCanada: e.target.checked})} className="w-5 h-5 text-red-600"/>
                             <span>Parent or Grandparent</span>
                         </label>
                     </div>
                 </FormRow>
            </div>
        )}

        {/* STEP 7: Province Preference */}
        {step === 7 && (
             <div className="animate-fade-in divide-y divide-gray-100">
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Destination</h3>
                </div>

                 {/* Q14 */}
                 <FormRow label="Provincial Preference" subLabel="Are you open to any province?">
                    <div className="space-y-4">
                         <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-gray-50">
                             <input type="radio" name="prov_pref" checked={formData.preferredProvinces.length === 0} onChange={() => setFormData({...formData, preferredProvinces: []})} />
                             <span className="font-bold text-gray-900">Yes, I am open to any province (Recommended)</span>
                         </label>
                         
                         <div>
                             <p className="text-sm font-bold mb-2 mt-4">Or select specific provinces:</p>
                             <div className="grid grid-cols-2 gap-2">
                                {['Ontario', 'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba', 'Nova Scotia', 'New Brunswick', 'Newfoundland', 'PEI'].map(prov => (
                                    <label key={prov} className="flex items-center gap-2 text-sm">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.preferredProvinces.includes(prov)}
                                            onChange={() => handleArrayToggle('preferredProvinces', prov)}
                                            className="rounded text-red-600"
                                        />
                                        {prov}
                                    </label>
                                ))}
                             </div>
                         </div>
                    </div>
                 </FormRow>
            </div>
        )}

        <div className="p-8 flex justify-between mt-4 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={prevStep} 
            disabled={step === 1}
            className="text-gray-600 hover:text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Back
          </button>
          
          {step === workerSteps ? (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-10 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2 font-bold text-lg"
            >
              Calculate Eligibility <CheckCircle size={20} />
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center gap-2 font-bold"
            >
              Next Step <ArrowRight size={20} />
            </button>
          )}
        </div>

      </div>

      {/* Styles Injection for this component */}
      <style>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            outline: none;
            transition: all 0.2s;
            background-color: #fff;
            font-size: 0.95rem;
            color: #1f2937;
            height: 3rem;
        }
        .input-field:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};
