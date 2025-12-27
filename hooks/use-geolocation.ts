import { useState, useEffect } from 'react';

interface UserLocation {
  country?: string;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getLocation() {
      try {
        // Try IP-based geolocation first (more reliable, doesn't require permission)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        setLocation({
          country: data.country_name,
          countryCode: data.country_code,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        
        // Store in localStorage for future use
        localStorage.setItem('userLocation', JSON.stringify({
          country: data.country_name,
          countryCode: data.country_code,
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Geolocation error:', err);
        
        // Fallback to browser geolocation if IP lookup fails
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLoading(false);
            },
            (error) => {
              // Default to US if everything fails
              setLocation({ countryCode: 'US', country: 'United States' });
              setError('Could not determine location');
              setLoading(false);
            }
          );
        } else {
          // Default to US
          setLocation({ countryCode: 'US', country: 'United States' });
          setLoading(false);
        }
      }
    }

    // Check if we have cached location
    const cached = localStorage.getItem('userLocation');
    if (cached) {
      try {
        setLocation(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {
        // Invalid cache, fetch new location
      }
    }

    getLocation();
  }, []);

  return { location, loading, error };
}
