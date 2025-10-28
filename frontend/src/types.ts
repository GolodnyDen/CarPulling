export interface User {
  id: string;
  name: string;
  email: string;
  role: 'driver' | 'passenger';
}

export interface Ride {
  id: string;
  driverId: string;
  from: string;
  to: string;
  dateTime: string;
  seatsAvailable: number;
  passengers: string[];
}