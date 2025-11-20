
import React, { useState } from 'react';
import { X, Calendar, Clock, Star, ShieldCheck, Scale, CreditCard, CheckCircle, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface ConsultantBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

interface Consultant {
  id: string;
  name: string;
  type: 'RCIC' | 'Immigration Lawyer';
  specialization: string;
  rating: number;
  reviews: number;
  fee: number; // CAD
  image: string;
  available: boolean;
}

const MOCK_CONSULTANTS: Consultant[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    type: 'RCIC',
    specialization: 'Student Visas & Express Entry',
    rating: 4.9,
    reviews: 124,
    fee: 150,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    available: true
  },
  {
    id: '2',
    name: 'David Ross, JD',
    type: 'Immigration Lawyer',
    specialization: 'Refusals, Appeals & Business Immigration',
    rating: 5.0,
    reviews: 89,
    fee: 300,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    available: true
  },
  {
    id: '3',
    name: 'Priya Patel',
    type: 'RCIC',
    specialization: 'PNP & Family Sponsorship',
    rating: 4.8,
    reviews: 210,
    fee: 120,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    available: true
  }
];

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"
];

// Generate next 3 days
const getNextDays = () => {
  const days = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      fullDate: d.toISOString().split('T')[0]
    });
  }
  return days;
};

export const ConsultantBookingModal: React.FC<ConsultantBookingModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [step, setStep] = useState(1); // 1: List, 2: Schedule, 3: Payment, 4: Success
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    nameOnCard: ''
  });

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const processPayment = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
    }, 2000);
  };

  if (!isOpen) return null;

  const dates = getNextDays();

  const handleClose = () => {
    setStep(1);
    setSelectedConsultant(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              {step === 1 && "Select an Expert"}
              {step === 2 && "Schedule Appointment"}
              {step === 3 && "Secure Payment"}
              {step === 4 && "Booking Confirmed"}
            </h3>
            {step < 4 && <p className="text-xs text-gray-500">Step {step} of 3</p>}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-0 overflow-y-auto flex-grow bg-gray-50/50">
          
          {/* STEP 1: Select Consultant */}
          {step === 1 && (
            <div className="p-6 grid gap-4">
              {MOCK_CONSULTANTS.map((consultant) => (
                <div 
                  key={consultant.id} 
                  className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => { setSelectedConsultant(consultant); setStep(2); }}
                >
                  <img src={consultant.image} alt={consultant.name} className="w-16 h-16 rounded-full bg-gray-100 object-cover border border-gray-100" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{consultant.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                        ${consultant.type === 'RCIC' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {consultant.type === 'RCIC' ? <span className="flex items-center gap-1"><ShieldCheck size={10}/> RCIC</span> : <span className="flex items-center gap-1"><Scale size={10}/> Lawyer</span>}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{consultant.specialization}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={12} fill="currentColor"/> {consultant.rating}</span>
                      <span className="text-gray-400">({consultant.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-xl font-bold text-gray-900">${consultant.fee}</span>
                    <span className="text-xs text-gray-500 mb-2">per session</span>
                    <button className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-blue-600 transition-colors w-full">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: Schedule */}
          {step === 2 && selectedConsultant && (
             <div className="p-6">
               <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <img src={selectedConsultant.image} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase">Booking With</p>
                    <p className="font-bold text-gray-900">{selectedConsultant.name}</p>
                  </div>
                  <div className="ml-auto font-bold text-gray-900">${selectedConsultant.fee}</div>
               </div>

               <h4 className="text-sm font-bold text-gray-700 mb-3">Select Date</h4>
               <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
                  {dates.map((d) => (
                    <button
                      key={d.fullDate}
                      onClick={() => setSelectedDate(d.fullDate)}
                      className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl border transition-all
                        ${selectedDate === d.fullDate 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}
                    >
                      <span className={`text-xs font-medium uppercase ${selectedDate === d.fullDate ? 'text-blue-100' : 'text-gray-500'}`}>{d.day}</span>
                      <span className="text-2xl font-bold">{d.date}</span>
                    </button>
                  ))}
               </div>

               <h4 className="text-sm font-bold text-gray-700 mb-3">Select Time (EST)</h4>
               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      disabled={!selectedDate}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-1
                        ${!selectedDate ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}
                        ${selectedTime === time 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                          : 'border-gray-200 hover:border-blue-300 hover:text-blue-700'}`}
                    >
                      <Clock size={14} /> {time}
                    </button>
                  ))}
                </div>
             </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && selectedConsultant && (
            <div className="p-6">
               <div className="bg-gray-900 text-white p-6 rounded-xl mb-6 shadow-lg">
                 <div className="flex justify-between items-start mb-8">
                   <div>
                     <p className="text-gray-400 text-sm">Total to Pay</p>
                     <h2 className="text-3xl font-bold">${selectedConsultant.fee}.00 <span className="text-sm font-normal text-gray-400">CAD</span></h2>
                   </div>
                   <CreditCard className="text-gray-400" size={32} />
                 </div>
                 <div className="border-t border-gray-700 pt-4 flex justify-between text-sm">
                   <span className="text-gray-400">Consultation with {selectedConsultant.name}</span>
                   <span>{selectedDate} @ {selectedTime}</span>
                 </div>
               </div>

               <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-200">
                 <h4 className="font-bold text-gray-900 flex items-center gap-2"><Lock size={16}/> Payment Details</h4>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name on Card</label>
                    <input 
                      type="text" 
                      name="nameOnCard"
                      value={paymentDetails.nameOnCard}
                      onChange={handlePaymentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="J. Smith"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                    <input 
                      type="text" 
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      placeholder="0000 0000 0000 0000"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry</label>
                        <input 
                          type="text" 
                          name="expiry"
                          value={paymentDetails.expiry}
                          onChange={handlePaymentChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                          placeholder="MM/YY"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                        <input 
                          type="text" 
                          name="cvc"
                          value={paymentDetails.cvc}
                          onChange={handlePaymentChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                          placeholder="123"
                        />
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && selectedConsultant && (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle className="text-green-600 w-10 h-10" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
               <p className="text-gray-600 mb-8 max-w-sm">
                 Your appointment with <strong>{selectedConsultant.name}</strong> has been confirmed. A receipt and video link have been sent to your email.
               </p>
               
               <div className="bg-white border border-gray-200 rounded-xl p-4 w-full max-w-xs mb-8 shadow-sm">
                 <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                    <span className="text-gray-500 text-sm">Date</span>
                    <span className="font-bold text-gray-900">{selectedDate}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Time</span>
                    <span className="font-bold text-gray-900">{selectedTime}</span>
                 </div>
               </div>

               <button 
                onClick={handleClose}
                className="w-full max-w-xs bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition"
               >
                 Return to Dashboard
               </button>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        {step < 4 && (
          <div className="p-5 border-t border-gray-100 bg-white flex justify-between items-center">
             {step > 1 ? (
               <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-600 font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition">
                 <ArrowLeft size={18} /> Back
               </button>
             ) : <div></div>}

             {step === 1 && (
               <span className="text-sm text-gray-500">Select a profile to continue</span>
             )}

             {step === 2 && (
               <button 
                 disabled={!selectedDate || !selectedTime}
                 onClick={() => setStep(3)}
                 className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                 Proceed to Payment <ChevronRight size={18} />
               </button>
             )}

             {step === 3 && (
               <button 
                 onClick={processPayment}
                 disabled={isProcessing || !paymentDetails.cardNumber}
                 className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2 shadow-lg shadow-green-200"
               >
                 {isProcessing ? 'Processing...' : `Pay $${selectedConsultant?.fee}`} {!isProcessing && <CreditCard size={18} />}
               </button>
             )}
          </div>
        )}

      </div>
    </div>
  );
};
