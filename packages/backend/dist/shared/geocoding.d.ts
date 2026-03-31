export interface GeocodingResult {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}
export declare class GeocodingService {
    private static readonly NOMINATIM_BASE_URL;
    static geocodeAddress(address: string): Promise<GeocodingResult | null>;
    static reverseGeocode(lat: number, lon: number): Promise<string | null>;
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    private static toRad;
}
//# sourceMappingURL=geocoding.d.ts.map