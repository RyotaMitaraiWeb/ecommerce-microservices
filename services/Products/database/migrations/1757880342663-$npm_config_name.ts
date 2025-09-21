import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1757880342663 implements MigrationInterface {
    name = ' $npmConfigName1757880342663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile" DROP COLUMN "deletedAt"`);
    }

}
