import React, { useState, useEffect } from 'react';
import { notificationsApi, UpcomingDelivery } from '../services/salesApi';
import { X, Calendar, Package, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const [deliveries, setDeliveries] = useState<UpcomingDelivery[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await notificationsApi.getUpcomingDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Failed to fetch upcoming deliveries:', error);
    }
  };

  const handleDismiss = (orderId: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(orderId);
    setDismissedIds(newDismissed);
  };

  const visibleDeliveries = deliveries.filter(d => !dismissedIds.has(d.order_id));

  return (
    <div className="absolute top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50" style={{ right: '1rem', maxHeight: '500px' }}>
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-base text-white">Upcoming Deliveries</h3>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '440px' }}>
        {visibleDeliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-base">
            No upcoming deliveries in the next 10 days
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {visibleDeliveries.map((delivery) => {
              const daysUntil = differenceInDays(new Date(delivery.expected_delivery_date), new Date());
              const isUrgent = daysUntil <= 3;
              
              return (
                <div
                  key={delivery.order_id}
                  className={`relative rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    isUrgent 
                      ? 'bg-red-50 border-red-300 hover:border-red-400' 
                      : 'bg-blue-50 border-blue-300 hover:border-blue-400'
                  }`}
                >
                  <button
                    onClick={() => handleDismiss(delivery.order_id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="pr-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-base font-bold px-2 py-0.5 ${
                        isUrgent 
                          ? 'text-red-700' 
                          : 'text-blue-700'
                      }`}>
                        {daysUntil === 0 ? 'IN -1 DAYS' : daysUntil === 1 ? 'TOMORROW' : `IN ${daysUntil} DAYS`}
                      </span>
                    </div>

                    <div className="space-y-2 text-base">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">{delivery.customer_name}</span>
                        <span className="text-gray-500 text-base">({delivery.customer_id})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-700">
                          <span className="font-semibold">{delivery.quantity}</span> units - {delivery.plant_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">
                          {format(new Date(delivery.expected_delivery_date), 'dd MMM yyyy')}
                        </span>
                      </div>

                      <div className="text-base text-gray-600 mt-2 pt-2 border-t border-gray-300 font-mono">
                        {delivery.order_id}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
