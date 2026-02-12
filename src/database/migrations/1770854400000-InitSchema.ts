import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1770854400000 implements MigrationInterface {
  name = 'InitSchema1770854400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_entity_role_enum" AS ENUM ('ghost', 'candidate', 'pre-accepted', 'pretopien', 'litopien', 'active-litopien', 'inactive-litopien', 'ban', 'refuse', 'litogod', 'unique-god')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_vote_entity_vote_enum" AS ENUM ('for', 'against', 'abstention')`,
    );
    await queryRunner.query(
      `CREATE TABLE "minecraft_user_entity" ("minecraftUUID" uuid NOT NULL, "minecraftNickname" character varying(16), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_minecraft_user_entity" PRIMARY KEY ("minecraftUUID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("expiredAt" bigint NOT NULL, "id" character varying(255) NOT NULL, "json" text NOT NULL, "deleteAt" TIMESTAMP, CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_expiredAt" ON "sessions" ("expiredAt")`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_entity" ("discordID" character varying(32) NOT NULL, "minecraftUserMinecraftUUID" uuid, "discordNickname" character varying(32) NOT NULL, "discordAvatar" character varying, "role" "public"."user_entity_role_enum" NOT NULL DEFAULT 'ghost', "candidature" text, "candidatureDiscordMessageID" character varying(32), "candidatureProposalAt" TIMESTAMP, "candidatureAcceptedAt" TIMESTAMP, "lastActivity" TIMESTAMP NOT NULL DEFAULT CURRENT_DATE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "discordNumberOfInteractions" integer, "discordVoiceTime" integer, CONSTRAINT "UQ_user_entity_minecraft_user" UNIQUE ("minecraftUserMinecraftUUID"), CONSTRAINT "PK_user_entity" PRIMARY KEY ("discordID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_vote_entity" ("voterID" character varying(32) NOT NULL, "votedForID" character varying(32) NOT NULL, "vote" "public"."user_vote_entity_vote_enum" NOT NULL, CONSTRAINT "PK_user_vote_entity" PRIMARY KEY ("voterID", "votedForID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_entity" ADD CONSTRAINT "FK_user_entity_minecraft_user" FOREIGN KEY ("minecraftUserMinecraftUUID") REFERENCES "minecraft_user_entity"("minecraftUUID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vote_entity" ADD CONSTRAINT "FK_user_vote_entity_voter" FOREIGN KEY ("voterID") REFERENCES "user_entity"("discordID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vote_entity" ADD CONSTRAINT "FK_user_vote_entity_voted_for" FOREIGN KEY ("votedForID") REFERENCES "user_entity"("discordID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_vote_entity" DROP CONSTRAINT "FK_user_vote_entity_voted_for"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vote_entity" DROP CONSTRAINT "FK_user_vote_entity_voter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_entity" DROP CONSTRAINT "FK_user_entity_minecraft_user"`,
    );
    await queryRunner.query(`DROP TABLE "user_vote_entity"`);
    await queryRunner.query(`DROP TABLE "user_entity"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_sessions_expiredAt"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "minecraft_user_entity"`);
    await queryRunner.query(`DROP TYPE "public"."user_vote_entity_vote_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_entity_role_enum"`);
  }
}
