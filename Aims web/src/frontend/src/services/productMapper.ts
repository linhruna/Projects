// Mapper functions to convert between API responses and frontend types
import { Product, Book, Newspaper, CD, DVD, ProductType } from '../types';
import { ProductApiResponse, ProductApiRequest } from './api';

// Default weight estimation based on product type (in kg)
const DEFAULT_WEIGHTS: Record<string, number> = {
  BOOK: 0.4,
  CD: 0.15,
  DVD: 0.2,
  NEWSPAPER: 0.1,
};

// Map API response to frontend Product type
export function mapApiToProduct(apiProduct: ProductApiResponse): Product {
  const baseProduct = {
    id: apiProduct.id,
    name: apiProduct.title,
    originalValue: apiProduct.originalValue || apiProduct.currentPrice, // Fallback to currentPrice if not set
    price: apiProduct.currentPrice,
    image: apiProduct.imageURL || 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
    stock: apiProduct.quantity,
    // Ưu tiên lấy weight từ API, fallback về DEFAULT_WEIGHTS nếu không có
    weight: apiProduct.weight ?? DEFAULT_WEIGHTS[apiProduct.category] ?? 0.3,
    description: '', // Backend doesn't have description field
    isActive: apiProduct.quantity > 0,
  };

  const category = apiProduct.category?.toUpperCase();

  switch (category) {
    case 'BOOK':
      return {
        ...baseProduct,
        type: 'book' as const,
        author: apiProduct.authors?.map(a => a.name).join(', ') || '',
        coverType: apiProduct.bookType || 'Paperback',
        publisher: apiProduct.publisher || '',
        publicationDate: apiProduct.publishDate || new Date().toISOString().split('T')[0],
        pages: apiProduct.pages ?? 0,
        language: apiProduct.language || 'Vietnamese',
        genre: apiProduct.genre || '',
      } as Book;

    case 'NEWSPAPER':
      return {
        ...baseProduct,
        type: 'newspaper' as const,
        editor: '', // Backend doesn't have editor field
        publisher: apiProduct.publisher || '',
        publicationDate: apiProduct.publishDate || new Date().toISOString().split('T')[0],
        issueNumber: apiProduct.edition || '',
        frequency: 'Weekly',
        issn: '',
        language: apiProduct.language || 'Vietnamese',
        sections: apiProduct.section ? [apiProduct.section.title] : [],
      } as Newspaper;

    case 'CD':
      return {
        ...baseProduct,
        type: 'cd' as const,
        artist: apiProduct.artist || '',
        recordLabel: apiProduct.recordLabel || '',
        tracks: apiProduct.tracks?.map(t => ({
          name: t.title,
          duration: t.length,
        })) || [],
        genre: apiProduct.musicType || '',
        releaseDate: apiProduct.releaseDate || new Date().toISOString().split('T')[0],
      } as CD;

    case 'DVD':
      return {
        ...baseProduct,
        type: 'dvd' as const,
        discType: apiProduct.discType || 'DVD',
        director: apiProduct.director || '',
        runtime: apiProduct.runTime || 0,
        studio: apiProduct.studio || '',
        language: '', // Backend uses subtitle field
        subtitles: apiProduct.subtitle ? apiProduct.subtitle.split(',').map(s => s.trim()) : [],
        releaseDate: apiProduct.releaseDate || new Date().toISOString().split('T')[0],
        genre: apiProduct.filmType || '',
      } as DVD;

    default:
      // Fallback to book type
      return {
        ...baseProduct,
        type: 'book' as const,
        author: '',
        coverType: 'Paperback',
        publisher: '',
        publicationDate: new Date().toISOString().split('T')[0],
        pages: 0,
        language: 'Vietnamese',
        genre: '',
      } as Book;
  }
}

// Map frontend Product to API request
export function mapProductToApi(product: Product, authorIds?: string[], sectionId?: string): ProductApiRequest {
  const baseRequest: ProductApiRequest = {
    category: product.type.toUpperCase(),
    title: product.name,
    originalValue: product.originalValue,
    currentPrice: product.price,
    quantity: product.stock,
    imageURL: product.image,
    weight: product.weight,
  };

  switch (product.type) {
    case 'book':
      const book = product as Book;
      return {
        ...baseRequest,
        category: 'BOOK',
        publisher: book.publisher,
        publishDate: book.publicationDate || undefined,
        language: book.language,
        bookType: book.coverType,
        authorIds: authorIds || [],
        pages: book.pages,
        genre: book.genre,
      };

    case 'newspaper':
      const newspaper = product as Newspaper;
      return {
        ...baseRequest,
        category: 'NEWSPAPER',
        newspaperPublisher: newspaper.publisher,
        newspaperLanguage: newspaper.language,
        newspaperPublishDate: newspaper.publicationDate || undefined,
        edition: newspaper.issueNumber,
        sectionId: sectionId,
      };

    case 'cd':
      const cd = product as CD;
      return {
        ...baseRequest,
        category: 'CD',
        artist: cd.artist,
        recordLabel: cd.recordLabel,
        musicType: cd.genre,
        cdReleaseDate: cd.releaseDate || undefined,
        trackDetails: cd.tracks.map(t => ({
          title: t.name,
          length: t.duration,
        })),
      };

    case 'dvd':
      const dvd = product as DVD;
      return {
        ...baseRequest,
        category: 'DVD',
        discType: dvd.discType,
        director: dvd.director,
        runTime: dvd.runtime,
        studio: dvd.studio,
        subtitle: dvd.subtitles.join(', '),
        dvdReleaseDate: dvd.releaseDate || undefined,
        filmType: dvd.genre,
      };

    default:
      return baseRequest;
  }
}

// Map product type string to ProductType
export function mapCategoryToProductType(category: string): ProductType {
  const categoryMap: Record<string, ProductType> = {
    BOOK: 'book',
    CD: 'cd',
    DVD: 'dvd',
    NEWSPAPER: 'newspaper',
  };
  return categoryMap[category?.toUpperCase()] || 'book';
}

