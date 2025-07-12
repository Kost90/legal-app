import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class AddAuthorityList1751876257657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "authority_list_document_enum" AS ENUM('power-of-attorney-property')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'authority_list',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'document',
            type: 'authority_list_document_enum',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'authoritiesUk',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'authoritiesEn',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraint(
      'authority_list',
      new TableUnique({
        name: 'UQ_authority_list_city_document',
        columnNames: ['city', 'document'],
      }),
    );

    await queryRunner.query(`
      INSERT INTO "authority_list" ("document", "city", "authoritiesUk", "authoritiesEn")
VALUES 
  (
    'power-of-attorney-property',
    'Київ',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Київської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Kyiv City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  ),
  (
    'power-of-attorney-property',
    'Львів',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Львівської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Lviv City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  ),
  (
    'power-of-attorney-property',
    'Одеса',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Одеської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Odesa City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  ),
    (
    'power-of-attorney-property',
    'Харків',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Харківської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Kharkiv City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  ),
  (
    'power-of-attorney-property',
    'Дніпро',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Дніпровської міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Dnipro City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  ),
  (
    'power-of-attorney-property',
    'Запоріжжя',
    'установах, підприємствах та організаціях, незалежно від їх підпорядкування, форм власності та галузевої належності, в державних, громадських, господарських організаціях, в органах державної влади та місцевого самоврядування, їх структурних підрозділах, виконавчих органах, районній державній адміністрації, міській, районній, сільській, селищній раді, фондах, інспекціях, комісіях та комітетах, міністерствах, відомствах, їх структурних підрозділах тощо, в органах Міністерства юстиції, у відповідних структурних підрозділах Міністерства внутрішніх справ України, в органах національної поліції України, в архівних установах, органах реєстрації актів цивільного стану громадян, в Державних податкових органах, Департаменті державної реєстрації та нотаріату, його структурних підрозділах, перед державними реєстраторами, Центрі надання адміністративних послуг, управліннях та відділах Держгеокадастру, Державному підприємстві «Центр державного земельного кадастру», Державного кадастрового реєстратора відповідного територіального підрозділу Держгеокадастру, управліннях архітектури та будівництва, Комунальному підприємстві «Бюро технічної інвентаризації» Запорізької міської ради, експертно-оціночних організаціях, в нотаріальних конторах, перед приватними нотаріусами, будь-яких банківських установах, органах пожежної безпеки, санітарно-епідеміологічної станції, адресному бюро, житлово-комунальних організаціях або організаціях, їх замінюючих, ДЕЗах, службах газо-, енерго- та водопостачання',
    'institutions, enterprises, and organizations, regardless of their subordination, forms of ownership, and industry affiliation, in state, public, and commercial organizations, in bodies of state power and local self-government, their structural subdivisions, executive bodies, district state administration, city, district, village, town council, funds, inspections, commissions and committees, ministries, agencies, their structural subdivisions, etc., in bodies of the Ministry of Justice, in the relevant structural subdivisions of the Ministry of Internal Affairs of Ukraine, in the national police bodies of Ukraine, in archival institutions, in civil status registration bodies, in the State Tax authorities, the Department of State Registration and Notary, its structural subdivisions, before state registrars, the Center for the Provision of Administrative Services, departments and divisions of the State Geocadastre, the State Enterprise "Center of the State Land Cadastre", the State Cadastral Registrar of the relevant territorial subdivision of the State Geocadastre, architecture and construction departments, the Communal Enterprise "Bureau of Technical Inventory" of the Zaporizhzhia City Council, in expert appraisal organizations, in notary offices, before private notaries, in any banking institutions, fire safety authorities, sanitary and epidemiological stations, address bureaus, housing and communal organizations or their substitutes, housing maintenance offices (DEZ), gas, energy, and water supply services'
  );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('authority_list');
    await queryRunner.query(`DROP TYPE "authority_list_document_enum"`);
  }
}
