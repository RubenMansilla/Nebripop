export interface ReviewType {
    id: number;
    rating: number;
    comment: string;
    created_at: string;

    reviewer: {
        id: number;
        fullName: string;
        profilePicture?: string;
        createdAt: string;
    };

    product: {
        id: number;
        name: string;
        images: { image_url: string }[];
    };
}

export interface ReviewSummary {
    average: number; // media entre 0 y 5
    total: number;   // número de valoraciones
}

