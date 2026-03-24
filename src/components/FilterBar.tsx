import React, { useState, useEffect } from 'react';
import { GABORONE_LOCATIONS, ACCOMMODATION_TYPES } from '../constants';
import { FilterPreference } from '../types';
import { Search, SlidersHorizontal, Bell, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FilterBarProps {
  onFilterChange: (filters: FilterPreference) => void;
  onSavePreference: (filters: FilterPreference) => void;
  initialFilters?: FilterPreference;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, onSavePreference, initialFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterPreference>(initialFilters || {
    minPrice: 0,
    maxPrice: 10000,
    location: '',
    type: '',
    availabilityDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: name.includes('Price') ? Number(value) : value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search location..." 
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            name="location"
            value={filters.location}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
          <button 
            onClick={() => onSavePreference(filters)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Bell size={18} />
            <span>Save Alert</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-100">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Min Price (BWP)</label>
                <input 
                  type="number" 
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Max Price (BWP)</label>
                <input 
                  type="number" 
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Type</label>
                <select 
                  name="type"
                  value={filters.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <option value="">All Types</option>
                  {ACCOMMODATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Available From</label>
                <input 
                  type="date" 
                  name="availabilityDate"
                  value={filters.availabilityDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
