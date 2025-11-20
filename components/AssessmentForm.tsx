
import React, { useState, useRef } from 'react';
import { UserProfile, UserType } from '../types';
import { Loader2, ArrowRight, CheckCircle, Upload, FileText, User, Briefcase, Languages, Heart, Award, Globe, GraduationCap, DollarSign, ShieldAlert, MapPin } from 'lucide-react';
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
    
    educationLevel: 'Bachelor',
    hasCanadianEducation: false,
    fieldOfStudy: '',
    intendedStudyField: '',
    gradesOrGpa: '',
    
    workExperienceYears: 0,
    canadianWorkExperience: 'None',
    foreignWorkExperience: 'None',
    
    englishScore: 0,
    languageDetails: {
        testType: 'None',
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0
    },

    certificateOfQualification: false,
    targetProvince: 'Ontario',
    preferredProvinces: [],
    savings: 25000,
    
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
            speaking: 0
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

  const handleLanguageChange = (field: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          languageDetails: {
              ...prev.languageDetails,
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

  // Logic for Worker/PR spouse flow
  const needsSpouseInfo = ['Married', 'Common-Law'].includes(formData.maritalStatus);
  const spouseIsForeign = needsSpouseInfo && !formData.spouse?.isCanadian;
  const spouseAccompanying = spouseIsForeign && formData.spouse?.comingToCanada;

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

                {/* Step 2: Education History */}
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
                             <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                <CheckCircle size={12}/> Accurate grades ensure better course matching.
                             </div>
                        </FormRow>
                    </div>
                )}

                {/* Step 3: Language */}
                {step === 3 && (
                    <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                             <h3 className="text-lg font-bold text-gray-900">Language Proficiency</h3>
                             <p className="text-sm text-gray-500">English or French test scores are critical for visa approval.</p>
                        </div>

                        <FormRow label="Language Test" subLabel="Have you taken an official test?">
                            <select 
                                value={formData.languageDetails.testType} 
                                onChange={(e) => handleLanguageChange('testType', e.target.value)} 
                                className="input-field"
                            >
                                <option value="None">No, not yet</option>
                                <option value="IELTS">IELTS Academic</option>
                                <option value="PTE Core">PTE Academic</option>
                                <option value="TOEFL">TOEFL</option>
                                <option value="Duolingo">Duolingo</option>
                            </select>
                        </FormRow>

                        {formData.languageDetails.testType !== 'None' && (
                             <FormRow label="Test Scores" subLabel="Enter your band scores for each section.">
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                                         <div key={skill}>
                                             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{skill}</label>
                                             <input 
                                                type="number" 
                                                step="0.5" 
                                                value={(formData.languageDetails as any)[skill.toLowerCase()]} 
                                                onChange={(e) => handleLanguageChange(skill.toLowerCase(), e.target.value)} 
                                                className="input-field text-center font-mono" 
                                             />
                                         </div>
                                     ))}
                                 </div>
                             </FormRow>
                        )}
                    </div>
                )}

                {/* Step 4: Intent & Preferences */}
                {step === 4 && (
                     <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                             <h3 className="text-lg font-bold text-gray-900">Study Goals</h3>
                             <p className="text-sm text-gray-500">Tell us what you want to study in Canada.</p>
                        </div>

                        <FormRow label="Intended Program" subLabel="What field do you want to study?">
                             <input type="text" name="intendedStudyField" value={formData.intendedStudyField} onChange={handleChange} className="input-field" placeholder="e.g. Project Management, Nursing, Data Science" />
                        </FormRow>

                        <FormRow label="First Year Budget" subLabel="Total funds available for tuition + living (CAD).">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input type="number" name="savings" value={formData.savings} onChange={handleChange} className="input-field pl-10" />
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-medium bg-gray-100 px-2 py-1 rounded">CAD</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Note: Minimum requirement is usually Tuition + $20,635.</p>
                        </FormRow>

                        <FormRow label="Preferred Provinces" subLabel="Where do you want to live and study?">
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
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                                            ${(formData.preferredProvinces || []).includes(prov) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}
                                        `}>
                                                {(formData.preferredProvinces || []).includes(prov) && <CheckCircle size={12} className="text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{prov}</span>
                                    </label>
                                ))}
                            </div>
                        </FormRow>
                     </div>
                )}

                {/* Step 5: Background & History */}
                {step === 5 && (
                     <div className="animate-fade-in divide-y divide-gray-100">
                        <div className="p-6 bg-red-50 border-b border-red-100">
                             <h3 className="text-lg font-bold text-red-900 flex items-center gap-2"><ShieldAlert size={20}/> Background Check</h3>
                             <p className="text-sm text-red-700">Honest answers are required for accurate visa risk assessment.</p>
                        </div>

                        <FormRow label="Visa History" subLabel="Have you previously studied or traveled to Canada?">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasVisaHistory} onClick={() => setFormData({...formData, hasVisaHistory: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasVisaHistory} onClick={() => setFormData({...formData, hasVisaHistory: false})} label="No" />
                            </div>
                        </FormRow>

                        <FormRow label="Refusal History" subLabel="Have you ever been refused a visa for ANY country?">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasRefusalHistory} onClick={() => setFormData({...formData, hasRefusalHistory: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasRefusalHistory} onClick={() => setFormData({...formData, hasRefusalHistory: false})} label="No" />
                            </div>
                        </FormRow>

                        <FormRow label="Criminal Record" subLabel="Do you have any criminal record in any country?">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasCriminalRecord} onClick={() => setFormData({...formData, hasCriminalRecord: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasCriminalRecord} onClick={() => setFormData({...formData, hasCriminalRecord: false})} label="No" />
                            </div>
                        </FormRow>

                        <FormRow label="Medical Issues" subLabel="Do you have a significant medical condition?">
                            <div className="grid grid-cols-2 gap-4">
                                <SelectionCard selected={formData.hasMedicalCondition} onClick={() => setFormData({...formData, hasMedicalCondition: true})} label="Yes" />
                                <SelectionCard selected={!formData.hasMedicalCondition} onClick={() => setFormData({...formData, hasMedicalCondition: false})} label="No" />
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
                        <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 font-bold text-lg"
                        >
                        View Eligible Programs <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button
                        onClick={nextStep}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2 font-bold"
                        >
                        Next Step <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- WORKER / DIRECT PR FLOW (Detailed Questionnaire) ---
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-8 text-white flex justify-between items-center">
        <div>
             <h2 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="text-red-200" size={28}/> 
                Immigration Eligibility Check
            </h2>
            <p className="text-red-100 mt-2 opacity-90">Comprehensive CRS & PNP Score Calculator.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
            Step {step} of {spouseAccompanying ? 5 : 4}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5">
        <div className="bg-red-600 h-1.5 transition-all duration-500 ease-out" style={{ width: `${(step / (spouseAccompanying ? 5 : 4)) * 100}%` }}></div>
      </div>

      <div className="p-0">
        
        {/* STEP 1: Resume & Personal */}
        {step === 1 && (
            <div className="animate-fade-in">
                <div className="p-6 pb-0">
                    <ResumeUploadSection />
                </div>

                 <div className="divide-y divide-gray-100 border-t border-gray-100">
                    <FormRow label="Full Name" subLabel="As per your passport." required>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe"/>
                    </FormRow>

                    <FormRow label="Age" subLabel="Age impacts your points significantly." required>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="input-field w-32" />
                    </FormRow>

                    <FormRow label="Country of Residence" required>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} className="input-field pl-10">
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </FormRow>

                    <FormRow label="Marital Status" subLabel="Affects your base factor points." required>
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
                    
                    {needsSpouseInfo && (
                         <div className="bg-gray-50 border-y border-gray-100">
                            <FormRow label="Spouse Status" subLabel="Is your spouse a Canadian Citizen or PR?">
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectionCard selected={formData.spouse?.isCanadian === true} onClick={() => handleSpouseChange('isCanadian', 'true')} label="Yes" />
                                    <SelectionCard selected={formData.spouse?.isCanadian === false} onClick={() => handleSpouseChange('isCanadian', 'false')} label="No" />
                                </div>
                            </FormRow>
                            {!formData.spouse?.isCanadian && (
                                <FormRow label="Accompanying?" subLabel="Will they come with you to Canada?">
                                    <div className="grid grid-cols-2 gap-3">
                                        <SelectionCard selected={formData.spouse?.comingToCanada === true} onClick={() => handleSpouseChange('comingToCanada', 'true')} label="Yes" />
                                        <SelectionCard selected={formData.spouse?.comingToCanada === false} onClick={() => handleSpouseChange('comingToCanada', 'false')} label="No" />
                                    </div>
                                </FormRow>
                            )}
                         </div>
                    )}

                    <FormRow label="Family in Canada" subLabel="Do you or your spouse have a sibling in Canada? (Citizen/PR, 18+)">
                        <div className="grid grid-cols-2 gap-4">
                             <SelectionCard selected={formData.hasSiblingInCanada} onClick={() => setFormData({...formData, hasSiblingInCanada: true})} label="Yes" />
                             <SelectionCard selected={!formData.hasSiblingInCanada} onClick={() => setFormData({...formData, hasSiblingInCanada: false})} label="No" />
                        </div>
                    </FormRow>
                 </div>
            </div>
        )}

        {/* STEP 2: Education & Work */}
        {step === 2 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Education & Work Experience</h3>
                     <p className="text-sm text-gray-500">Key drivers for your eligibility score.</p>
                 </div>
                 
                 <FormRow label="Education Level" subLabel="Highest degree, diploma or certificate." required>
                        <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input-field">
                            <option value="High School">Secondary (High School)</option>
                            <option value="Diploma">One or Two-year Diploma</option>
                            <option value="Bachelor">Bachelor's Degree (or 3+ year program)</option>
                            <option value="Master">Master's Degree / Professional Degree</option>
                            <option value="PhD">Doctoral (PhD)</option>
                        </select>
                 </FormRow>

                 <FormRow label="Canadian Education" subLabel="Was this degree earned in Canada?">
                     <div className="grid grid-cols-2 gap-4">
                         <SelectionCard selected={formData.hasCanadianEducation} onClick={() => setFormData({...formData, hasCanadianEducation: true})} label="Yes" />
                         <SelectionCard selected={!formData.hasCanadianEducation} onClick={() => setFormData({...formData, hasCanadianEducation: false})} label="No" />
                     </div>
                 </FormRow>

                 <FormRow label="Foreign Work Experience" subLabel="Skilled work outside Canada in last 10 years.">
                        <select name="foreignWorkExperience" value={formData.foreignWorkExperience} onChange={handleChange} className="input-field">
                            <option value="None">None</option>
                            <option value="1">1 Year</option>
                            <option value="2-3">2-3 Years</option>
                            <option value="3+">3 Years or more</option>
                        </select>
                 </FormRow>

                 <FormRow label="Canadian Work Experience" subLabel="Skilled work inside Canada (TEER 0, 1, 2, 3).">
                        <select name="canadianWorkExperience" value={formData.canadianWorkExperience} onChange={handleChange} className="input-field">
                            <option value="None">None</option>
                            <option value="1">1 Year</option>
                            <option value="2-3">2-3 Years</option>
                            <option value="4-5+">4 Years or more</option>
                        </select>
                 </FormRow>
            </div>
        )}

        {/* STEP 3: Language */}
        {step === 3 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Language Skills</h3>
                     <p className="text-sm text-gray-500">Results must be less than 2 years old.</p>
                 </div>
                 
                 <FormRow label="Test Type" required>
                     <select 
                        value={formData.languageDetails.testType} 
                        onChange={(e) => handleLanguageChange('testType', e.target.value)} 
                        className="input-field"
                     >
                         <option value="IELTS">IELTS (General Training)</option>
                         <option value="CELPIP-G">CELPIP-G</option>
                         <option value="PTE Core">PTE Core</option>
                         <option value="TEF Canada">TEF Canada (French)</option>
                         <option value="TCF Canada">TCF Canada (French)</option>
                     </select>
                 </FormRow>

                 <FormRow label="Scores" subLabel="Enter scores for each band.">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Reading', 'Writing', 'Listening', 'Speaking'].map((skill) => (
                             <div key={skill}>
                                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">{skill}</label>
                                 <input 
                                    type="number" 
                                    step="0.5" 
                                    value={(formData.languageDetails as any)[skill.toLowerCase()]} 
                                    onChange={(e) => handleLanguageChange(skill.toLowerCase(), e.target.value)} 
                                    className="input-field text-center font-mono text-lg" 
                                 />
                             </div>
                         ))}
                     </div>
                 </FormRow>
            </div>
        )}

        {/* STEP 4: Additional Factors */}
        {step === 4 && (
            <div className="animate-fade-in divide-y divide-gray-100">
                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <h3 className="text-lg font-bold text-gray-900">Additional Points</h3>
                     <p className="text-sm text-gray-500">Job offers and nominations can boost your score.</p>
                 </div>

                 <FormRow label="Job Offer" subLabel="Do you have a valid job offer from a Canadian employer?">
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard selected={formData.hasJobOffer} onClick={() => setFormData({...formData, hasJobOffer: true})} label="Yes" />
                        <SelectionCard selected={!formData.hasJobOffer} onClick={() => setFormData({...formData, hasJobOffer: false})} label="No" />
                     </div>
                     {formData.hasJobOffer && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-xs font-bold text-gray-700 mb-1">LMIA Supported?</label>
                                 <select className="input-field" onChange={(e) => setFormData({...formData, jobOfferIsLmia: e.target.value === 'Yes'})}>
                                     <option value="No">No</option>
                                     <option value="Yes">Yes</option>
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-xs font-bold text-gray-700 mb-1">NOC TEER</label>
                                 <select className="input-field" onChange={(e) => setFormData({...formData, jobOfferTeer: e.target.value})}>
                                     <option value="TEER 1-3">TEER 1, 2 or 3 (Skilled)</option>
                                     <option value="TEER 0">TEER 0 (Management)</option>
                                     <option value="TEER 4-5">TEER 4 or 5</option>
                                 </select>
                             </div>
                        </div>
                    )}
                 </FormRow>

                 <FormRow label="Provincial Nomination" subLabel="Do you have a nomination certificate? (+600 points)">
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard selected={formData.hasNominationCertificate} onClick={() => setFormData({...formData, hasNominationCertificate: true})} label="Yes" />
                        <SelectionCard selected={!formData.hasNominationCertificate} onClick={() => setFormData({...formData, hasNominationCertificate: false})} label="No" />
                     </div>
                 </FormRow>

                 <FormRow label="Trade Certificate" subLabel="Do you have a Certificate of Qualification from a Canadian province?">
                     <div className="grid grid-cols-2 gap-4">
                        <SelectionCard selected={formData.certificateOfQualification} onClick={() => setFormData({...formData, certificateOfQualification: true})} label="Yes" />
                        <SelectionCard selected={!formData.certificateOfQualification} onClick={() => setFormData({...formData, certificateOfQualification: false})} label="No" />
                     </div>
                 </FormRow>
            </div>
        )}

        {/* STEP 5: Spouse Details (Conditional) */}
        {step === 5 && spouseAccompanying && (
             <div className="animate-fade-in divide-y divide-gray-100">
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                     <h3 className="text-lg font-bold text-blue-900">Spouse Factors</h3>
                     <p className="text-sm text-blue-700">Your spouse's skills can add points to your profile.</p>
                </div>

                 <FormRow label="Spouse Education" subLabel="Their highest level of education.">
                     <select value={formData.spouse?.educationLevel} onChange={(e) => handleSpouseChange('educationLevel', e.target.value)} className="input-field">
                         <option value="High School">Secondary</option>
                         <option value="Diploma">Diploma</option>
                         <option value="Bachelor">Bachelor's Degree</option>
                         <option value="Master">Master's Degree</option>
                         <option value="PhD">Doctoral</option>
                     </select>
                 </FormRow>

                 <FormRow label="Spouse Canadian Work" subLabel="Their skilled work experience in Canada.">
                     <select value={formData.spouse?.canadianWorkExperienceYears} onChange={(e) => handleSpouseChange('canadianWorkExperienceYears', e.target.value)} className="input-field">
                         <option value="None">None</option>
                         <option value="1">1 Year</option>
                         <option value="2-3">2-3 Years</option>
                         <option value="4-5+">4+ Years</option>
                     </select>
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
          
          {((step === 4 && !spouseAccompanying) || (userType === 'Worker' && step === 5)) ? (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-10 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2 font-bold text-lg"
            >
              Calculate Score <CheckCircle size={20} />
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
