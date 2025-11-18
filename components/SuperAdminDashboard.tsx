import React, { useState } from 'react';
import { PartnerOrganization, UserType, Lead } from '../types';
import { 
  Users, Building2, TrendingUp, Shield, MoreVertical, 
  CheckCircle, XCircle, Search, Filter, DollarSign 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// Mock Data for Super Admin
const MOCK_PARTNERS: PartnerOrganization[] = [
  { id: '1', agencyName: 'Global Pathways Inc.', contactPerson: 'Alice Johnson', email: 'alice@globalpath.com', subscriptionPlan: 'Enterprise', status: 'Active', clientCount: 145, revenueGenerated: 4500 },
  { id: '2', agencyName: 'Maple Visa Experts', contactPerson: 'Raj Patel', email: 'raj@maplevisa.ca', subscriptionPlan: 'Pro', status: 'Active', clientCount: 62, revenueGenerated: 1200 },
  { id: '3', agencyName: 'Student Connect', contactPerson: 'Maria Garcia', email: 'maria@connect.org', subscriptionPlan: 'Basic', status: 'Pending', clientCount: 0, revenueGenerated: 0 },
  { id: '4', agencyName: 'FastTrack Immigration', contactPerson: 'John Smith', email: 'john@fasttrack.com', subscriptionPlan: 'Pro', status: 'Suspended', clientCount: 12, revenueGenerated: 400 },
];

const MOCK_DIRECT_USERS: Lead[] = [
  { id: '101', name: 'Emily Chen', email: 'emily.c@gmail.com', status: 'New', score: 78, type: UserType.Student, lastActive: '1 hr ago' },
  { id: '102', name: 'David Miller', email: 'david.m@outlook.com', status: 'In Progress', score: 88, type: UserType.Worker, lastActive: '3 days ago' },
  { id: '103', name: 'Sarah O-Connor', email: 'sarah.o@gmail.com', status: 'New', score: 65, type: UserType.Worker, lastActive: '1 week ago' },
];

const REVENUE_DATA = [
  { month: 'Jan', partners: 4000, direct: 2400 },
  { month: 'Feb', partners: 3000, direct: 1398 },
  { month: 'Mar', partners: 2000, direct: 9800 },
  { month: 'Apr', partners: 2780, direct: 3908 },
  { month: 'May', partners: 1890, direct: 4800 },
  { month: 'Jun', partners: 2390, direct: 3800 },
  { month: 'Jul', partners: 3490, direct: 4300 },
];

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'direct'>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-red-600" /> Super Admin Portal
          </h1>
          <p className="text-gray-500">Platform Overview & Management</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'partners' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Partners (B2B)
          </button>
          <button 
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'direct' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Direct Applicants
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">$124,500</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <DollarSign size={20} />
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">+18% vs last month</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Active Partners</p>
                  <h3 className="text-2xl font-bold text-gray-900">42</h3>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Building2 size={20} />
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">+3 new this week</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Direct Applicants</p>
                  <h3 className="text-2xl font-bold text-gray-900">1,892</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Users size={20} />
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium">+120 this week</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">AI Assessments</p>
                  <h3 className="text-2xl font-bold text-gray-900">15.2k</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <span className="text-xs text-gray-500">Lifetime API usage</span>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="partners" stroke="#7c3aed" strokeWidth={3} name="Partner Revenue" />
                  <Line type="monotone" dataKey="direct" stroke="#ef4444" strokeWidth={3} name="Direct Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-gray-900">Partner Consultancies</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search agencies..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:border-red-500" />
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 whitespace-nowrap">
                + Invite Partner
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Agency Name</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Clients</th>
                  <th className="px-6 py-3">Revenue</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PARTNERS.map((partner) => (
                  <tr key={partner.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{partner.agencyName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{partner.contactPerson}</span>
                        <span className="text-xs text-gray-400">{partner.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                        {partner.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4">{partner.clientCount}</td>
                    <td className="px-6 py-4">${partner.revenueGenerated}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${partner.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          partner.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600" title="Edit"><MoreVertical size={18} /></button>
                      {partner.status === 'Pending' && (
                        <button className="text-green-500 hover:text-green-700" title="Approve"><CheckCircle size={18} /></button>
                      )}
                      {partner.status === 'Active' && (
                        <button className="text-red-400 hover:text-red-600" title="Suspend"><XCircle size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'direct' && (
        <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Direct Applicants</h3>
            <div className="flex gap-2">
               <button className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-lg"><Filter size={18}/></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">AI Score</th>
                  <th className="px-6 py-3">Last Active</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DIRECT_USERS.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-full text-xs ${user.type === UserType.Worker ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {user.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                         <span className={`font-bold ${user.score > 80 ? 'text-green-600' : user.score > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {user.score}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.lastActive}</td>
                    <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">{user.status}</span>
                    </td>
                    <td className="px-6 py-4">
                        <button className="text-blue-600 hover:underline text-xs">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};