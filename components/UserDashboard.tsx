
import React from 'react';
import { AIAnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Check, AlertTriangle, GraduationCap, TrendingUp, List, CheckCircle2, XCircle, ArrowRight, Sparkles, ArrowRightCircle, Info } from 'lucide-react';

interface UserDashboardProps {
  results: AIAnalysisResult;
  onBookConsultation: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ results, onBookConsultation }) => {
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
      {/* Header Section */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Your Immigration Assessment</h1>
        <p className="text-gray-600 mt-2">Powered by ImmiPlanner AI Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Score & CRS */}
        <div className="space-y-6">
          {/* Success Probability Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20}/>
              Visa Approval Probability
            </h3>
            <div className="h-48 w-full relative flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                <span className="text-3xl font-bold text-gray-900">{results.overallSuccessProbability}%</span>
                <span className="text-xs text-gray-500">Likelihood</span>
              </div>
            </div>
            <p className="text-sm text-center text-gray-600 mt-2">
              Based on current Canadian immigration trends and your profile data.
            </p>
          </div>

          {/* CRS Prediction Card (Dynamic based on Student vs Worker) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <List size={18} className="text-blue-600"/>
                CRS Score Projection
             </h3>
             
             {results.futureCrsPredictions ? (
                 <div className="space-y-5 mt-4">
                     {/* Current */}
                     <div>
                         <div className="flex justify-between text-sm mb-1">
                             <span className="font-medium text-gray-500">Current Score (As of Today)</span>
                             <span className="font-bold text-gray-900">{results.futureCrsPredictions.current}</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2">
                             <div className="bg-gray-400 h-2 rounded-full transition-all duration-500" style={{ width: getBarWidth(results.futureCrsPredictions.current) }}></div>
                         </div>
                     </div>

                     {/* Option 1 */}
                     <div>
                         <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-600 text-xs">Option 1: After 1 Year Study</span>
                             <span className="font-bold text-blue-600">{results.futureCrsPredictions.oneYearStudy}</span>
                         </div>
                         <div className="w-full bg-blue-50 rounded-full h-2">
                             <div className="bg-blue-400 h-2 rounded-full transition-all duration-500" style={{ width: getBarWidth(results.futureCrsPredictions.oneYearStudy) }}></div>
                         </div>
                     </div>

                     {/* Option 2 */}
                     <div>
                         <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-600 text-xs">Option 2: After 2 Years Study</span>
                             <span className="font-bold text-blue-600">{results.futureCrsPredictions.twoYearStudy}</span>
                         </div>
                         <div className="w-full bg-blue-50 rounded-full h-2">
                             <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: getBarWidth(results.futureCrsPredictions.twoYearStudy) }}></div>
                         </div>
                     </div>

                     {/* Option 3 (Highlight) */}
                     <div className="bg-green-50 p-3 rounded-lg border border-green-100 -mx-2">
                         <div className="flex justify-between text-sm mb-1">
                             <span className="font-bold text-green-800 text-xs flex items-center gap-1">
                                 Option 3: 2 Yr Study + 1 Yr Work <ArrowRight size={12}/>
                             </span>
                             <span className="font-extrabold text-green-700 text-lg">{results.futureCrsPredictions.twoYearStudyPlusWork}</span>
                         </div>
                         <div className="w-full bg-green-200 rounded-full h-2.5">
                             <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: getBarWidth(results.futureCrsPredictions.twoYearStudyPlusWork) }}></div>
                         </div>
                         <p className="text-[10px] text-green-700 mt-1 text-right font-medium">Highest PR Probability</p>
                     </div>
                 </div>
             ) : (
                 /* Fallback / Standard Worker View */
                 <>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-blue-600">{results.crsScorePrediction}</span>
                        <span className="text-sm text-gray-500">points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min((results.crsScorePrediction / 600) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Current cut-off trends hover around 480-520 for general draws.</p>
                 </>
             )}
          </div>

          {/* Assumptions Section (New) */}
          {results.assumptions && results.assumptions.length > 0 && (
             <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-6">
                <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                   <Info size={16}/> Analysis Assumptions
                </h3>
                <ul className="space-y-1">
                   {results.assumptions.map((note, idx) => (
                      <li key={idx} className="text-xs text-yellow-700 flex items-start gap-2">
                         <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500 shrink-0"></span>
                         {note}
                      </li>
                   ))}
                </ul>
             </div>
          )}

          {/* Call to Action */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <h3 className="font-bold text-red-900 mb-2">Need Professional Help?</h3>
            <p className="text-sm text-red-800 mb-4">
              Your profile has potential, but there are complexities. Book a consultation with a Regulated Canadian Immigration Consultant (RCIC).
            </p>
            <button 
              onClick={onBookConsultation}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition shadow-sm"
            >
              Book Consultation ($50)
            </button>
          </div>
        </div>

        {/* Middle & Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Strategic Advice */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> AI Strategic Advice
            </h3>
            <div className="space-y-3">
              {Array.isArray(results.strategicAdvice) && results.strategicAdvice.length > 0 ? (
                  <ul className="space-y-3">
                      {results.strategicAdvice.map((advice, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                              <span className="mt-1 text-blue-500 shrink-0">
                                  <ArrowRightCircle size={16} />
                              </span>
                              <span className="text-sm text-gray-800 leading-relaxed font-medium">{advice}</span>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-sm text-gray-600">{results.strategicAdvice}</p>
              )}
            </div>
          </div>

          {/* Top 3 Recommended Pathways */}
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

          {/* Strengths & Risks Grid */}
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

          {/* Detailed Pathway Assessment Table */}
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

          {/* Study Recommendations (Conditional) */}
          {results.studyRecommendations && results.studyRecommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <GraduationCap className="text-blue-600" size={20} /> Recommended Study Programs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.studyRecommendations.map((study, idx) => (
                   <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-bold text-gray-900">{study.programName}</h4>
                      <p className="text-sm text-blue-600 font-medium mb-2">{study.institution}</p>
                      <p className="text-xs text-gray-500">{study.matchReason}</p>
                   </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
