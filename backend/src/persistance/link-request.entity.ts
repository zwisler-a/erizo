import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IdentityEntity} from "./identity.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class LinkRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @ApiProperty()
    @ManyToOne(() => IdentityEntity, {onDelete: 'NO ACTION'})
    @JoinColumn()
    requester: IdentityEntity;

    @ManyToOne(() => IdentityEntity, {onDelete: 'NO ACTION'})
    @JoinColumn()
    requested: IdentityEntity;

    @Column({default: false})
    confirmed: boolean;
}