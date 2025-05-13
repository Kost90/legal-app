import { CITIES } from 'src/common/constants/city.enum';

export const cityMap: Record<string, CITIES> = {
  kyiv: CITIES.KYIV,
  kiev: CITIES.KYIV,
  київ: CITIES.KYIV,

  lviv: CITIES.LVIV,
  львів: CITIES.LVIV,

  odesa: CITIES.ODESA,
  odessa: CITIES.ODESA,
  одеса: CITIES.ODESA,
  одесса: CITIES.ODESA,

  dnipro: CITIES.DNIPRO,
  dnepr: CITIES.DNIPRO,
  дніпро: CITIES.DNIPRO,
  днепр: CITIES.DNIPRO,

  kharkiv: CITIES.KHARKIV,
  kharkov: CITIES.KHARKIV,
  харків: CITIES.KHARKIV,
  харьков: CITIES.KHARKIV,

  zaporizhzhia: CITIES.ZAPORIZHZHIA,
  zaporozhye: CITIES.ZAPORIZHZHIA,
  запоріжжя: CITIES.ZAPORIZHZHIA,
  запорожье: CITIES.ZAPORIZHZHIA,
};
