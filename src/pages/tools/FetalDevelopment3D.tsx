import React, { useState } from 'react';
import { ArrowLeft, Baby, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const weeklyData = [
  { week: 4, size: 'Poppy seed', length: '0.1 cm', weight: '<1 g', development: 'Cells are dividing rapidly. The neural tube is forming.' },
  { week: 8, size: 'Raspberry', length: '1.6 cm', weight: '1 g', development: 'Tiny fingers and toes are forming. Heart is beating.' },
  { week: 12, size: 'Lime', length: '5.4 cm', weight: '14 g', development: 'Reflexes are developing. Fingernails are forming.' },
  { week: 16, size: 'Avocado', length: '11.6 cm', weight: '100 g', development: 'Can make sucking motions. Bones are hardening.' },
  { week: 20, size: 'Banana', length: '16.4 cm', weight: '300 g', development: 'Can hear sounds. Regular sleep cycles begin.' },
  { week: 24, size: 'Corn', length: '30 cm', weight: '600 g', development: 'Lungs are developing. Responds to sounds.' },
  { week: 28, size: 'Eggplant', length: '37.6 cm', weight: '1 kg', development: 'Eyes can open and close. Brain is growing rapidly.' },
  { week: 32, size: 'Squash', length: '42.4 cm', weight: '1.7 kg', development: 'Practicing breathing. Bones are fully formed.' },
  { week: 36, size: 'Honeydew', length: '47.4 cm', weight: '2.6 kg', development: 'Lungs are nearly mature. Gaining weight rapidly.' },
  { week: 40, size: 'Watermelon', length: '51.2 cm', weight: '3.4 kg', development: 'Fully developed and ready for birth!' },
];

const FetalDevelopment3D: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(4); // Start at week 20

  const currentData = weeklyData[currentIndex];

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < weeklyData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">3D Fetal Development</h1>
              <p className="text-xs text-gray-500">Week by week growth tracker</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="p-3 bg-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="text-center">
            <span className="text-4xl font-bold text-purple-600">Week {currentData.week}</span>
          </div>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === weeklyData.length - 1}
            className="p-3 bg-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 3D Visualization Placeholder */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 flex flex-col items-center justify-center min-h-64">
          <div className="text-8xl mb-4">👶</div>
          <p className="text-lg font-semibold text-purple-700">Size: {currentData.size}</p>
          <p className="text-sm text-purple-600 mt-1">Tap to interact with 3D model</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Length</p>
            <p className="text-2xl font-bold text-gray-900">{currentData.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500">Weight</p>
            <p className="text-2xl font-bold text-gray-900">{currentData.weight}</p>
          </div>
        </div>

        {/* Development Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Development Highlights</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">{currentData.development}</p>
        </div>

        {/* Week Timeline */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Pregnancy Timeline</h3>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeklyData.map((data, index) => (
              <button
                key={data.week}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-10 h-10 rounded-full text-sm font-medium transition-all ${
                  index === currentIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {data.week}
              </button>
            ))}
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Sizes and weights are approximate averages. Every baby develops differently. Consult your healthcare provider for personalized information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FetalDevelopment3D;
