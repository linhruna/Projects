import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vietnamProvinces, Province, getProvince } from '../data/vietnamProvinces';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressSelectorProps {
    selectedProvince: string;
    detailedAddress: string;
    onProvinceChange: (province: string) => void;
    onAddressChange: (address: string) => void;
    onCoordinatesChange?: (lat: number, lng: number) => void;
    disabled?: boolean;
}

interface AddressSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        road?: string;
        house_number?: string;
        suburb?: string;
        city_district?: string;
        district?: string;
    };
}

// Component to handle map click events
function LocationMarker({
    position,
    onPositionChange
}: {
    position: [number, number] | null;
    onPositionChange: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

// Component to update map center when province changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom, { animate: true });
    }, [center, zoom, map]);

    return null;
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
    selectedProvince,
    detailedAddress,
    onProvinceChange,
    onAddressChange,
    onCoordinatesChange,
    disabled = false,
}) => {
    const [showMap, setShowMap] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([16.0544, 108.2022]); // Default to center of Vietnam
    const [mapZoom, setMapZoom] = useState(6);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounce search query for autocomplete
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Fetch address suggestions when search query changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedSearchQuery.trim() || debouncedSearchQuery.length < 2 || !selectedProvince) {
                setSuggestions([]);
                return;
            }

            try {
                setIsLoadingSuggestions(true);
                const searchText = `${debouncedSearchQuery}, ${selectedProvince}, Vietnam`;

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&addressdetails=1&accept-language=vi`
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    setSuggestions(data);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchQuery, selectedProvince]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Update map when province changes
    useEffect(() => {
        if (selectedProvince) {
            const province = getProvince(selectedProvince);
            if (province) {
                setMapCenter([province.lat, province.lng]);
                setMapZoom(12);
                setShowMap(true);
            }
        } else {
            setShowMap(false);
            setMarkerPosition(null);
        }
    }, [selectedProvince]);

    const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        onProvinceChange(provinceName);
        setMarkerPosition(null);
        onAddressChange('');
        setSearchQuery('');
        setSuggestions([]);
    };

    const handleMarkerPositionChange = async (lat: number, lng: number) => {
        setMarkerPosition([lat, lng]);
        onCoordinatesChange?.(lat, lng);

        // Reverse geocoding to get address from coordinates
        try {
            setIsSearching(true);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
            );
            const data = await response.json();

            if (data.display_name) {
                // Extract relevant parts of the address
                const addressParts = [];
                if (data.address?.road) addressParts.push(data.address.road);
                if (data.address?.house_number) addressParts.unshift(data.address.house_number);
                if (data.address?.suburb) addressParts.push(data.address.suburb);
                if (data.address?.city_district || data.address?.district) {
                    addressParts.push(data.address.city_district || data.address.district);
                }

                const formattedAddress = addressParts.length > 0
                    ? addressParts.join(', ')
                    : data.display_name.split(',').slice(0, 3).join(', ');

                onAddressChange(formattedAddress);
                setSearchQuery(formattedAddress);
            }
        } catch (error) {
            console.error('Error getting address from coordinates:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);

        setMarkerPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(17);
        onCoordinatesChange?.(lat, lng);

        // Format the address nicely
        const addressParts = [];
        if (suggestion.address?.house_number) addressParts.push(suggestion.address.house_number);
        if (suggestion.address?.road) addressParts.push(suggestion.address.road);
        if (suggestion.address?.suburb) addressParts.push(suggestion.address.suburb);
        if (suggestion.address?.city_district || suggestion.address?.district) {
            addressParts.push(suggestion.address.city_district || suggestion.address.district);
        }

        const formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : suggestion.display_name.split(',').slice(0, 3).join(', ');

        onAddressChange(formattedAddress);
        setSearchQuery(formattedAddress);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSearchAddress = async () => {
        if (!searchQuery.trim() || !selectedProvince) return;

        try {
            setIsSearching(true);
            const searchText = `${searchQuery}, ${selectedProvince}, Vietnam`;

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1&accept-language=vi`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                setMarkerPosition([lat, lng]);
                setMapCenter([lat, lng]);
                setMapZoom(16);
                onCoordinatesChange?.(lat, lng);
                onAddressChange(searchQuery);
            }
        } catch (error) {
            console.error('Error searching address:', error);
        } finally {
            setIsSearching(false);
            setShowSuggestions(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchAddress();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    return (
        <div className="space-y-4">
            {/* Province Dropdown */}
            <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                        value={selectedProvince}
                        onChange={handleProvinceSelect}
                        disabled={disabled}
                        className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                        <option value="">-- Chọn tỉnh/thành phố --</option>
                        {vietnamProvinces.map((province) => (
                            <option key={province.code} value={province.name}>
                                {province.name}
                            </option>
                        ))}
                    </select>

                </div>
            </div>

            {/* Detailed Address with Map */}
            {showMap && selectedProvince && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground/80">
                        Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </label>

                    {/* Search Box with Autocomplete */}
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.length >= 2) {
                                            setShowSuggestions(true);
                                        }
                                    }}
                                    onKeyDown={handleKeyPress}
                                    onFocus={handleInputFocus}
                                    placeholder="Nhập địa chỉ (VD: 342 Khương Đình)"
                                    disabled={disabled || isSearching}
                                    className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
                                    autoComplete="off"
                                />
                                {(isSearching || isLoadingSuggestions) && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleSearchAddress}
                                disabled={disabled || isSearching || !searchQuery.trim()}
                                className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="hidden sm:inline">Tìm</span>
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div
                                ref={suggestionsRef}
                                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                            >
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={suggestion.place_id}
                                        type="button"
                                        onClick={() => handleSuggestionSelect(suggestion)}
                                        className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-start gap-3 ${index === 0 ? 'rounded-t-xl' : ''
                                            } ${index === suggestions.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'}`}
                                    >
                                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {suggestion.address?.road
                                                    ? `${suggestion.address.house_number || ''} ${suggestion.address.road}`.trim()
                                                    : suggestion.display_name.split(',')[0]
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {suggestion.display_name.split(',').slice(1, 4).join(',')}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No results message */}
                        {showSuggestions && suggestions.length === 0 && searchQuery.length >= 2 && !isLoadingSuggestions && (
                            <div className="absolute z-[2000] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Không tìm thấy địa chỉ. Hãy thử tìm kiếm khác hoặc click trên bản đồ.
                            </div>
                        )}
                    </div>

                    {/* Map Container */}
                    <div className="relative z-0 rounded-xl overflow-hidden border border-muted/50 shadow-sm" style={{ height: '300px' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={mapZoom}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={true}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapUpdater center={mapCenter} zoom={mapZoom} />
                            <LocationMarker
                                position={markerPosition}
                                onPositionChange={handleMarkerPositionChange}
                            />
                        </MapContainer>

                        {/* Map Instructions Overlay */}
                        <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs text-foreground/70 pointer-events-none">
                            💡 Nhập địa chỉ để xem gợi ý hoặc click vào bản đồ để chọn vị trí
                        </div>
                    </div>

                    {/* Selected Address Display */}
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Địa chỉ đã chọn
                        </label>
                        <input
                            type="text"
                            value={detailedAddress}
                            onChange={(e) => onAddressChange(e.target.value)}
                            placeholder="Địa chỉ sẽ hiển thị khi bạn chọn trên bản đồ..."
                            disabled={disabled}
                            className="w-full px-4 py-3 bg-muted/30 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                        <p className="text-xs text-foreground/50 mt-1">
                            Bạn có thể chỉnh sửa địa chỉ chi tiết (số nhà, ngõ, hẻm...)
                        </p>
                    </div>
                </div>
            )}

            {!showMap && !selectedProvince && (
                <div className="text-sm text-foreground/50 italic">
                    Vui lòng chọn tỉnh/thành phố để hiển thị bản đồ
                </div>
            )}
        </div>
    );
};

export default AddressSelector;
