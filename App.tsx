import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AssessmentForm } from './components/AssessmentForm';
import { UserDashboard } from './components/UserDashboard';
import { PartnerDashboard } from './components/PartnerDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { analyzeProfile } from './services/geminiService';
import { UserType, UserProfile, AIAnalysisResult } from './types';
import { Briefcase, GraduationCap, Building2, CheckCircle, Globe, Plane, ShieldCheck, Scale, UserCheck, BookOpen } from 'lucide-react';

type ViewState = 'country-selection' | 'landing' | 'assessment' | 'user-dashboard' | 'partner-dashboard' | 'super-admin-dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('country-selection');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AIAnalysisResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStart = (type: UserType) => {
    setUserType(type);
    if (type === UserType.Partner) {
      setView('partner-dashboard');
    } else if (type === UserType.SuperAdmin) {
      setView('super-admin-dashboard');
    } else {
      setView('assessment');
    }
  };

  const handleAssessmentSubmit = async (data: UserProfile) => {
    if (!userType) return;
    setIsLoading(true);
    try {
      const result = await analyzeProfile(data, userType);
      setAssessmentResult(result);
      setView('user-dashboard');
    } catch (error) {
      console.error("Assessment failed", error);
      alert("Something went wrong with the AI assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUserType(null);
    setAssessmentResult(null);
    setView('country-selection');
  };

  // Special handler for the hidden admin button in navbar
  const handleAdminLoginRequest = (v: string) => {
    if (v === 'super-admin-login') {
       handleStart(UserType.SuperAdmin);
    } else if (v === 'partner-login') {
       handleStart(UserType.Partner);
    } else {
       setView(v as ViewState);
    }
  }

  const toggleModal = () => setShowModal(!showModal);

  const countries = [
    { name: 'Canada', flag: '🇨🇦', description: 'Express Entry, PNP, & Study Pathways', active: true },
    { name: 'Australia', flag: '🇦🇺', description: 'SkillSelect & Subclass Visas', active: false },
    { name: 'UK', flag: '🇬🇧', description: 'Skilled Worker & Graduate Routes', active: false },
    { name: 'Finland', flag: '🇫🇮', description: 'Specialist & Startup Permits', active: false },
    { name: 'USA', flag: '🇺🇸', description: 'H-1B, Green Cards & O-1', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar userType={userType} onLogout={handleLogout} onSwitchView={handleAdminLoginRequest} />

      <div className="px-4 pb-12">
        {view === 'country-selection' && (
          <div className="max-w-6xl mx-auto text-center animate-fade-in mt-10">
             <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-50 rounded-full">
                   <Globe className="w-12 h-12 text-red-600" />
                </div>
             </div>
             <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Choose Your <span className="text-red-600">Destination</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Select a country to explore immigration pathways, study opportunities, and settlement guides.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {countries.map((country) => (
                <div
                  key={country.name}
                  onClick={() => {
                    if (country.active) {
                      setView('landing');
                    } else {
                      alert(`${country.name} module is coming soon!`);
                    }
                  }}
                  className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-200 transition cursor-pointer group relative overflow-hidden
                    ${country.active ? 'hover:shadow-lg hover:border-red-300 transform hover:-translate-y-1' : 'opacity-75 hover:bg-gray-50'}
                  `}
                >
                  <div className="text-6xl mb-6">{country.flag}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Migrate & Settle down in {country.name}</h3>
                  <p className="text-gray-500 text-sm">{country.description}</p>
                  {country.active && (
                     <div className="absolute top-4 right-4">
                        <span className="flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'landing' && (
          <div className="max-w-7xl mx-auto text-center animate-fade-in mt-10">
            <button 
              onClick={() => setView('country-selection')} 
              className="mb-8 text-gray-500 hover:text-red-600 flex items-center justify-center gap-2 mx-auto transition font-medium"
            >
                <Globe size={16} /> Back to Country Selection
            </button>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Your Dream to <span className="text-red-600">Canada</span> Starts Here.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The comprehensive lifecycle platform for students, skilled workers, and immigration consultants. 
              Get AI-powered assessment, clear pathways, and expert guidance.
            </p>

            {/* Consultant Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button onClick={toggleModal} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-full font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition shadow-sm">
                <UserCheck size={18} />
                Consult an IRCC Consultant
              </button>
              <button onClick={toggleModal} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-full font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition shadow-sm">
                <Scale size={18} />
                Consult an Immigration Lawyer
              </button>
              <button onClick={toggleModal} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-full font-medium hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition shadow-sm">
                <BookOpen size={18} />
                Consult an Education Consultant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Student Card */}
              <div 
                onClick={() => handleStart(UserType.Student)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-300 transition cursor-pointer group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">I am a Student</h3>
                <p className="text-gray-500">Find study programs, visa probability, and PGWP pathways.</p>
              </div>

              {/* Worker Card */}
              <div 
                onClick={() => handleStart(UserType.Worker)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-300 transition cursor-pointer group"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100">
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">I am a Skilled Worker</h3>
                <p className="text-gray-500">Check Express Entry eligibility, CRS score, and PNP options.</p>
              </div>

              {/* Direct PR Card */}
              <div 
                onClick={() => handleStart(UserType.Worker)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-300 transition cursor-pointer group"
              >
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-100">
                  <Plane className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Direct PR to Canada</h3>
                <p className="text-gray-500">Explore my options for Permanent Residency.</p>
              </div>

              {/* Partner Card */}
              <div 
                onClick={() => handleStart(UserType.Partner)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-300 transition cursor-pointer group"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Immigration Partner</h3>
                <p className="text-gray-500">Manage leads, automate assessments, and grow your business.</p>
              </div>
            </div>
          </div>
        )}

        {view === 'assessment' && userType && (
          <AssessmentForm userType={userType} onSubmit={handleAssessmentSubmit} isLoading={isLoading} />
        )}

        {view === 'user-dashboard' && assessmentResult && (
          <UserDashboard results={assessmentResult} onBookConsultation={toggleModal} />
        )}

        {view === 'partner-dashboard' && (
          <PartnerDashboard />
        )}

        {view === 'super-admin-dashboard' && (
          <SuperAdminDashboard />
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={toggleModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <span className="text-2xl">&times;</span>
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h3>
              <p className="text-gray-500 mt-2">
                A Regulated Canadian Immigration Consultant (RCIC) or relevant expert will contact you within 24 hours.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">Initial Consultation</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium text-gray-900">$50.00 CAD</span>
              </div>
            </div>
            <button 
              onClick={toggleModal}
              className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;