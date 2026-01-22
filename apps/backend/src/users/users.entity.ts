import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'birth_date', type: 'date', nullable: true })
    birthDate: string | null;

    @Column({ name: 'gender', type: 'text', nullable: true })
    gender: string | null;

    @Column({
        name: 'profile_picture',
        nullable: false,
        default:
            "https://zxetwkoirtyweevvatuf.supabase.co/storage/v1/object/sign/userImg/Default_Profile_Picture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kYWMwYTY1NC1mOTY4LTQyNjYtYmVlYy1lYjdkY2EzNmI2NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VySW1nL0RlZmF1bHRfUHJvZmlsZV9QaWN0dXJlLnBuZyIsImlhdCI6MTc2NDU4MzQ3OSwiZXhwIjoxNzk2MTE5NDc5fQ.yJUBlEuws9Tl5BK9tIyMNtKp52Jj8reTF_y_a71oR1I"
    })
    profilePicture: string;

    @Column({ name: 'wallet_balance', type: 'numeric', precision: 10, scale: 2, default: 0 })
    walletBalance: number;

    @Column({ type: 'text', nullable: true })
    refreshToken: string | null;

    @Column({ name: 'penalties_count', default: 0 })
    penaltiesCount: number;
}
