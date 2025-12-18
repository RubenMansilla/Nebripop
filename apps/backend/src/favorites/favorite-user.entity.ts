import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/users.entity";

@Entity("favorites_users")
export class FavoriteUser {

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  favorite_user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "favorite_user_id" })
  favoriteUser: User;
}
