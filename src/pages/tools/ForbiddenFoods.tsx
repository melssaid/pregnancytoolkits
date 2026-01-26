import React, { useState } from 'react';
import { ArrowLeft, Ban, CheckCircle, Search, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MedicalDisclaimer from '../../components/compliance/MedicalDisclaimer';

interface FoodItem {
  id: string;
  name: string;
  category: 'fish' | 'dairy' | 'meat' | 'drinks' | 'other';
  status: 'safe' | 'avoid' | 'limit';
  reason: string;
}

const foodDatabase: FoodItem[] = [
  { id: '1', name: 'Sushi (Raw Fish)', category: 'fish', status: 'avoid', reason: 'Risk of parasites and bacteria like Listeria' },
  { id: '2', name: 'Soft Cheese (Unpasteurized)', category: 'dairy', status: 'avoid', reason: 'Risk of Listeria contamination' },
  { id: '3', name: 'Coffee', category: 'drinks', status: 'limit', reason: 'Limit caffeine to 200mg/day to reduce risk of low birth weight' },
  { id: '4', name: 'Salmon (Cooked)', category: 'fish', status: 'safe', reason: 'Great source of Omega-3s. Ensure it is fully cooked.' },
  { id: '5', name: 'Deli Meat', category: 'meat', status: 'avoid', reason: 'Listeria risk unless heated until steaming hot' },
  { id: '6', name: 'Raw Eggs', category: 'other', status: 'avoid', reason: 'Risk of Salmonella' },
  { id: '7', name: 'Tuna (Albacore)', category: 'fish', status: 'limit', reason: 'Higher mercury content. Limit to 6oz per week.' },
  { id: '8', name: 'Alcohol', category: 'drinks', status: 'avoid', reason: 'No known safe amount. Can cause fetal alcohol spectrum disorders.' },
  { id: '9', name: 'Hard Cheeses', category: 'dairy', status: 'safe', reason: 'Generally safe as they are pasteurized and have low moisture' },
  { id: '10', name: 'Chicken', category: 'meat', status: 'safe', reason: 'Excellent protein source. Must be fully cooked.' },
];

const ForbiddenFoods: React.FC = () => {
  const navigate = useNavigate();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'safe' | 'avoid' | 'limit'>('all');

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || food.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Foods to Avoid Guide" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'safe': return 'bg-green-100 text-green-700 border-green-200';
      case 'avoid': return 'bg-red-100 text-red-700 border-red-200';
      case 'limit': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'safe': return <CheckCircle className="w-5 h-5" />;
      case 'avoid': return <Ban className="w-5 h-5" />;
      case 'limit': return <AlertCircle className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Food Safety Guide</h1>
              <p className="text-xs text-gray-500">What to eat & avoid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search foods (e.g. sushi, cheese)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {(['all', 'safe', 'limit', 'avoid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  filter === f 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredFoods.map(food => (
            <div key={food.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(food.status)}`}>
                {getStatusIcon(food.status)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{food.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${getStatusColor(food.status)} border-0`}>
                    {food.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {food.reason}
                </p>
              </div>
            </div>
          ))}
          
          {filteredFoods.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No foods found matching "{searchTerm}"</p>
              {searchTerm && (
                <button className="mt-4 text-red-600 font-medium text-sm">
                  Ask AI about "{searchTerm}"
                </button>
              )}
            </div>
          )}
        </div>

        {/* Legend/Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" /> Quick Rules
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">• <strong>Avoid:</strong> Raw meat/fish, unpasteurized dairy, deli meats (cold).</li>
            <li className="flex items-start gap-2">• <strong>Cook:</strong> Meats to 165°F (75°C).</li>
            <li className="flex items-start gap-2">• <strong>Wash:</strong> All fruits and vegetables thoroughly.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenFoods;
