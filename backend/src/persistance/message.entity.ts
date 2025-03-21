import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class MessageEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    sender_fingerprint: string;

    @ApiProperty()
    @Column()
    recipient_fingerprint: string;

    @ApiProperty()
    @Column()
    message: string;

    @ApiProperty()
    @Column()
    file_path: string;

    @ApiProperty()
    @Column()
    encrypted_key: string;

    @ApiProperty()
    @Column()
    iv: string;

    @ApiProperty()
    @Column({default: () => new Date().getTime()})
    created_at: number;
}