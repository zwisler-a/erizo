import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {IdentityEntity} from "./identity.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class LinkRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @ApiProperty()
    @OneToOne(() => IdentityEntity, {onDelete: 'NO ACTION'})
    @JoinColumn()
    requester: IdentityEntity;

    @OneToOne(() => IdentityEntity, {onDelete: 'NO ACTION'})
    @JoinColumn()
    requested: IdentityEntity;

    @Column({default: false})
    confirmed: boolean;
}