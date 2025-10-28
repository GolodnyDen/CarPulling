import type { Ride } from '../types';

let rides: Ride[] = JSON.parse(localStorage.getItem('rides') || '[]');

export const getRides = (): Ride[] => {
  return rides;
};

export const saveRides = (newRides: Ride[]) => {
  rides = newRides;
  localStorage.setItem('rides', JSON.stringify(rides));
};

export const createRide = (ride: Omit<Ride, 'id' | 'passengers'>): Ride => {
  const newRide: Ride = {
    ...ride,
    id: Date.now().toString(),
    passengers: [],
  };
  const updated = [...rides, newRide];
  saveRides(updated);
  return newRide;
};

export const joinRide = (rideId: string, userId: string) => {
  const updated = rides.map(ride => {
    if (ride.id === rideId && ride.seatsAvailable > 0) {
      return {
        ...ride,
        seatsAvailable: ride.seatsAvailable - 1,
        passengers: [...ride.passengers, userId],
      };
    }
    return ride;
  });
  saveRides(updated);
};