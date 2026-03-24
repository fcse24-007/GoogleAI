import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { FilterBar } from '../components/FilterBar';
import { ListingCard } from '../components/ListingCard';
import { accommodationService } from '../services/accommodationService';
import { seedDatabase } from '../services/seedService';
import { Accommodation, FilterPreference } from '../types';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import { Loader2, Info } from 'lucide-react';

export const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Accommodation[]>([]);
  const [filteredListings, setFilteredListings] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [savedFilters, setSavedFilters] = useState<FilterPreference | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await seedDatabase();
        const data = await accommodationService.getListings();
        setListings(data);
        setFilteredListings(data);
        
        if (user) {
          const prefs = await accommodationService.getPreferences(user.uid);
          if (prefs) {
            setSavedFilters(prefs);
            // Check for new matches (simulated notification)
            const matches = data.filter(l => 
              l.status === 'Available' &&
              l.price <= (prefs.maxPrice || 10000) &&
              (prefs.location ? l.location.toLowerCase().includes(prefs.location.toLowerCase()) : true)
            );
            if (matches.length > 0) {
              console.log(`Notification: Found ${matches.length} new matches for your saved filters!`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load listings:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const handleFilterChange = (filters: FilterPreference) => {
    const filtered = listings.filter(l => {
      const matchesPrice = l.price >= (filters.minPrice || 0) && l.price <= (filters.maxPrice || 100000);
      const matchesLocation = filters.location ? l.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
      const matchesType = filters.type ? l.type === filters.type : true;
      const matchesDate = filters.availabilityDate ? new Date(l.availabilityDate) >= new Date(filters.availabilityDate) : true;
      return matchesPrice && matchesLocation && matchesType && matchesDate;
    });
    setFilteredListings(filtered);
  };

  const handleSavePreference = async (filters: FilterPreference) => {
    if (!user) {
      alert("Please login to save preferences.");
      return;
    }
    await accommodationService.savePreferences(user.uid, filters);
    setSavedFilters(filters);
    alert("Alert preferences saved successfully!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-neutral-500 font-medium">Finding the best options for you...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Find your next home</h1>
        <p className="text-neutral-500 text-lg">Explore 50+ affordable student accommodations in Gaborone.</p>
      </div>

      <FilterBar 
        onFilterChange={handleFilterChange} 
        onSavePreference={handleSavePreference}
        initialFilters={savedFilters || undefined}
      />

      {savedFilters && (
        <div className="mb-6 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-100">
          <Info size={18} />
          <span className="text-sm font-medium">
            Active Alert: 
            {savedFilters.maxPrice ? ` Max BWP ${savedFilters.maxPrice}` : ''}
            {savedFilters.location ? ` in ${savedFilters.location}` : ''}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-300">
            <p className="text-neutral-400 font-medium">No listings found matching your criteria.</p>
            <button 
              onClick={() => handleFilterChange({})}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
