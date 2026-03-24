import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { accommodationService } from '../services/accommodationService';
import { Accommodation, UserProfile } from '../types';
import { useAuth } from '../components/AuthProvider';
import { CAMPUS_COORDINATES } from '../constants';
import { Chat } from '../components/Chat';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Navigation, 
  CreditCard, 
  Loader2,
  ArrowLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });

  useEffect(() => {
    const fetchListing = async () => {
      if (id) {
        const data = await accommodationService.getListingById(id);
        setListing(data);
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const handlePayment = async () => {
    if (!user || !listing) return;
    const receipt = await accommodationService.reserveListing(listing.id, user.uid);
    setPaymentSuccess(receipt);
    setListing({ ...listing, status: 'Reserved' });
  };

  const openGoogleMaps = () => {
    if (!listing) return;
    const ub = CAMPUS_COORDINATES["University of Botswana"];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${listing.latitude},${listing.longitude}&destination=${ub.lat},${ub.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Listing not found</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold">Back to Home</button>
        </div>
      </Layout>
    );
  }

  const ubDistance = calculateDistance(listing.latitude, listing.longitude, CAMPUS_COORDINATES["University of Botswana"].lat, CAMPUS_COORDINATES["University of Botswana"].lng);
  const isReserved = listing.status === 'Reserved';

  return (
    <Layout>
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        <span>Back to listings</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-lg">
            <img 
              src={listing.imageUrl} 
              alt={listing.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {isReserved && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                  <XCircle className="text-red-500" size={32} />
                  <span className="text-2xl font-bold text-neutral-900 uppercase tracking-tight">Already Reserved</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-2 text-neutral-500">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-lg font-medium">{listing.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">BWP {listing.price.toLocaleString()}</div>
                <div className="text-sm text-neutral-400 font-medium">per month</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Type</div>
                <div className="font-bold">{listing.type}</div>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Deposit</div>
                <div className="font-bold">BWP {listing.depositAmount}</div>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Available</div>
                <div className="font-bold">{listing.availabilityDate}</div>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Distance</div>
                <div className="font-bold text-blue-600">{ubDistance} km to UB</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-neutral-600 leading-relaxed">{listing.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, idx) => (
                  <span key={idx} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                    <CheckCircle size={14} />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions and Chat */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Take Action</h2>
            
            <div className="space-y-4">
              <button 
                disabled={isReserved}
                onClick={() => setShowPayment(true)}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all ${
                  isReserved 
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
              >
                <CreditCard size={20} />
                <span>{isReserved ? 'Already Reserved' : 'Pay Deposit'}</span>
              </button>

              <button 
                onClick={openGoogleMaps}
                className="w-full flex items-center justify-center gap-3 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                <Navigation size={20} />
                <span>Route to Campus</span>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-neutral-400" />
                <span className="text-sm font-medium text-neutral-500">Distance to major campuses:</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-neutral-600">University of Botswana</span>
                  <span className="font-bold">{ubDistance} km</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-neutral-600">Botho University</span>
                  <span className="font-bold">{calculateDistance(listing.latitude, listing.longitude, CAMPUS_COORDINATES["Botho University"].lat, CAMPUS_COORDINATES["Botho University"].lng)} km</span>
                </li>
              </ul>
            </div>
          </div>

          {user && profile && (
            <Chat 
              accommodationId={listing.id} 
              currentUser={profile} 
              landlordId={listing.providerId} 
            />
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayment(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
            >
              {!paymentSuccess ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">Simulated Payment</h2>
                  <p className="text-neutral-500 mb-6">Enter any dummy details to complete the reservation for <span className="font-bold text-neutral-900">{listing.title}</span>.</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="XXXX XXXX XXXX XXXX"
                        className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Expiry</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">CVC</label>
                        <input 
                          type="text" 
                          placeholder="XXX"
                          className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPayment(false)}
                      className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePayment}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      Pay BWP {listing.depositAmount}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-neutral-500 mb-8">Your reservation for <span className="font-bold text-neutral-900">{listing.title}</span> is confirmed.</p>
                  
                  <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 mb-8">
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">Receipt Number</div>
                    <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider">{paymentSuccess}</div>
                  </div>

                  <button 
                    onClick={() => setShowPayment(false)}
                    className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};
