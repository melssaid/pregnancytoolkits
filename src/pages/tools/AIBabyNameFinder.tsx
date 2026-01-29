import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Heart, Star, Search, Shuffle, Info } from 'lucide-react';

interface NameSuggestion {
  name: string;
  meaning: string;
  origin: string;
  popularity: string;
}

interface FavoriteName {
  name: string;
  gender: string;
}

const boyNames: NameSuggestion[] = [
  { name: 'Liam', meaning: 'Strong-willed warrior', origin: 'Irish', popularity: 'Very Popular' },
  { name: 'Noah', meaning: 'Rest, comfort', origin: 'Hebrew', popularity: 'Very Popular' },
  { name: 'Oliver', meaning: 'Olive tree', origin: 'Latin', popularity: 'Very Popular' },
  { name: 'Elijah', meaning: 'My God is Yahweh', origin: 'Hebrew', popularity: 'Popular' },
  { name: 'James', meaning: 'Supplanter', origin: 'Hebrew', popularity: 'Classic' },
  { name: 'Lucas', meaning: 'Light', origin: 'Greek', popularity: 'Popular' },
  { name: 'Mason', meaning: 'Stone worker', origin: 'English', popularity: 'Popular' },
  { name: 'Ethan', meaning: 'Strong, firm', origin: 'Hebrew', popularity: 'Popular' },
  { name: 'Alexander', meaning: 'Defender of people', origin: 'Greek', popularity: 'Classic' },
  { name: 'Sebastian', meaning: 'Venerable', origin: 'Greek', popularity: 'Rising' },
  { name: 'Theodore', meaning: 'Gift of God', origin: 'Greek', popularity: 'Rising' },
  { name: 'Atlas', meaning: 'Bearer of the heavens', origin: 'Greek', popularity: 'Unique' },
];

const girlNames: NameSuggestion[] = [
  { name: 'Olivia', meaning: 'Olive tree', origin: 'Latin', popularity: 'Very Popular' },
  { name: 'Emma', meaning: 'Whole, universal', origin: 'Germanic', popularity: 'Very Popular' },
  { name: 'Charlotte', meaning: 'Free woman', origin: 'French', popularity: 'Very Popular' },
  { name: 'Sophia', meaning: 'Wisdom', origin: 'Greek', popularity: 'Very Popular' },
  { name: 'Amelia', meaning: 'Industrious', origin: 'Germanic', popularity: 'Popular' },
  { name: 'Isabella', meaning: 'Devoted to God', origin: 'Hebrew', popularity: 'Popular' },
  { name: 'Mia', meaning: 'Mine, beloved', origin: 'Scandinavian', popularity: 'Popular' },
  { name: 'Luna', meaning: 'Moon', origin: 'Latin', popularity: 'Rising' },
  { name: 'Aurora', meaning: 'Dawn', origin: 'Latin', popularity: 'Rising' },
  { name: 'Aria', meaning: 'Air, melody', origin: 'Italian', popularity: 'Rising' },
  { name: 'Violet', meaning: 'Purple flower', origin: 'Latin', popularity: 'Rising' },
  { name: 'Seraphina', meaning: 'Fiery, burning', origin: 'Hebrew', popularity: 'Unique' },
];

export default function AIBabyNameFinder() {
  const [gender, setGender] = useState<'boy' | 'girl' | 'both'>('both');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<FavoriteName[]>([]);
  const [displayedNames, setDisplayedNames] = useState<NameSuggestion[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('babyNameFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('babyNameFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let names: NameSuggestion[] = [];
    if (gender === 'boy' || gender === 'both') names = [...names, ...boyNames];
    if (gender === 'girl' || gender === 'both') names = [...names, ...girlNames];
    
    if (searchTerm) {
      names = names.filter(n => 
        n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setDisplayedNames(names);
  }, [gender, searchTerm]);

  const shuffleNames = () => {
    setDisplayedNames(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const toggleFavorite = (name: string, nameGender: string) => {
    const exists = favorites.find(f => f.name === name);
    if (exists) {
      setFavorites(favorites.filter(f => f.name !== name));
    } else {
      setFavorites([...favorites, { name, gender: nameGender }]);
    }
  };

  const isFavorite = (name: string) => favorites.some(f => f.name === name);

  return (
    <ToolFrame
      title="AI Baby Name Finder"
      subtitle="Discover the perfect name with meanings and cultural origins"
      customIcon="baby-growth"
      mood="joyful"
      toolId="ai-baby-name-finder"
    >
      <div className="space-y-6">
        {/* Gender Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              {[
                { id: 'boy', label: '👦 Boy', color: 'bg-blue-500' },
                { id: 'girl', label: '👧 Girl', color: 'bg-pink-500' },
                { id: 'both', label: '✨ Both', color: 'bg-primary' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGender(option.id as any)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    gender === option.id
                      ? `${option.color} text-white`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search names, meanings, or origins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={shuffleNames}>
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        {favorites.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                Your Favorites ({favorites.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <button
                    key={fav.name}
                    onClick={() => toggleFavorite(fav.name, fav.gender)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      fav.gender === 'boy' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    }`}
                  >
                    {fav.name} ✕
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Names List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Name Suggestions ({displayedNames.length})
            </h3>
            <div className="space-y-3">
              {displayedNames.slice(0, 12).map((nameData) => {
                const isGirl = girlNames.includes(nameData);
                return (
                  <div
                    key={nameData.name}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{nameData.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isGirl 
                            ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                        }`}>
                          {isGirl ? '♀' : '♂'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {nameData.popularity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Meaning:</span> {nameData.meaning}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Origin:</span> {nameData.origin}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(nameData.name, isGirl ? 'girl' : 'boy')}
                      className="p-2 rounded-full hover:bg-background transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          isFavorite(nameData.name) 
                            ? 'text-primary fill-primary' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Names and their meanings are based on common cultural interpretations. 
                Popularity rankings may vary by region and year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
