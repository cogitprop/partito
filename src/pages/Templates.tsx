import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/partito/Card';
import { Button } from '@/components/partito/Button';

const Templates = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'celebrations', label: 'Celebrations' },
    { id: 'social', label: 'Social' },
    { id: 'professional', label: 'Professional' },
    { id: 'seasonal', label: 'Seasonal' },
  ];

  const templates = [
    {
      id: 'birthday',
      name: 'Birthday Party',
      description: 'A celebration with friends and family',
      category: 'celebrations',
      gradient: 'linear-gradient(135deg, #FFE5E5 0%, #FFF5E5 100%)',
      emoji: '🎂',
    },
    {
      id: 'wedding-shower',
      name: 'Wedding Shower',
      description: 'Celebrate the bride or groom to be',
      category: 'celebrations',
      gradient: 'linear-gradient(135deg, #FFF5E5 0%, #FFE5F5 100%)',
      emoji: '💍',
    },
    {
      id: 'baby-shower',
      name: 'Baby Shower',
      description: 'Welcome a new arrival',
      category: 'celebrations',
      gradient: 'linear-gradient(135deg, #E5F5FF 0%, #FFF5E5 100%)',
      emoji: '👶',
    },
    {
      id: 'dinner-party',
      name: 'Dinner Party',
      description: 'An intimate gathering over food',
      category: 'social',
      gradient: 'linear-gradient(135deg, #FFF9F5 0%, #F5E5FF 100%)',
      emoji: '🍽️',
    },
    {
      id: 'game-night',
      name: 'Game Night',
      description: 'Board games, card games, fun',
      category: 'social',
      gradient: 'linear-gradient(135deg, #E5FFE5 0%, #E5F5FF 100%)',
      emoji: '🎲',
    },
    {
      id: 'movie-night',
      name: 'Movie Night',
      description: 'Film screening with friends',
      category: 'social',
      gradient: 'linear-gradient(135deg, #2D2B2A 0%, #5C5856 100%)',
      emoji: '🎬',
      dark: true,
    },
    {
      id: 'potluck',
      name: 'Potluck',
      description: 'Everyone brings something to share',
      category: 'social',
      gradient: 'linear-gradient(135deg, #FFF5E5 0%, #E5FFE5 100%)',
      emoji: '🥘',
    },
    {
      id: 'happy-hour',
      name: 'Team Happy Hour',
      description: 'Casual team gathering',
      category: 'professional',
      gradient: 'linear-gradient(135deg, #E5F5FF 0%, #FFF5E5 100%)',
      emoji: '🍻',
    },
    {
      id: 'networking',
      name: 'Networking Event',
      description: 'Connect with professionals',
      category: 'professional',
      gradient: 'linear-gradient(135deg, #5B9BD5 0%, #7CB798 100%)',
      emoji: '🤝',
      dark: true,
    },
    {
      id: 'workshop',
      name: 'Workshop',
      description: 'Interactive learning session',
      category: 'professional',
      gradient: 'linear-gradient(135deg, #F5E5FF 0%, #E5F5FF 100%)',
      emoji: '📝',
    },
    {
      id: 'holiday',
      name: 'Holiday Party',
      description: 'Celebrate the season',
      category: 'seasonal',
      gradient: 'linear-gradient(135deg, #E85555 0%, #7CB798 100%)',
      emoji: '🎄',
      dark: true,
    },
    {
      id: 'summer-bbq',
      name: 'Summer BBQ',
      description: 'Outdoor grilling and fun',
      category: 'seasonal',
      gradient: 'linear-gradient(135deg, #F5A623 0%, #FF6B6B 100%)',
      emoji: '🍔',
    },
    {
      id: 'new-years',
      name: "New Year's Eve",
      description: 'Ring in the new year',
      category: 'seasonal',
      gradient: 'linear-gradient(135deg, #2D2B2A 0%, #F5A623 100%)',
      emoji: '🥂',
      dark: true,
    },
  ];

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const handleUseTemplate = (templateId: string) => {
    navigate(`/create?template=${templateId}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-3">
          Event Templates
        </h1>
        <p className="text-warm-gray-500 text-lg max-w-[600px] mx-auto">
          Start with a template to create your event faster. Every template is fully customizable.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-coral text-white'
                : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-warm-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} hover className="overflow-hidden">
            <div
              className="h-36 flex items-center justify-center rounded-lg mb-4"
              style={{ background: template.gradient }}
            >
              <span className="text-5xl">{template.emoji}</span>
            </div>
            <h3 className="font-heading text-lg font-semibold mb-1">
              {template.name}
            </h3>
            <p className="text-warm-gray-500 text-sm mb-4">
              {template.description}
            </p>
            <Button variant="ghost" onClick={() => handleUseTemplate(template.id)}>
              Use This Template
            </Button>
          </Card>
        ))}
      </div>

      {/* Custom Event CTA */}
      <div className="text-center mt-16 p-8 md:p-12 bg-cream rounded-3xl">
        <h2 className="font-heading text-2xl font-semibold mb-3">
          Don't see what you need?
        </h2>
        <p className="text-warm-gray-500 mb-6">
          Start from scratch and build exactly what you want.
        </p>
        <Button onClick={() => navigate('/create')}>Create Custom Event</Button>
      </div>
    </div>
  );
};

export default Templates;
