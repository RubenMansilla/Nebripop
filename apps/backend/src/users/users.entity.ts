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

    @Column({ name: 'profile_picture', nullable: true })
    profilePicture: string;

    @Column({ name: 'wallet_balance', type: 'numeric', precision: 10, scale: 2, default: 0 })
    walletBalance: number;
}
