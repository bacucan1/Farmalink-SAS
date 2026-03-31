export class GeocodingService {
    static async geocodeAddress(address) {
        try {
            const encodedAddress = encodeURIComponent(address);
            const url = `${this.NOMINATIM_BASE_URL}/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Farmalink/1.0'
                }
            });
            if (!response.ok) {
                throw new Error(`Geocoding failed: ${response.status}`);
            }
            const data = (await response.json());
            if (!data || data.length === 0) {
                return null;
            }
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                formattedAddress: result.display_name
            };
        }
        catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }
    static async reverseGeocode(lat, lon) {
        try {
            const url = `${this.NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Farmalink/1.0'
                }
            });
            if (!response.ok) {
                throw new Error(`Reverse geocoding failed: ${response.status}`);
            }
            const data = (await response.json());
            return data.display_name || null;
        }
        catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static toRad(deg) {
        return deg * (Math.PI / 180);
    }
}
GeocodingService.NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
//# sourceMappingURL=geocoding.js.map