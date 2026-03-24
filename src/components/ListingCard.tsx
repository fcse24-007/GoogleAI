import React from 'react';
import { Link } from 'react-router-dom';
import { Accommodation } from '../types';
import { MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ListingCardProps {
  listing: Accommodation;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const isReserved = listing.status === 'Reserved';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200 transition-all hover:shadow-md"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={listing.imageUrl} 
          alt={listing.title}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${isReserved ? 'grayscale' : ''}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isReserved ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {listing.status}
          </span>
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-wider text-neutral-700 shadow-sm">
            {listing.type}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full font-bold shadow-lg">
          BWP {listing.price.toLocaleString()}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{listing.title}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <MapPin size={14} className="text-blue-500" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <Calendar size={14} className="text-blue-500" />
            <span>Available: {listing.availabilityDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-6">
          {listing.amenities.slice(0, 3).map((amenity, idx) => (
            <span key={idx} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
              {amenity}
            </span>
          ))}
          {listing.amenities.length > 3 && (
            <span className="text-[10px] text-neutral-400 px-1">+{listing.amenities.length - 3} more</span>
          )}
        </div>

        <Link 
          to={`/listing/${listing.id}`}
          className="block w-full text-center py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};
