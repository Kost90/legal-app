import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { DOCUMENT_LANG } from 'src/common/constants/documents-type.enum';
import { parseAndCleanMultiLanguageText, ParsedAiText } from 'src/common/utilities/ai-text-parser.utility';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiClient: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.aiClient = new OpenAI({
      apiKey: configService.get('secretKey'),
    });
  }

  public async getAuthorityByCityForProperty(city: string, lang: DOCUMENT_LANG): Promise<ParsedAiText> {
    try {
      // TODO: По типу документа, подставлять нужный промт
      const prompt = this.generatePrompt(city);
      const completion = await this.aiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant that generates legally accurate lists of government bodies and institutions for real estate power of attorney templates in Ukraine.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const output = completion.choices?.[0]?.message?.content?.trim();

      if (!output) {
        this.logger.error(`Empty AI response for city: ${city}`);
        throw new NotFoundException('AI response was empty.');
      }

      const parsedOutput = parseAndCleanMultiLanguageText(output);

      if (!parsedOutput || !parsedOutput.uk || !parsedOutput.en) {
        this.logger.error(`Failed to parse any language from AI response for city: ${city}. Raw: ${output}`);
        throw new BadRequestException('Failed to parse AI response into languages.');
      }

      this.logger.log(`Generated authority list for ${city} (${lang}) succsessfully`);
      return parsedOutput;
    } catch (error) {
      this.logger.error(`AI generation failed for city ${city}:`, error);
      throw new BadRequestException('Failed to generate authority list.');
    }
  }

  private generatePrompt(city: string): string {
    const ukExample =
      'органах державної влади, управліннях та департаментах місцевого самоврядування Одеської міської ради, районних адміністраціях, нотаріальних конторах, Укрдержреєстрі та інших структурних підрозділах Міністерства юстиції України в Одеській області та інших органах виконавчої влади';

    const enExample =
      'public authorities, departments and divisions of local self-government of Odesa City Council, district administrations, notary offices, the State Register and other structural units of the Ministry of Justice of Ukraine in Odesa region and other executive authorities';

    return `
Згенеруй юридично сформульований перелік органів влади, служб, державних та приватних структур, які беруть участь у переоформленні або приватизації нерухомості у місті ${city}.
Надай відповідь двома мовами: українською та англійською.
Форматуй відповідь чітко, використовуючи наступні роздільники перед кожним мовним блоком:
---UKRAINIAN_START---
[тут текст українською, приклад: ${ukExample}]
---UKRAINIAN_END---
---ENGLISH_START---
[тут текст англійською, приклад: ${enExample}]
---ENGLISH_END---

Переконайся, що текст для кожної мови знаходиться МІЖ відповідними START та END маркерами.
Не додавай жодних інших пояснень чи тексту поза цими блоками.
Форматуй список через кому, як фрагмент з шаблону довіреності.
`;
  }
}
