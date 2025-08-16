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
      'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Київської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання';

    const enExample =
      'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Kyiv City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services';

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
