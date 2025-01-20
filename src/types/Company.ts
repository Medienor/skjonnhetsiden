interface Link {
  rel?: string;
  href?: string;
  type?: string;
  // Add other potential link properties here
}

interface OrganizationForm {
  kode: string;
  beskrivelse: string;
  links: Link[];
}

interface NaeringsKode {
  kode: string;
  beskrivelse: string;
}

interface Address {
  land: string;
  landkode: string;
  postnummer: string;
  poststed: string;
  adresse: string[];
  kommune: string;
  kommunenummer: string;
}

interface SectorCode {
  kode: string;
  beskrivelse: string;
}

export interface Company {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: OrganizationForm;
  registreringsdatoEnhetsregisteret: string;
  registrertIMvaregisteret: boolean;
  naeringskode1?: NaeringsKode;
  harRegistrertAntallAnsatte: boolean;
  forretningsadresse?: Address;
  stiftelsesdato: string;
  institusjonellSektorkode: SectorCode;
  registrertIForetaksregisteret: boolean;
  registrertIStiftelsesregisteret: boolean;
  registrertIFrivillighetsregisteret: boolean;
  konkurs: boolean;
  underAvvikling: boolean;
  underTvangsavviklingEllerTvangsopplosning: boolean;
  maalform: string;
  vedtektsdato?: string;
  vedtektsfestetFormaal?: string[];
  aktivitet?: string[];
  registreringsdatoForetaksregisteret?: string;
  registrertIPartiregisteret: boolean;
  links: Link[];
  postadresse?: Address;
  sisteInnsendteAarsregnskap?: string;
  registreringsdatoMerverdiavgiftsregisteret?: string;
  registreringsdatoMerverdiavgiftsregisteretEnhetsregisteret?: string;
  registreringsdatoAntallAnsatteEnhetsregisteret?: string;
  registreringsdatoAntallAnsatteNAVAaregisteret?: string;
  telefon?: string;
  mobil?: string;
  hjemmeside?: string;
  // Add new properties for reviews
  reviewScore?: number;
  reviewCount?: number;
}

// You might also want to create a type for companies with reviews
export interface CompanyWithReviews extends Company {
  reviewScore: number;
  reviewCount: number;
} 