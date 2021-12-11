import {Message} from "discord.js";
import {inject, injectable} from "inversify";
import {Logger} from "../logger";
import {TYPES} from "../types";
import {ICommand} from "./ICommand";

@injectable()
export class Sarcasm implements ICommand {
	public name = "sarcasm";
	public description = "converts message into alternating-caps";
	@inject(TYPES.Logger) private logger: Logger;
	@inject(TYPES.Prefix) private prefix: string;

	public canHandle(message: Message): boolean {
		return message.content.startsWith(this.prefix + this.name);
	}

	public handle(message: Message): Promise<Message | Message[]> {
		const content = message.content.substring(this.getEndOfCommandIndex(message, this.prefix)).trim();

		if (content) {
			return message.reply(this.altenateCaps(content));
		}
		return message.reply("I don't know what to do with that");
	}

	private altenateCaps(s: string): string {
		return s
			.split("")
			.map((char, index) => {
				return index % 2 === 0 ? char.toUpperCase() : char.toLowerCase();
			})
			.join("");
	}
}
