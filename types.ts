export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  billboard: Billboard;
}

export interface Image {
  id: string;
  url: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
}
export interface Color {
  id: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  category: Category;
  description: string,
  name: string;
  price: string;
  size: Size;
  color: Color;
  images: Image[];
}

export interface Review {
  id: string;
  productId: string;
  rating: number; // 1-5
  comment?: string;
  name?: string;
  createdAt: string;
}
