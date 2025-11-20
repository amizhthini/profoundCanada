
import React, { useState } from 'react';
import { AIAnalysisResult, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check, AlertTriangle, GraduationCap, TrendingUp, List, CheckCircle2, XCircle, ArrowRight, Sparkles, ArrowRightCircle, Info, Calendar, ChevronRight } from 'lucide-react';
import { StudyAdvisingModal } from './StudyAdvisingModal';
import { ConsultantBookingModal } from './ConsultantBookingModal';

interface UserDashboardProps {
  results: AIAnalysisResult;
  userProfile: UserProfile;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ results, userProfile }) => {
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showConsultantModal, setShowConsultantModal] = useState(false);

  const scoreData = [
    { name: 'Success', value: results.overallSuccessProbability },
    { name: 'Risk', value: 100 - results.overallSuccessProbability },
  ];

  const COLORS = ['#16a34a', '#f3f4f6'];

  // Sorting: Recommended first, then by eligibility score
  const allPathways = [
    ...results.recommendedPathways.map(p => ({...p, status: 'Recommended'})),
    ...(results.otherPathways || []).map(p => ({...p, status: 'Evaluated'}))
  ].sort((a, b) => {
      if (a.status === 'Recommended' && b.status !== 'Recommended') return -1;
      if (a.status !== 'Recommended' && b.status === 'Recommended') return 1;
      return b.eligibilityScore - a.eligibilityScore;
  });

  const getCompetitiveness = (score: number) => {
      if (score >= 80) return { label: "Highly Competitive", color: "text-green-600 bg-green-50" };
      if (score >= 60) return { label: "Competitive", color: "text-blue-600 bg-blue-50" };
      if (score >= 40) return { label: "Low Probability", color: "text-yellow-600 bg-yellow-50" };
      return { label: "Not Competitive", color: "text-gray-500 bg-gray-100" };
  };

  const getEligibility = (score: number) => {
      if (score > 0) return { label: "Eligible", icon: <CheckCircle2 size={16} className="text-green-600" /> };
      return { label: "Not Eligible", icon: <XCircle size={16} className="text-red-500" /> };
  };

  // Helper to calculate percentage relative to max possible CRS (approx 600 core, 1200 total, usually 500-600 is target range)
  const getBarWidth = (score: number) => `${Math.min((score / 600) * 100, 100)}%`;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <StudyAdvisingModal 
        isOpen={showStudyModal} 
        onClose={() => setShowStudyModal(false)} 
        userProfile={userProfile}
      />
      
      <ConsultantBookingModal
        isOpen={showConsultantModal}
        onClose={() => setShowConsultantModal(false)}
        userProfile={userProfile}
      />

      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Your Immigration Assessment</h1>
        <p className="text-gray-600 mt-2">Powered by ImmiPlanner AI Engine</p>
      </div>

      <div className="space-y-8">
        
        {/* ROW 1: Visa Probability (1), Need Professional Help (2), CRS Score (3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* 1. Visa Approval Probability */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-red-600" size={20}/>
                  Visa Approval
                </h3>
                <div className="h-40 w-full relative flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {scoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">{results.overallSuccessProbability}%</span>
                    <span className="text-[10px] text-gray-500">Likelihood</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 mt-2">
                  Based on current Canadian immigration trends.
                </p>
              </div>

             {/* 2. Need Professional Help? (CTA) */}
             <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200 flex flex-col gap-4">
                <h3 className="font-bold text-red-900 text-lg">Need Professional Help?</h3>
                
                {/* Option 1: Free Study Advice */}
                <div className="bg-white/60 p-3 rounded-lg border border-red-100">
                    <p className="text-sm text-red-900 font-bold mb-1">
                        Free consultation to choose your course & college?
                    </p>
                    <button 
                      onClick={() => setShowStudyModal(true)}
                      className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold py-2 rounded-lg transition text-xs flex items-center justify-center gap-1"
                    >
                      Book Free Appointment <ChevronRight size={14}/>
                    </button>
                </div>

                {/* Option 2: Paid Consultant */}
                <div className="flex flex-col h-full">
                    <p className="text-xs text-red-800 mb-3 italic leading-relaxed">
                        "Already have an offer letter? Your profile has potential, but there are complexities. A Regulated Consultant (RCIC) can maximize your chances."
                    </p>
                    <button 
                      onClick={() => setShowConsultantModal(true)}
                      className="w-full mt-auto bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition shadow-sm text-sm"
                    >
                      Book IRCC Consultant
                    </button>
                </div>
              </div>

              {/* 3. CRS Score Projection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <List size={18} className="text-blue-600"/>
                    CRS Projection
                </h3>
                <p className="text-xs text-gray-500 mb-4">Permanent Residency Eligibility</p>
                
                {results.futureCrsPredictions ? (
                    <div className="flex flex-col gap-4 flex-grow">
                        {/* Part A: As of Now */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">CRS Score as of Now</span>
                            <span className="text-3xl font-extrabold text-gray-800">{results.futureCrsPredictions.current}</span>
                            <span className="text-xs text-gray-400 block mt-1">Current Profile</span>
                        </div>

                        {/* Part B: Future (1-3 Years) */}
                        <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-2">In 1-3 Years (Projected)</span>
                            
                            <div className="space-y-2">
                                {/* Option 1 */}
                                <div className="flex justify-between items-center text-xs group">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">1</span>
                                        <span className="text-gray-600">1 Year Study</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-blue-300 h-1.5 rounded-full" style={{ width: getBarWidth(results.futureCrsPredictions.oneYearStudy) }}></div>
                                         </div>
                                         <span className="font-bold text-gray-700 w-8 text-right">{results.futureCrsPredictions.oneYearStudy}</span>
                                    </div>
                                </div>

                                {/* Option 2 */}
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">2</span>
                                        <span className="text-gray-600">2 Years Study <span className="text-[9px] text-green-600 font-bold ml-1">(High Chances)</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: getBarWidth(results.futureCrsPredictions.twoYearStudy) }}></div>
                                         </div>
                                         <span className="font-bold text-gray-700 w-8 text-right">{results.futureCrsPredictions.twoYearStudy}</span>
                                    </div>
                                </div>

                                {/* Option 3 */}
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px]">3</span>
                                        <span className="text-gray-600">2y Study + 1y Work <span className="text-[9px] text-green-700 font-extrabold ml-1">(Higher Chances)</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: getBarWidth(results.futureCrsPredictions.twoYearStudyPlusWork) }}></div>
                                         </div>
                                         <span className="font-bold text-green-700 w-8 text-right">{results.futureCrsPredictions.twoYearStudyPlusWork}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Worker View */
                    <div className="flex flex-col justify-center flex-grow">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-blue-600">{results.crsScorePrediction}</span>
                            <span className="text-sm text-gray-500">points</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((results.crsScorePrediction / 600) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Target range: 480-520+</p>
                    </div>
                )}
              </div>
        </div>

        {/* 4. Analysis Assumptions */}
        {results.assumptions && results.assumptions.length > 0 && (
             <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-6">
                <h3 className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                   <Info size={16}/> Analysis Assumptions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {results.assumptions.map((note, idx) => (
                        <div key={idx} className="text-xs text-yellow-700 flex items-start gap-2 bg-yellow-100/50 p-2 rounded">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                            {note}
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* 5. Recommended Study Programs */}
        {results.studyRecommendations && results.studyRecommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                     <GraduationCap className="text-blue-600" size={20} /> Recommended Study Programs
                  </h3>
                  <button 
                    onClick={() => setShowStudyModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition shadow-sm"
                  >
                    <Calendar size={16} />
                    Book Free Study Advice
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.studyRecommendations.map((study, idx) => (
                   <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
                      <h4 className="font-bold text-gray-900">{study.programName}</h4>
                      <p className="text-sm text-blue-600 font-medium mb-2">{study.institution}</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{study.location}</span>
                          <span>{study.tuition}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2 italic">"{study.matchReason}"</p>
                   </div>
                ))}
              </div>
            </div>
        )}

        {/* 6. Top 3 Recommended Pathways */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Recommended Pathways</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.recommendedPathways.slice(0, 3).map((path, idx) => (
                <div key={idx} className="border border-green-200 rounded-lg p-4 hover:shadow-md transition bg-green-50 flex flex-col h-full relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                      Best Match
                   </div>
                  <div className="mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${path.type === 'Federal' ? 'bg-purple-100 text-purple-700' : path.type === 'Provincial' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {path.type}
                    </span>
                    <h4 className="font-bold text-gray-900 leading-tight">{path.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 flex-grow">{path.description}</p>
                  <div className="mt-auto pt-2 border-t border-green-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-green-800">{path.timeline}</span>
                      <span className="text-sm font-bold text-green-700">{path.eligibilityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* 7. AI Strategic Advice */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> AI Strategic Advice
            </h3>
            <div className="space-y-3">
              {Array.isArray(results.strategicAdvice) && results.strategicAdvice.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                      {results.strategicAdvice.map((advice, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                              <span className="mt-1 text-blue-500 shrink-0">
                                  <ArrowRightCircle size={16} />
                              </span>
                              <span className="text-sm text-gray-800 leading-relaxed font-medium">{advice}</span>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-sm text-gray-600">{results.strategicAdvice}</p>
              )}
            </div>
        </div>

        {/* 8. Key Strengths & Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Check className="text-green-500" size={18} /> Key Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={18} /> Risk Factors
              </h3>
               <ul className="space-y-2">
                {results.riskFactors.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
        </div>

        {/* 9. Detailed Pathway Eligibility Assessment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <List size={20} className="text-gray-600"/> Detailed Pathway Eligibility Assessment
                </h3>
                <p className="text-sm text-gray-500 mt-1">Analysis of all relevant Federal and Provincial streams.</p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th className="px-6 py-3">Program</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Eligibility</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Competitiveness</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPathways.map((path, idx) => {
                            const comp = getCompetitiveness(path.eligibilityScore);
                            const elig = getEligibility(path.eligibilityScore);
                            return (
                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 block">{path.name}</span>
                                        <span className="text-xs text-gray-400">{path.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${path.type === 'Federal' ? 'bg-purple-50 text-purple-700' : 
                                              path.type === 'Provincial' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {path.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {elig.icon}
                                            <span className={path.eligibilityScore > 0 ? "text-gray-700" : "text-gray-400"}>
                                                {elig.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 w-32">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-700">{path.eligibilityScore}</span>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className={`h-1.5 rounded-full ${comp.color.split(' ')[0]}`} 
                                                    style={{ width: `${path.eligibilityScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${comp.color}`}>
                                            {comp.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};
