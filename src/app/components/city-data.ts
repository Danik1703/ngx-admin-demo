
import { LatLngTuple } from 'leaflet';

export interface City {
  name: string;
  coords: LatLngTuple;
  bitcoin: string;
  ethereum: string;
}

export const CITY_DATA: City[] = [
  { name: 'Київ 🇺🇦', coords: [50.4501, 30.5234], bitcoin: '$70,000', ethereum: '$3,500' },
  { name: 'Львів 🇺🇦', coords: [49.8397, 24.0297], bitcoin: '$69,000', ethereum: '$3,400' },
  { name: 'Одеса 🇺🇦', coords: [46.4825, 30.7233], bitcoin: '$68,500', ethereum: '$3,300' },
  { name: 'Харків 🇺🇦', coords: [49.9935, 36.2304], bitcoin: '$68,700', ethereum: '$3,320' },
  { name: 'Дніпро 🇺🇦', coords: [48.4647, 35.0462], bitcoin: '$68,600', ethereum: '$3,310' },

  { name: 'Нью-Йорк 🇺🇸', coords: [40.7128, -74.0060], bitcoin: '$72,000', ethereum: '$3,600' },
  { name: 'Сан-Франциско 🇺🇸', coords: [37.7749, -122.4194], bitcoin: '$72,500', ethereum: '$3,620' },
  { name: 'Торонто 🇨🇦', coords: [43.6532, -79.3832], bitcoin: '$71,800', ethereum: '$3,570' },

  { name: 'Токіо 🇯🇵', coords: [35.6895, 139.6917], bitcoin: '$71,500', ethereum: '$3,550' },
  { name: 'Сеул 🇰🇷', coords: [37.5665, 126.9780], bitcoin: '$71,200', ethereum: '$3,540' },

  { name: 'Лондон 🇬🇧', coords: [51.5074, -0.1278], bitcoin: '$70,500', ethereum: '$3,520' },
  { name: 'Париж 🇫🇷', coords: [48.8566, 2.3522], bitcoin: '$69,800', ethereum: '$3,480' },
  { name: 'Берлін 🇩🇪', coords: [52.5200, 13.4050], bitcoin: '$69,900', ethereum: '$3,490' },
  { name: 'Амстердам 🇳🇱', coords: [52.3676, 4.9041], bitcoin: '$69,700', ethereum: '$3,470' },

  { name: 'Сідней 🇦🇺', coords: [-33.8688, 151.2093], bitcoin: '$70,100', ethereum: '$3,510' },
  { name: 'Ріо-де-Жанейро 🇧🇷', coords: [-22.9068, -43.1729], bitcoin: '$68,800', ethereum: '$3,330' },
  { name: 'Дубай 🇦🇪', coords: [25.276987, 55.296249], bitcoin: '$70,900', ethereum: '$3,540' }
];

