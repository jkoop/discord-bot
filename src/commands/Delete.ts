import {Message, TextChannel} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Delete implements ICommand {
	public name = "delete";
	public description = "Deletes a message";
	public aliases = ["del", "rm", "d"];
	public usage = "delete <number of messages to be deleted>";
	@inject(TYPES.Logger) private logger: Logger;
	@inject(TYPES.DeleteConfirmation) private deleteConfirmation: number;
	@inject(TYPES.Prefix) private prefix: string;

	public canHandle(message: Message): boolean {
		return this.getEndOfCommandIndex(message, this.prefix) !== -1;
	}

	public async handle(message: Message): Promise<Message | Message[]> {
		const args = message.content.substring(this.getEndOfCommandIndex(message, this.prefix)).trim().split(" ");

		if (args.length > 0) {
			// check if the first argument is a number
			const num = parseInt(args[0], 10);

			if (Number.isNaN(num)) {
				return Promise.reject("First argument is not a number");
			}

			this.logger.debug(`Deleting ${num} messages`);
			if (message.channel instanceof TextChannel) {
				this.logger.log(`Deleting (${num} + 1) messages from ${message.channel.name}`);
				// add one for the command message
				const deletedMessages = await message.channel.bulkDelete(num + 1);
				// send confirmation message and self destruct
				const msg = await message.channel.send(`Deleted ${deletedMessages.size - 1} messages`);
				if (this.deleteConfirmation > 0) {
					setTimeout(async () => {
						msg.delete();
					}, this.deleteConfirmation);
				}
				return msg;
			}

			return Promise.reject("Channel is not a text channel");
		}
		return Promise.reject("No arguments provided");
	}

	private getEndOfCommandIndex(message: Message, prefix: string): number {
		const commandWithPrefix = message.content.split(" ")[0];

		const alias = [this.name, ...this.aliases].find((alias) =>
			new RegExp(`${prefix}${alias}$`).test(commandWithPrefix),
		);

		if (alias) {
			return message.content.indexOf(commandWithPrefix) + commandWithPrefix.length;
		}

		return -1;
	}
}
