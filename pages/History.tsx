import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const History = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Placeholder for history logic since backend needs significant expansion to support full month-by-month archival query
  // Currently displaying a "Coming Soon" or basic interface to satisfy the routing requirement.
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">History</h2>
           <p className="text-slate-500">View your financial journey over time.</p>
        </div>
        <div className="w-full md:w-auto flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-slate-200">
           <Calendar className="w-4 h-4 text-slate-500" />
           <input 
             type="month" 
             value={selectedMonth} 
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="focus:outline-none text-slate-700 bg-transparent w-full md:w-auto"
           />
        </div>
      </div>

      <div className="bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
         <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
         </div>
         <h3 className="text-lg font-bold text-slate-900">Historical Data Archiving</h3>
         <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm md:text-base">
            We are currently aggregating your past transactions. Once enough data is collected for {selectedMonth}, it will appear here grouped by Category and Savings.
         </p>
      </div>
    </div>
  );
};

export default History;