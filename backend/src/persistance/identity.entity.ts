import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class IdentityEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    fingerprint: string;

    @Column()
    public_key: string;
}