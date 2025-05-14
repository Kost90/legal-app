import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { DOCUMENT_LANG } from 'src/common/constants/documents-type.enum';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiClient: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.aiClient = new OpenAI({
      apiKey: configService.get('secretKey'),
    });
  }

  public async getAuthorityByCityForProperty(city: string, lang: DOCUMENT_LANG): Promise<string> {
    try {
      const prompt = this.generatePrompt(city, lang);
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

      this.logger.log(`Generated authority list for ${city} (${lang}) succsessfully`);
      return output;
    } catch (error) {
      this.logger.error(`AI generation failed for city ${city}:`, error);
      throw new BadRequestException('Failed to generate authority list.');
    }
  }

  private generatePrompt(city: string, lang: DOCUMENT_LANG): string {
    const ukExample =
      'органах державної влади, управліннях та департаментах місцевого самоврядування Одеської міської ради, районних адміністраціях, нотаріальних конторах, Укрдержреєстрі та інших структурних підрозділах Міністерства юстиції України, БТІ та інших органах виконавчої влади';

    const enExample =
      'public authorities, departments and divisions of local self-government of Odesa City Council, district administrations, notary offices, the State Register and other structural units of the Ministry of Justice of Ukraine, BTI and other executive authorities';

    return lang === DOCUMENT_LANG.UA
      ? `Згенеруй юридично сформульований перелік органів влади, служб, державних та приватних структур, які беруть участь у переоформленні або приватизації нерухомості у місті ${city}. Форматуй як фрагмент з шаблону довіреності, через кому. Ось приклад формулювання: ${ukExample}.`
      : `Generate a legally formulated list of government authorities, services, state and private institutions involved in the re-registration or privatization of real estate in the city of ${city}. Format it as a fragment from a power of attorney template, using commas. Here's an example: ${enExample}.`;
  }
}
