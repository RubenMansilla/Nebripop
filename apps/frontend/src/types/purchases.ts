export interface TransactionProps {
    item: {
        id: number | string;
        purchasedAt: string | Date;
        price: number;
        transaction_type: 'expense' | 'income';
        product?: {
            name: string;
            images?: { image_url: string }[];
        };
    };
    onClick?: () => void;
}