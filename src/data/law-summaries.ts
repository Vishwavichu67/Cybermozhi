import type { LucideIcon } from 'lucide-react';
import { Gavel, Ban, WifiOff, Server, ShieldOff, FileKey, Users, UserCheck } from 'lucide-react';

export type LawSummary = {
  id: string;
  title: string;
  act: string;
  section: string;
  summary: string;
  details: string;
  penalty: string;
  icon: LucideIcon;
};

export const lawSummaries: LawSummary[] = [
  {
    id: '1',
    title: 'Tampering with Computer Source Documents',
    act: 'IT Act, 2000',
    section: 'Section 65',
    summary: 'Prohibits intentionally concealing, destroying, or altering computer source code used for a computer, computer program, computer system or computer network, when the source code is required to be kept or maintained by law.',
    details: 'This section aims to protect the integrity of software and ensure that critical source code, vital for the functioning and understanding of computer systems, is not maliciously altered or hidden.',
    penalty: 'Imprisonment up to three years, or with fine up to two lakh rupees, or with both.',
    icon: FileKey,
  },
  {
    id: '2',
    title: 'Hacking with Computer Systems',
    act: 'IT Act, 2000',
    section: 'Section 66',
    summary: 'Addresses hacking, defined as fraudulent or dishonest acts under section 43 (e.g. unauthorized access, data damage, introducing viruses). If committed dishonestly or fraudulently, it becomes an offense under this section.',
    details: 'This is a broad section covering various malicious activities against computer systems when performed with dishonest intent. It builds upon the civil liabilities defined in Section 43.',
    penalty: 'Imprisonment up to three years, or with fine up to five lakh rupees, or with both.',
    icon: Server,
  },
  {
    id: '3',
    title: 'Punishment for Identity Theft',
    act: 'IT Act, 2000',
    section: 'Section 66C',
    summary: 'Criminalizes the fraudulent or dishonest use of another person\'s electronic signature, password, or any other unique identification feature.',
    details: 'This section specifically targets identity theft in the digital realm, where impersonation can lead to significant financial or reputational harm.',
    penalty: 'Imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh.',
    icon: Users,
  },
  {
    id: '4',
    title: 'Punishment for Cheating by Personation by using Computer Resource',
    act: 'IT Act, 2000',
    section: 'Section 66D',
    summary: 'Punishes cheating by personation using any communication device or computer resource.',
    details: 'This targets individuals who impersonate others online (e.g., creating fake social media profiles for fraudulent purposes) to deceive and cheat victims.',
    penalty: 'Imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh.',
    icon: UserCheck,
  },
  {
    id: '5',
    title: 'Punishment for violation of privacy',
    act: 'IT Act, 2000',
    section: 'Section 66E',
    summary: 'Criminalizes capturing, publishing, or transmitting images of a private area of any person without their consent, under circumstances violating their privacy.',
    details: 'This section is crucial for protecting personal privacy against voyeurism and non-consensual image sharing in the digital age.',
    penalty: 'Imprisonment which may extend to three years or with fine not exceeding two lakh rupees, or with both.',
    icon: ShieldOff,
  },
  {
    id: '6',
    title: 'Punishment for Cyber Terrorism',
    act: 'IT Act, 2000',
    section: 'Section 66F',
    summary: 'Deals with acts of cyber terrorism, including denying access to authorized persons, unauthorized access to or penetration of a computer resource, or introducing contaminants with intent to threaten national security, unity, integrity, or sovereignty, or to strike terror.',
    details: 'This is a serious offense targeting large-scale attacks that can cripple critical infrastructure or threaten national security.',
    penalty: 'Imprisonment for life.',
    icon: WifiOff,
  },
  {
    id: '7',
    title: 'Punishment for publishing or transmitting obscene material in electronic form',
    act: 'IT Act, 2000',
    section: 'Section 67',
    summary: 'Punishes the publication or transmission of material which is lascivious or appeals to the prurient interest or if its effect is such as to tend to deprave and corrupt persons.',
    details: 'This section addresses the dissemination of pornographic or obscene content online. It has different penalties for first conviction and subsequent convictions.',
    penalty: 'First conviction: imprisonment up to three years and fine up to five lakh rupees. Subsequent conviction: imprisonment up to five years and fine up to ten lakh rupees.',
    icon: Ban,
  },
  {
    id: '8',
    title: 'Punishment for publishing or transmitting of material containing sexually explicit act, etc., in electronic form',
    act: 'IT Act, 2000',
    section: 'Section 67A',
    summary: 'Specifically punishes publishing or transmitting material containing sexually explicit acts or conduct.',
    details: 'This section is more specific than Section 67 and focuses on material depicting sexual acts.',
    penalty: 'First conviction: imprisonment up to five years and fine up to ten lakh rupees. Subsequent conviction: imprisonment up to seven years and fine up to ten lakh rupees.',
    icon: Gavel,
  }
];
