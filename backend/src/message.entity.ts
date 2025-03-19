import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    recipient_public_key: string;

    @Column()
    sender_public_key: string;

    @Column()
    encrypted_data: string;

    @Column()
    recipient_key: string;

    @Column()
    sender_key: string;

    @Column()
    iv: string;

    @Column({default: () => new Date().getTime()})
    created_at: number;
}