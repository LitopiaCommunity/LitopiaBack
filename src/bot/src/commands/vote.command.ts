import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes
} from "@discord-nestjs/core";
import { TransformPipe } from "@discord-nestjs/common";
import { Injectable } from "@nestjs/common";
import { VoteDto } from "./dto/vote.dto";
import { UsersVotesService } from "../../../models/users-votes/users-votes.service";
import { UserEntity } from "../../../models/users/user.entity";
import { VoteType } from "../../../models/users-votes/user-vote.entity";
import { APIEmbed } from "discord.js";
import { UsersService } from "../../../models/users/users.service";

@Command({
  name: "vote",
  description: "Commande pour afficher vos votes",
  defaultMemberPermissions:["ViewChannel"]
})
@UsePipes(TransformPipe)
@Injectable()
export class VoteCommand implements DiscordTransformedCommand<VoteDto> {

  constructor(private usersVoteService:UsersVotesService,private userService: UsersService) {
  }

  async handler(@Payload() dto: VoteDto, { interaction }: TransformedCommandExecutionContext) {
    if(dto.userId){
      const user = await this.userService.findOne(dto.userId);
      if(user){
        return this.generateCandidateVoteEmbed(user);
      }
    }else{
      const userVote = await this.userService.findOne(interaction.member.user.id);
      return this.generateUserVoteEmbed(userVote);
    }
  }


  async generateUserVoteEmbed(userVote: UserEntity) {
    const voteForYou = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.FOR);
    const voteAgainstYou = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.AGAINST);
    const voteAbstention = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.ABSTENTION);
    const yourVoteFor = await this.usersVoteService.getNumberOfVotesFromVoter(userVote, VoteType.FOR);
    const yourVoteAgainst = await this.usersVoteService.getNumberOfVotesFromVoter(userVote, VoteType.AGAINST);
    const yourVoteAbstention = await this.usersVoteService.getNumberOfVotesFromVoter(userVote, VoteType.ABSTENTION);
    const yourTotalVote = yourVoteFor + yourVoteAgainst + yourVoteAbstention;
    const yourVote = await this.usersVoteService.getVoteFromUserToUserThatAreCandidate(userVote);

    let yourVoteString = "";
    if (yourVote) {
      for (const vote of yourVote) {
        yourVoteString += `- ${vote.vote === VoteType.FOR ? '👍' : vote.vote === VoteType.AGAINST ? '👎' : '🤷'} : \`${vote.votedFor.discordNickname}\`\n`;
      }
    }

    let fields = []
    if (voteForYou > 0) {
      fields = [
        {
          name: "Votes pour vous",
          value: voteForYou.toString(),
          inline: true
        },
        {
          name: "Votes contre vous",
          value: voteAgainstYou.toString(),
          inline: true
        },
        {
          name: "Votes d'abstention",
          value: voteAbstention.toString(),
          inline: true
        }
      ]
    }

    if (yourTotalVote> 0) {
      fields.push(
        {
          name: "Votes pour",
          value: yourVoteFor.toString(),
          inline: true
        },
        {
          name: "Votes contre",
          value: yourVoteAgainst.toString(),
          inline: true
        },
        {
          name: "Votes d'abstention",
          value: yourVoteAbstention.toString(),
          inline: true
        }
      )
    }

    if (yourVoteString.length > 0){
      fields.push({
        name: "Votes que vous avez fait",
        value: yourVoteString,
        inline: false
      })
    }

    const embed: APIEmbed = {
      title: "Informations sur vos votes",
      color: 0x00ff00,
      fields
    }
    return { embeds: [embed] };
  }

  async generateCandidateVoteEmbed(userVote: UserEntity) {
    const voteFor = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.FOR);
    const voteAgainst = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.AGAINST);
    const voteAbstention = await this.usersVoteService.getNumberOfSelectedVotes(userVote, VoteType.ABSTENTION);
    const totalVote = voteFor + voteAgainst + voteAbstention;
    const voteOfUser = await this.usersVoteService.getListOfUserThatHaveVoteForUser(userVote);
    let voteOfUserString = "";
    if (voteOfUser) {
      for (const vote of voteOfUser) {
        voteOfUserString += `- ${vote.vote === VoteType.FOR ? '👍' : vote.vote === VoteType.AGAINST ? '👎' : '🤷'} : \`${vote.voter.discordNickname}\`\n`;
      }
    }
    let fields;
    if (totalVote > 0) {
      fields = [
        {
          name: "Votes pour",
          value: voteFor.toString(),
          inline: true
        },
        {
          name: "Votes contre",
          value: voteAgainst.toString(),
          inline: true
        },
        {
          name: "Votes d'abstention",
          value: voteAbstention.toString(),
          inline: true
        }
      ]
      if (voteOfUserString.length > 0){
        fields.push({
          name: "Personne qui ont voté pour "+userVote.discordNickname,
          value: voteOfUserString,
          inline: false
        })
      }
    }else{
      fields = [
        {
          name: "Pas de donnes",
          value: "Impossible de retrouver les données de vote de "+userVote.discordNickname,
        }
      ]
    }


    const embed: APIEmbed = {
      title: "Informations sur les votes",
      color: 0x00ff00,
      fields
    }
    return { embeds: [embed] };
  }

}