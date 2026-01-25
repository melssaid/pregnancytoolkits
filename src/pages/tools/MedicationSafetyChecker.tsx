import React, { useState } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, HelpCircle, Pill } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  category: 'safe' | 'caution' | 'unsafe' | 'unknown';
  description: string;
  alternative?: string;
}

// This would typically come from a larger database or API
const medicationDatabase: Medication[] = [
  {
    id: '1',
    name: 'Paracetamol (Acetaminophen)',
    category: 'safe',
    description: 'Generally considered safe for pain relief and fever during pregnancy.',
  },
  {
    id: '2',
    name: 'Ibuprofen',
    category: 'unsafe',
    description: 'Avoid, especially during the third trimester. Can affect fetal kidneys and heart.',
    alternative: 'Paracetamol',
  },
  {
    id: '3',
    name: 'Aspirin',
    category: 'caution',
    description: 'Low dose may be prescribed for preeclampsia risk, but avoid standard dose unless prescribed.',
  },
  {
    id: '4',
    name: 'Loratadine (Claritin)',
    category: 'safe',
    description: 'Generally considered safe for allergies.',
  },
  {
    id: '5',
    name: 'Diphenhydramine (Benadryl)',
    category: 'safe',
    description: 'Generally considered safe, but may cause drowsiness.',
  },
  {
    id: '6',
    name: 'Pseudoephedrine (Sudafed)',
    category: 'caution',
    description: 'Avoid in first trimester. May raise blood pressure.',
  },
  {
    id: '7',
    name: 'Isotretinoin (Accutane)',
    category: 'unsafe',
    description: 'Highly teratogenic. Causes severe birth defects. Strictly contraindicated.',
  },
  {
    id: '8',
    name: 'Amoxicillin',
    category: 'safe',
    description: 'Generally safe antibiotic when prescribed.',
  },
];

export default function MedicationSafetyChecker() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Medication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const result = medicationDatabase.find(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResult(result || null);
    setHasSearched(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unsafe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'caution': return <HelpCircle className="w-5 h-5 text-yellow-600" />;
      case 'unsafe': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <ToolFrame
      title="Medication Safety Checker"
      description="Check safety of common medications during pregnancy"
      category="Health Safety"
      icon={Pill}
    >
      {showDisclaimer && (
        <MedicalDisclaimer
          onAccept={() => setShowDisclaimer(false)}
          severity="high"
        />
      )}

      {!showDisclaimer && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter medication name (e.g., Ibuprofen)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="bg-hawaize-primary hover:bg-hawaize-primary/90">
                  <Search className="w-4 h-4 mr-2" />
                  Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <Card>
              <CardContent className="p-6">
                {searchResult ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{searchResult.name}</h3>
                      <Badge variant="outline" className={`${getCategoryColor(searchResult.category)} flex items-center gap-1`}>
                        {getCategoryIcon(searchResult.category)}
                        {searchResult.category.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50 text-gray-700">
                      <p className="font-medium mb-1">Safety Profile:</p>
                      <p>{searchResult.description}</p>
                    </div>

                    {searchResult.alternative && (
                      <div className="p-4 rounded-lg bg-green-50 text-green-800 border border-green-100">
                        <p className="font-medium flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          Safer Alternative:
                        </p>
                        <p>{searchResult.alternative}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">Medication not found in database</p>
                    <p className="text-sm mt-1">Please consult your healthcare provider directly.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-green-800">Safe</div>
              <p className="text-xs text-green-600">Usually safe to use</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 text-center">
              <HelpCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold text-yellow-800">Caution</div>
              <p className="text-xs text-yellow-600">Ask doctor first</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="font-semibold text-red-800">Unsafe</div>
              <p className="text-xs text-red-600">Avoid usage</p>
            </div>
          </div>
        </div>
      )}
    </ToolFrame>
  );
}
