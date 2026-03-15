// List of all 63 provinces/cities in Vietnam with coordinates
export interface Province {
    name: string;
    code: string;
    lat: number;
    lng: number;
    isMetroCity: boolean; // Hanoi or Ho Chi Minh City for shipping calculation
}

export const vietnamProvinces: Province[] = [
    // Major cities first
    { name: 'Hà Nội', code: 'HN', lat: 21.0285, lng: 105.8542, isMetroCity: true },
    { name: 'TP. Hồ Chí Minh', code: 'HCM', lat: 10.8231, lng: 106.6297, isMetroCity: true },
    { name: 'Đà Nẵng', code: 'DN', lat: 16.0544, lng: 108.2022, isMetroCity: false },
    { name: 'Hải Phòng', code: 'HP', lat: 20.8449, lng: 106.6881, isMetroCity: false },
    { name: 'Cần Thơ', code: 'CT', lat: 10.0452, lng: 105.7469, isMetroCity: false },

    // Northern provinces
    { name: 'Hà Giang', code: 'HG', lat: 22.8233, lng: 104.9833, isMetroCity: false },
    { name: 'Cao Bằng', code: 'CB', lat: 22.6666, lng: 106.2577, isMetroCity: false },
    { name: 'Bắc Kạn', code: 'BK', lat: 22.1471, lng: 105.8348, isMetroCity: false },
    { name: 'Tuyên Quang', code: 'TQ', lat: 21.8189, lng: 105.2181, isMetroCity: false },
    { name: 'Lào Cai', code: 'LC', lat: 22.4856, lng: 103.9707, isMetroCity: false },
    { name: 'Điện Biên', code: 'DB', lat: 21.3860, lng: 103.0208, isMetroCity: false },
    { name: 'Lai Châu', code: 'LCH', lat: 22.3864, lng: 103.4703, isMetroCity: false },
    { name: 'Sơn La', code: 'SL', lat: 21.3256, lng: 103.9188, isMetroCity: false },
    { name: 'Yên Bái', code: 'YB', lat: 21.7168, lng: 104.8986, isMetroCity: false },
    { name: 'Hòa Bình', code: 'HB', lat: 20.8133, lng: 105.3383, isMetroCity: false },
    { name: 'Thái Nguyên', code: 'TN', lat: 21.5928, lng: 105.8442, isMetroCity: false },
    { name: 'Lạng Sơn', code: 'LS', lat: 21.8531, lng: 106.7615, isMetroCity: false },
    { name: 'Quảng Ninh', code: 'QN', lat: 21.0064, lng: 107.2925, isMetroCity: false },
    { name: 'Bắc Giang', code: 'BG', lat: 21.2819, lng: 106.1974, isMetroCity: false },
    { name: 'Phú Thọ', code: 'PT', lat: 21.4005, lng: 105.2280, isMetroCity: false },
    { name: 'Vĩnh Phúc', code: 'VP', lat: 21.3089, lng: 105.6047, isMetroCity: false },
    { name: 'Bắc Ninh', code: 'BN', lat: 21.1861, lng: 106.0763, isMetroCity: false },
    { name: 'Hải Dương', code: 'HD', lat: 20.9373, lng: 106.3146, isMetroCity: false },
    { name: 'Hưng Yên', code: 'HY', lat: 20.6464, lng: 106.0511, isMetroCity: false },
    { name: 'Thái Bình', code: 'TB', lat: 20.4463, lng: 106.3365, isMetroCity: false },
    { name: 'Hà Nam', code: 'HNA', lat: 20.5835, lng: 105.9220, isMetroCity: false },
    { name: 'Nam Định', code: 'ND', lat: 20.4388, lng: 106.1621, isMetroCity: false },
    { name: 'Ninh Bình', code: 'NB', lat: 20.2539, lng: 105.9749, isMetroCity: false },

    // Central provinces
    { name: 'Thanh Hóa', code: 'TH', lat: 19.8066, lng: 105.7852, isMetroCity: false },
    { name: 'Nghệ An', code: 'NA', lat: 18.6737, lng: 105.6923, isMetroCity: false },
    { name: 'Hà Tĩnh', code: 'HT', lat: 18.3559, lng: 105.8877, isMetroCity: false },
    { name: 'Quảng Bình', code: 'QB', lat: 17.4690, lng: 106.6222, isMetroCity: false },
    { name: 'Quảng Trị', code: 'QT', lat: 16.8164, lng: 107.1009, isMetroCity: false },
    { name: 'Thừa Thiên Huế', code: 'TTH', lat: 16.4637, lng: 107.5909, isMetroCity: false },
    { name: 'Quảng Nam', code: 'QNA', lat: 15.5394, lng: 108.0191, isMetroCity: false },
    { name: 'Quảng Ngãi', code: 'QNG', lat: 15.1214, lng: 108.8044, isMetroCity: false },
    { name: 'Bình Định', code: 'BD', lat: 13.7820, lng: 109.2197, isMetroCity: false },
    { name: 'Phú Yên', code: 'PY', lat: 13.0882, lng: 109.0929, isMetroCity: false },
    { name: 'Khánh Hòa', code: 'KH', lat: 12.2388, lng: 109.1967, isMetroCity: false },
    { name: 'Ninh Thuận', code: 'NT', lat: 11.5675, lng: 108.9880, isMetroCity: false },
    { name: 'Bình Thuận', code: 'BTH', lat: 10.9280, lng: 108.1021, isMetroCity: false },

    // Central Highlands
    { name: 'Kon Tum', code: 'KT', lat: 14.3497, lng: 108.0005, isMetroCity: false },
    { name: 'Gia Lai', code: 'GL', lat: 13.9833, lng: 108.0000, isMetroCity: false },
    { name: 'Đắk Lắk', code: 'DL', lat: 12.6667, lng: 108.0500, isMetroCity: false },
    { name: 'Đắk Nông', code: 'DNO', lat: 12.0045, lng: 107.6872, isMetroCity: false },
    { name: 'Lâm Đồng', code: 'LD', lat: 11.5753, lng: 108.1429, isMetroCity: false },

    // Southeastern provinces
    { name: 'Bình Phước', code: 'BP', lat: 11.7512, lng: 106.7235, isMetroCity: false },
    { name: 'Tây Ninh', code: 'TNI', lat: 11.3356, lng: 106.1098, isMetroCity: false },
    { name: 'Bình Dương', code: 'BDU', lat: 11.1675, lng: 106.6332, isMetroCity: false },
    { name: 'Đồng Nai', code: 'DNI', lat: 10.9453, lng: 106.8243, isMetroCity: false },
    { name: 'Bà Rịa - Vũng Tàu', code: 'BRVT', lat: 10.4114, lng: 107.1362, isMetroCity: false },

    // Mekong Delta provinces
    { name: 'Long An', code: 'LA', lat: 10.5560, lng: 106.6498, isMetroCity: false },
    { name: 'Tiền Giang', code: 'TG', lat: 10.3601, lng: 106.3420, isMetroCity: false },
    { name: 'Bến Tre', code: 'BT', lat: 10.2435, lng: 106.3756, isMetroCity: false },
    { name: 'Trà Vinh', code: 'TV', lat: 9.9473, lng: 106.3420, isMetroCity: false },
    { name: 'Vĩnh Long', code: 'VL', lat: 10.2538, lng: 105.9722, isMetroCity: false },
    { name: 'Đồng Tháp', code: 'DT', lat: 10.4938, lng: 105.6882, isMetroCity: false },
    { name: 'An Giang', code: 'AG', lat: 10.3860, lng: 105.4356, isMetroCity: false },
    { name: 'Kiên Giang', code: 'KG', lat: 10.0125, lng: 105.0809, isMetroCity: false },
    { name: 'Hậu Giang', code: 'HGI', lat: 9.7579, lng: 105.6413, isMetroCity: false },
    { name: 'Sóc Trăng', code: 'ST', lat: 9.6017, lng: 105.9739, isMetroCity: false },
    { name: 'Bạc Liêu', code: 'BL', lat: 9.2941, lng: 105.7276, isMetroCity: false },
    { name: 'Cà Mau', code: 'CM', lat: 9.1769, lng: 105.1524, isMetroCity: false },
];

// Helper function to check if a province is a metro city (for shipping calculation)
export const isMetroCity = (provinceName: string): boolean => {
    const province = vietnamProvinces.find(
        p => p.name.toLowerCase() === provinceName.toLowerCase() ||
            p.code.toLowerCase() === provinceName.toLowerCase()
    );
    return province?.isMetroCity ?? false;
};

// Get province by name or code
export const getProvince = (nameOrCode: string): Province | undefined => {
    return vietnamProvinces.find(
        p => p.name.toLowerCase() === nameOrCode.toLowerCase() ||
            p.code.toLowerCase() === nameOrCode.toLowerCase()
    );
};
